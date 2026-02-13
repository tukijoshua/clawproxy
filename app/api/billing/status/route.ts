import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CHECKOUT_URLS = {
  pro: 'https://whop.com/checkout/plan_Eak9h298U3wzn',
  team: 'https://whop.com/checkout/plan_34Xxy0vq5Wt8n',
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-create profile if trigger didn't fire
  if (!profile) {
    const { data: created } = await supabase
      .from('users')
      .insert({ id: user.id, email: user.email!, name: user.user_metadata?.name || '' })
      .select('*')
      .single()
    profile = created
  }

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // If user has a Whop membership, fetch details from Whop API
  if (profile.whop_membership_id && process.env.WHOP_API_KEY) {
    try {
      const membershipRes = await fetch(
        `https://api.whop.com/api/v5/memberships/${profile.whop_membership_id}`,
        {
          headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
        },
      )

      if (membershipRes.ok) {
        const membership = await membershipRes.json()

        return NextResponse.json({
          plan: profile.plan,
          status: membership.status || 'active',
          cancelAtPeriodEnd: membership.cancel_at_period_end || false,
          renewalEnd: membership.renewal_period_end,
          updatePaymentUrl: membership.manage_url,
          paymentFailed: profile.payment_failed,
          upgradeUrls: CHECKOUT_URLS,
        })
      }
    } catch {
      // Fall through to basic response
    }
  }

  // Basic response for starter or if Whop API unavailable
  return NextResponse.json({
    plan: profile.plan,
    status: 'active',
    cancelAtPeriodEnd: false,
    renewalEnd: null,
    updatePaymentUrl: null,
    paymentFailed: profile.payment_failed,
    upgradeUrls: CHECKOUT_URLS,
  })
}
