import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { validateApiKey } from '@/lib/proxy/auth'
import { checkBudget } from '@/lib/proxy/budget-guard'
import { hashRequest, detectLoop } from '@/lib/proxy/loop-detector'
import { applyRoutingRules } from '@/lib/proxy/router'
import { calculateCost, calculateEstimatedDirectCost } from '@/lib/proxy/cost'
import { normalizeModelId } from '@/lib/proxy/models'
import { getServiceClient } from '@/lib/supabase/service'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

function extractKey(request: Request): string | null {
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7)
    if (token.startsWith('cp_sk_')) return token
  }
  const header = request.headers.get('x-clawproxy-key')
  if (header?.startsWith('cp_sk_')) return header
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const startTime = Date.now()
  const { path } = await params
  const pathStr = path.join('/')

  // 1. Extract and validate key
  const rawKey = extractKey(request)
  if (!rawKey) {
    return NextResponse.json(
      { error: { message: 'Missing or invalid API key. Use Authorization: Bearer cp_sk_...' } },
      { status: 401 },
    )
  }

  const keyData = await validateApiKey(rawKey)
  if (!keyData) {
    return NextResponse.json(
      { error: { message: 'Invalid API key' } },
      { status: 401 },
    )
  }

  const { userId, apiKeyId, label, user } = keyData

  // 2. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const rawModel = (body.model as string) ?? 'openai/gpt-4o-mini'
  const requestedModel = normalizeModelId(rawModel)
  const isStreaming = body.stream === true

  // 3. Budget check
  const budgetResult = await checkBudget(userId, user.plan, user.daily_budget, user.monthly_budget)
  if (!budgetResult.allowed) {
    await logRequest({
      userId,
      apiKeyId,
      model: requestedModel,
      requestedModel,
      status: 'budget_exceeded',
      agentLabel: label,
      errorMessage: budgetResult.reason ?? 'Budget exceeded',
      latencyMs: Date.now() - startTime,
    })
    return NextResponse.json(
      { error: { message: budgetResult.reason, type: 'budget_exceeded' } },
      { status: 429 },
    )
  }

  // 4. Loop detection
  const reqHash = hashRequest(body as { model?: string; messages?: Array<{ role?: string; content?: string }> })
  const isLoop = await detectLoop(userId, reqHash, user.plan)
  if (isLoop) {
    await logRequest({
      userId,
      apiKeyId,
      model: requestedModel,
      requestedModel,
      status: 'loop_killed',
      agentLabel: label,
      requestHash: reqHash,
      errorMessage: 'Loop detected: >10 identical requests in 60s',
      latencyMs: Date.now() - startTime,
    })
    return NextResponse.json(
      { error: { message: 'Loop detected: too many identical requests. Blocked to prevent runaway spending.', type: 'loop_killed' } },
      { status: 429 },
    )
  }

  // 5. Apply routing rules
  const routeResult = await applyRoutingRules(userId, requestedModel)
  const actualModel = routeResult.model

  // 6. Build upstream request
  const upstreamBody = {
    ...body,
    model: actualModel,
    ...(isStreaming ? { stream_options: { include_usage: true } } : {}),
  }

  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://clawproxy.ai',
    'X-Title': 'ClawProxy',
  }

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(`${OPENROUTER_BASE}/${pathStr}`, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(upstreamBody),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upstream fetch failed'
    await logRequest({
      userId,
      apiKeyId,
      model: actualModel,
      requestedModel,
      status: 'error',
      agentLabel: label,
      requestHash: reqHash,
      errorMessage: msg,
      latencyMs: Date.now() - startTime,
    })
    return NextResponse.json(
      { error: { message: 'Failed to reach upstream provider' } },
      { status: 502 },
    )
  }

  // 7. Handle streaming response
  if (isStreaming) {
    const reader = upstreamRes.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: { message: 'No stream from upstream' } }, { status: 502 })
    }

    let promptTokens = 0
    let completionTokens = 0
    const decoder = new TextDecoder()
    let buffer = ''

    // Create a promise that resolves when the stream ends,
    // so we can use waitUntil at the top level
    let resolveStreamDone: () => void
    const streamDonePromise = new Promise<void>((resolve) => {
      resolveStreamDone = resolve
    })

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read()
          if (done) {
            controller.close()
            // Signal that stream is done — logging happens via waitUntil below
            resolveStreamDone()
            return
          }

          const text = decoder.decode(value, { stream: true })
          buffer += text

          // Parse SSE lines for usage info
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.usage) {
                  promptTokens = parsed.usage.prompt_tokens ?? promptTokens
                  completionTokens = parsed.usage.completion_tokens ?? completionTokens
                }
              } catch {
                // Not valid JSON, skip
              }
            }
          }

          controller.enqueue(value)
        } catch {
          controller.close()
          resolveStreamDone()
        }
      },
    })

    // Register the logging work with waitUntil at the REQUEST level
    // This keeps the function alive after the stream response is sent
    waitUntil(
      streamDonePromise.then(() => {
        const { cost } = calculateCost(actualModel, promptTokens, completionTokens)
        const estDirect = calculateEstimatedDirectCost(requestedModel, actualModel, promptTokens, completionTokens)
        return logRequest({
          userId,
          apiKeyId,
          model: actualModel,
          requestedModel,
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          cost,
          estimatedDirectCost: estDirect,
          status: 'success',
          agentLabel: label,
          requestHash: reqHash,
          latencyMs: Date.now() - startTime,
        })
      })
    )

    return new Response(stream, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  // 8. Handle non-streaming response
  let responseBody: Record<string, unknown>
  try {
    responseBody = await upstreamRes.json()
  } catch {
    await logRequest({
      userId,
      apiKeyId,
      model: actualModel,
      requestedModel,
      status: 'error',
      agentLabel: label,
      requestHash: reqHash,
      errorMessage: 'Failed to parse upstream response',
      latencyMs: Date.now() - startTime,
    })
    return NextResponse.json(
      { error: { message: 'Invalid response from upstream' } },
      { status: 502 },
    )
  }

  if (!upstreamRes.ok) {
    await logRequest({
      userId,
      apiKeyId,
      model: actualModel,
      requestedModel,
      status: 'error',
      agentLabel: label,
      requestHash: reqHash,
      errorMessage: JSON.stringify(responseBody).slice(0, 500),
      latencyMs: Date.now() - startTime,
    })
    return NextResponse.json(responseBody, { status: upstreamRes.status })
  }

  // Extract token usage
  const usage = (responseBody as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage
  const promptTokens = usage?.prompt_tokens ?? 0
  const completionTokens = usage?.completion_tokens ?? 0
  const { cost } = calculateCost(actualModel, promptTokens, completionTokens)
  const estDirect = calculateEstimatedDirectCost(requestedModel, actualModel, promptTokens, completionTokens)

  await logRequest({
    userId,
    apiKeyId,
    model: actualModel,
    requestedModel,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    cost,
    estimatedDirectCost: estDirect,
    status: 'success',
    agentLabel: label,
    requestHash: reqHash,
    latencyMs: Date.now() - startTime,
  })

  return NextResponse.json(responseBody)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const pathStr = path.join('/')

  // Pass-through to OpenRouter for /models and similar GET endpoints
  const rawKey = extractKey(request)
  if (!rawKey) {
    return NextResponse.json(
      { error: { message: 'Missing or invalid API key' } },
      { status: 401 },
    )
  }

  const keyData = await validateApiKey(rawKey)
  if (!keyData) {
    return NextResponse.json(
      { error: { message: 'Invalid API key' } },
      { status: 401 },
    )
  }

  const res = await fetch(`${OPENROUTER_BASE}/${pathStr}`, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://clawproxy.ai',
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

// --- Logging helper ---

interface LogEntry {
  userId: string
  apiKeyId: string
  model: string
  requestedModel: string | null
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  cost?: number
  estimatedDirectCost?: number
  status: string
  agentLabel: string
  requestHash?: string
  errorMessage?: string
  latencyMs: number
}

async function logRequest(entry: LogEntry) {
  const supabase = getServiceClient()

  // Log the request
  const { error: logError } = await supabase.from('request_logs').insert({
    user_id: entry.userId,
    api_key_id: entry.apiKeyId,
    model: entry.model,
    requested_model: entry.requestedModel,
    prompt_tokens: entry.promptTokens ?? 0,
    completion_tokens: entry.completionTokens ?? 0,
    total_tokens: entry.totalTokens ?? 0,
    cost: entry.cost ?? 0,
    estimated_direct_cost: entry.estimatedDirectCost ?? 0,
    latency_ms: entry.latencyMs,
    status: entry.status,
    agent_label: entry.agentLabel,
    request_hash: entry.requestHash ?? null,
    error_message: entry.errorMessage ?? null,
  })

  if (logError) {
    console.error('[ClawProxy] Failed to log request:', logError.message)
  }

  // Update last_used_at on the API key
  const { error: updateError } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', entry.apiKeyId)

  if (updateError) {
    console.error('[ClawProxy] Failed to update last_used_at:', updateError.message)
  }
}
