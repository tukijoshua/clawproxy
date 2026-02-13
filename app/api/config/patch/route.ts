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

    // Add ClawProxy settings
    parsed.apiBaseUrl = 'https://api.clawproxy.ai/v1'

    if (apiKey) {
      parsed.customHeaders = {
        ...(typeof parsed.customHeaders === 'object' && parsed.customHeaders !== null
          ? parsed.customHeaders as Record<string, unknown>
          : {}),
        'x-clawproxy-key': apiKey,
      }
    } else {
      parsed.customHeaders = {
        ...(typeof parsed.customHeaders === 'object' && parsed.customHeaders !== null
          ? parsed.customHeaders as Record<string, unknown>
          : {}),
        'x-clawproxy-key': 'YOUR_API_KEY',
      }
    }

    const patched = JSON.stringify(parsed, null, 2)

    return NextResponse.json({
      patched,
      changes: [
        'Added apiBaseUrl: "https://api.clawproxy.ai/v1"',
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
