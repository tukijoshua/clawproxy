import { NextResponse } from 'next/server'

/**
 * POST /api/config/patch
 *
 * Accepts an OpenClaw JSON config file, adds ClawProxy settings,
 * and returns the patched version for download.
 *
 * Body: { config: string (raw JSON), apiKey?: string }
 */
export async function POST(request: Request) {
  try {
    const { config, apiKey } = await request.json()

    if (!config || typeof config !== 'string') {
      return NextResponse.json(
        { error: 'Missing config field. Send the raw JSON content of your config file.' },
        { status: 400 }
      )
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(config)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON. Make sure you uploaded a valid .json file.' },
        { status: 400 }
      )
    }

    // Override Anthropic provider to route through ClawProxy
    const models = (parsed.models as Record<string, unknown>) ?? {}
    const providers = (models.providers as Record<string, unknown>) ?? {}
    const anthropic = (providers.anthropic as Record<string, unknown>) ?? {}

    anthropic.baseUrl = 'https://www.clawproxy.ai/api/proxy/v1'
    const headers = (anthropic.headers as Record<string, unknown>) ?? {}
    headers['x-clawproxy-key'] = apiKey || 'YOUR_API_KEY'
    anthropic.headers = headers
    if (!Array.isArray(anthropic.models)) {
      anthropic.models = [
        { id: 'claude-opus-4-0-20250514', name: 'Claude Opus 4', contextWindow: 200000, maxTokens: 32000 },
        { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', contextWindow: 200000, maxTokens: 32000 },
        { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000, maxTokens: 16000 },
        { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000, maxTokens: 8192 },
      ]
    }

    providers.anthropic = anthropic
    models.providers = providers
    parsed.models = models

    const patched = JSON.stringify(parsed, null, 2)

    return NextResponse.json({
      patched,
      changes: [
        'Set models.providers.anthropic.baseUrl to "https://www.clawproxy.ai/api/proxy/v1"',
        apiKey
          ? 'Added x-clawproxy-key header with your API key'
          : 'Added x-clawproxy-key placeholder — replace YOUR_API_KEY with your actual key',
      ],
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
