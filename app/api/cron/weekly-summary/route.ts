import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { weeklySummaryEmail } from '@/lib/email-templates'

// Service role client to query all users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(request: Request) {
  // Authenticate via CRON_SECRET (Vercel auto-provides this)
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.CRON_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clawproxy.ai'

  // Get all paid users
  const { data: users, error } = await supabase
    .from('users')
    .select('email, name')
    .in('plan', ['pro', 'team'])

  if (error) {
    console.error('Failed to fetch users for weekly summary:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  // Calculate week range
  const now = new Date()
  const weekEnd = new Date(now)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 7)
  const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  let sent = 0
  let failed = 0

  for (const user of users || []) {
    if (!user.email) continue

    // Placeholder stats until proxy analytics table exists
    const template = weeklySummaryEmail({
      name: user.name || '',
      totalSaved: '$0.00',
      requestCount: 0,
      topAgent: 'N/A',
      weekRange,
      dashboardUrl: `${appUrl}/dashboard/analytics`,
    })

    const result = await sendEmail({ to: user.email, ...template })
    if (result.success) {
      sent++
    } else {
      failed++
    }

    // Rate limit: 100ms between sends
    await sleep(100)
  }

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: users?.length || 0,
  })
}
