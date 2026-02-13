import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Plan } from '@/lib/supabase/types'
import crypto from 'crypto'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check agent limit for plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, agent_count')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan ?? 'starter') as Plan
  const agentCount = profile?.agent_count ?? 0
  const maxAgents = PLAN_LIMITS[plan].maxAgents

  if (agentCount >= maxAgents) {
    const upgradeTo = plan === 'starter' ? 'pro' : 'team'
    return NextResponse.json(
      {
        error: 'upgrade_required',
        message: `You've reached the ${maxAgents} agent limit on your ${plan} plan.`,
        current_plan: plan,
        upgrade_to: upgradeTo,
      },
      { status: 403 },
    )
  }

  // Generate raw key: cp_sk_ + 48 hex chars
  const rawKey = `cp_sk_${crypto.randomBytes(24).toString('hex')}`
  const keyPrefix = rawKey.slice(0, 12)
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    label: 'Default Agent',
    scope: 'full',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return the raw key exactly once — it's never stored in plain text
  return NextResponse.json({ key: rawKey })
}
