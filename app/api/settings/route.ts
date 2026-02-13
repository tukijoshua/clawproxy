import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('daily_budget, monthly_budget')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    daily_budget: profile?.daily_budget ?? null,
    monthly_budget: profile?.monthly_budget ?? null,
  })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const dailyBudget = body.daily_budget !== undefined ? (body.daily_budget === '' || body.daily_budget === null ? null : Number(body.daily_budget)) : undefined
  const monthlyBudget = body.monthly_budget !== undefined ? (body.monthly_budget === '' || body.monthly_budget === null ? null : Number(body.monthly_budget)) : undefined

  const updates: Record<string, unknown> = {}
  if (dailyBudget !== undefined) updates.daily_budget = dailyBudget
  if (monthlyBudget !== undefined) updates.monthly_budget = monthlyBudget

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
