import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/proxy/test
 *
 * Runs a real 4-step connection test:
 * 1. Check server + database readiness (request_logs table exists)
 * 2. Validate the user has at least one active API key
 * 3. Send a minimal request through OpenRouter to verify the upstream key
 * 4. Verify logging works (write + read a test log entry)
 *
 * Returns step-by-step results so the UI can animate each check.
 */
export async function POST() {
  const results: {
    step: string
    status: 'pass' | 'fail'
    message: string
    detail?: string
  }[] = []

  // ── Step 1: Server + database readiness ──
  try {
    const supabase = getServiceClient()
    const { error } = await supabase
      .from('request_logs')
      .select('id')
      .limit(1)

    if (error) {
      results.push({
        step: 'server',
        status: 'fail',
        message: 'Database not ready',
        detail: error.message.includes('does not exist')
          ? 'The request_logs table has not been created yet. Go to your Supabase SQL Editor and run the migration file at supabase/migrations/001_add_request_logs.sql'
          : error.message,
      })
      return NextResponse.json({ results })
    }

    results.push({
      step: 'server',
      status: 'pass',
      message: 'Server and database ready',
    })
  } catch (err) {
    results.push({
      step: 'server',
      status: 'fail',
      message: 'Cannot reach database',
      detail: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json({ results })
  }

  // ── Step 2: User has at least one API key ──
  let userId: string | null = null
  let apiKeyPrefix: string | null = null
  try {
    const cookieClient = await createClient()
    const { data: { user }, error: authErr } = await cookieClient.auth.getUser()
    if (authErr || !user) {
      results.push({
        step: 'api_key',
        status: 'fail',
        message: 'Not authenticated',
        detail: 'Please log in first, then retry the connection test.',
      })
      return NextResponse.json({ results })
    }
    userId = user.id

    const { data: keys, error: keyErr } = await cookieClient
      .from('api_keys')
      .select('id, key_prefix, is_active')
      .eq('is_active', true)
      .limit(1)

    if (keyErr || !keys || keys.length === 0) {
      results.push({
        step: 'api_key',
        status: 'fail',
        message: 'No active API key found',
        detail: 'Go back to the previous step and generate an API key first.',
      })
      return NextResponse.json({ results })
    }

    apiKeyPrefix = keys[0].key_prefix
    results.push({
      step: 'api_key',
      status: 'pass',
      message: `API key validated (${apiKeyPrefix}...)`,
    })
  } catch (err) {
    results.push({
      step: 'api_key',
      status: 'fail',
      message: 'Error checking API keys',
      detail: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json({ results })
  }

  // ── Step 3: OpenRouter connectivity ──
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (!openrouterKey) {
    results.push({
      step: 'upstream',
      status: 'fail',
      message: 'OpenRouter API key not configured',
      detail: 'Add OPENROUTER_API_KEY to your .env.local file and restart the dev server.',
    })
    return NextResponse.json({ results })
  }

  try {
    const testRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'ClawProxy Connection Test',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001',
        messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
        max_tokens: 5,
      }),
    })

    if (!testRes.ok) {
      const errBody = await testRes.text()
      let detail = `HTTP ${testRes.status}`
      if (testRes.status === 401) {
        detail = 'Your OpenRouter API key is invalid or expired. Check it at openrouter.ai/settings/keys'
      } else if (testRes.status === 402) {
        detail = 'Your OpenRouter account has no credits. Add credits at openrouter.ai/credits'
      } else if (testRes.status === 429) {
        detail = 'Rate limited by OpenRouter. Wait a moment and try again.'
      } else {
        try {
          const parsed = JSON.parse(errBody)
          detail = parsed.error?.message ?? errBody.slice(0, 200)
        } catch {
          detail = errBody.slice(0, 200)
        }
      }

      results.push({
        step: 'upstream',
        status: 'fail',
        message: 'OpenRouter request failed',
        detail,
      })
      return NextResponse.json({ results })
    }

    const data = await testRes.json()
    const reply = data?.choices?.[0]?.message?.content ?? ''
    results.push({
      step: 'upstream',
      status: 'pass',
      message: `Upstream connected (got: "${reply.trim().slice(0, 20)}")`,
    })
  } catch (err) {
    results.push({
      step: 'upstream',
      status: 'fail',
      message: 'Cannot reach OpenRouter',
      detail: err instanceof Error ? err.message : 'Network error — check your internet connection.',
    })
    return NextResponse.json({ results })
  }

  // ── Step 4: Verify logging works ──
  try {
    const supabase = getServiceClient()
    const testId = crypto.randomUUID()

    const { error: insertErr } = await supabase.from('request_logs').insert({
      id: testId,
      user_id: userId,
      model: 'connection-test',
      requested_model: 'connection-test',
      status: 'success',
      agent_label: 'Connection Test',
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cost: 0,
      estimated_direct_cost: 0,
      latency_ms: 0,
    })

    if (insertErr) {
      results.push({
        step: 'logging',
        status: 'fail',
        message: 'Cannot write logs',
        detail: insertErr.message,
      })
      return NextResponse.json({ results })
    }

    // Clean up the test entry
    await supabase.from('request_logs').delete().eq('id', testId)

    results.push({
      step: 'logging',
      status: 'pass',
      message: 'Request logging verified',
    })
  } catch (err) {
    results.push({
      step: 'logging',
      status: 'fail',
      message: 'Logging test failed',
      detail: err instanceof Error ? err.message : 'Unknown error',
    })
  }

  return NextResponse.json({ results })
}
