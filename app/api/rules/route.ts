import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requirePlan } from '@/lib/api/require-plan'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await requirePlan(supabase, user.id, 'pro')
  if (!result.authorized) {
    return result.response
  }

  const { data: rules, error } = await supabase
    .from('routing_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('priority', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rules })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await requirePlan(supabase, user.id, 'pro')
  if (!result.authorized) {
    return result.response
  }

  // Check rule count vs plan limit
  const { count } = await supabase
    .from('routing_rules')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const maxRules = result.limits.maxRules
  if (maxRules !== Infinity && (count ?? 0) >= maxRules) {
    return NextResponse.json(
      {
        error: 'rule_limit_reached',
        message: `You've reached the ${maxRules} rule limit on your plan.`,
        current_count: count,
        max_rules: maxRules,
      },
      { status: 403 },
    )
  }

  const body = await request.json()
  const { name, rule_type, conditions, action_value, priority } = body

  if (!name || !action_value) {
    return NextResponse.json({ error: 'name and action_value are required' }, { status: 400 })
  }

  const { data: rule, error } = await supabase
    .from('routing_rules')
    .insert({
      user_id: user.id,
      name,
      rule_type: rule_type || 'model_override',
      conditions: conditions || {},
      action_value,
      priority: priority ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rule }, { status: 201 })
}
