import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
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
      { error: 'No subscription to resume.' },
      { status: 400 },
    )
  }

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
      body: JSON.stringify({ cancel_at_period_end: false }),
    },
  )

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to resume subscription.' },
      { status: 500 },
    )
  }

  // Clear cancel reason
  await supabase
    .from('users')
    .update({ cancel_reason: null })
    .eq('id', user.id)

  return NextResponse.json({
    success: true,
    message: "Subscription resumed! You won't be cancelled.",
  })
}
