import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('whop_membership_id')
    .eq('id', user.id)
    .single()

  if (!profile?.whop_membership_id) {
    return NextResponse.json(
      { error: 'No active subscription to cancel.' },
      { status: 400 },
    )
  }

  // Store cancel reason
  const body = await request.json().catch(() => ({}))
  if (body.reason) {
    await supabase
      .from('users')
      .update({ cancel_reason: body.reason })
      .eq('id', user.id)
  }

  // Cancel at period end via Whop API
  if (!process.env.WHOP_API_KEY) {
    return NextResponse.json(
      { error: 'Whop API not configured' },
      { status: 500 },
    )
  }

  const res = await fetch(
    `https://api.whop.com/api/v5/memberships/${profile.whop_membership_id}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancel_at_period_end: true }),
    },
  )

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to cancel subscription.' },
      { status: 500 },
    )
  }

  const membership = await res.json()

  return NextResponse.json({
    success: true,
    message:
      "Subscription cancelled. You'll keep access until your current billing period ends.",
    accessUntil: membership.renewal_period_end,
  })
}
