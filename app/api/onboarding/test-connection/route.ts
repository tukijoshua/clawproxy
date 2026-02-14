import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { applyRoutingRules } from '@/lib/proxy/router'
import { calculateCost, calculateEstimatedDirectCost } from '@/lib/proxy/cost'
import { getServiceClient } from '@/lib/supabase/service'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const TEST_MODEL = 'openai/gpt-4o'
const FALLBACK_MODEL = 'google/gemini-2.0-flash-lite-001'

export async function POST() {
  const startTime = Date.now()

  // Auth via session cookie
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { success: false, errorType: 'server_config', message: 'Not authenticated' },
      { status: 401 },
    )
  }

  // Look up user's active API key
  const serviceClient = getServiceClient()
  const { data: keyRecord } = await serviceClient
    .from('api_keys')
    .select('id, label')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!keyRecord) {
    return NextResponse.json(
      { success: false, errorType: 'no_api_key', message: 'No active API key found. Go back and generate one.' },
      { status: 400 },
    )
  }

  // Apply routing rules to see what the model would be routed to
  const routeResult = await applyRoutingRules(user.id, TEST_MODEL)
  const actualModel = routeResult.ruleApplied ? routeResult.model : FALLBACK_MODEL

  // Call OpenRouter with a simple test prompt
  const requestBody = {
    model: actualModel,
    messages: [
      { role: 'user', content: 'Say "ClawProxy connection successful!" in exactly those words, then add one short fun fact about saving money.' },
    ],
    max_tokens: 100,
  }

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://clawproxy.ai',
        'X-Title': 'ClawProxy',
      },
      body: JSON.stringify(requestBody),
    })
  } catch {
    return NextResponse.json(
      { success: false, errorType: 'network_error', message: 'Could not reach upstream provider. Check your network connection.' },
      { status: 502 },
    )
  }

  if (!upstreamRes.ok) {
    let detail = 'Unknown error'
    try {
      const errBody = await upstreamRes.json()
      detail = errBody?.error?.message ?? JSON.stringify(errBody).slice(0, 200)
    } catch {
      // ignore
    }
    return NextResponse.json(
      { success: false, errorType: 'upstream_error', message: `Upstream provider error: ${detail}` },
      { status: 502 },
    )
  }

  let responseBody: Record<string, unknown>
  try {
    responseBody = await upstreamRes.json()
  } catch {
    return NextResponse.json(
      { success: false, errorType: 'upstream_error', message: 'Invalid response from upstream provider.' },
      { status: 502 },
    )
  }

  // Extract usage and response text
  const usage = (responseBody as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage
  const promptTokens = usage?.prompt_tokens ?? 0
  const completionTokens = usage?.completion_tokens ?? 0
  const choices = (responseBody as { choices?: Array<{ message?: { content?: string } }> }).choices
  const responseText = choices?.[0]?.message?.content ?? ''

  // Calculate costs
  const { cost } = calculateCost(actualModel, promptTokens, completionTokens)
  const estimatedDirectCost = calculateEstimatedDirectCost(TEST_MODEL, actualModel, promptTokens, completionTokens)
  const savings = estimatedDirectCost - cost
  const savingsPercent = estimatedDirectCost > 0 ? Math.round((savings / estimatedDirectCost) * 100) : 0

  const latencyMs = Date.now() - startTime

  // Log this test request and update last_used_at so agent shows as "connected"
  await Promise.all([
    serviceClient.from('request_logs').insert({
      user_id: user.id,
      api_key_id: keyRecord.id,
      model: actualModel,
      requested_model: TEST_MODEL,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
      cost,
      estimated_direct_cost: estimatedDirectCost,
      latency_ms: latencyMs,
      status: 'success',
      agent_label: keyRecord.label ?? 'Connection Test',
    }),
    serviceClient
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyRecord.id),
  ])

  return NextResponse.json({
    success: true,
    originalModel: TEST_MODEL,
    routedModel: actualModel,
    ruleApplied: routeResult.ruleApplied,
    cost,
    estimatedDirectCost,
    savings,
    savingsPercent,
    latencyMs,
    responseText,
    promptTokens,
    completionTokens,
  })
}
