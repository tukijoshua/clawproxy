import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') ?? 'today'
  const agentFilter = searchParams.get('agent') ?? 'all'

  const service = getServiceClient()
  const now = new Date()
  let since: string

  switch (range) {
    case 'today':
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      break
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      since = d.toISOString()
      break
    }
    case 'month':
      since = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      break
    case 'last': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      since = start.toISOString()
      break
    }
    case '90d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 90)
      since = d.toISOString()
      break
    }
    default:
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  }

  let query = service
    .from('request_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (agentFilter !== 'all') {
    query = query.eq('api_key_id', agentFilter)
  }

  const { data: logs } = await query

  const rows = logs ?? []

  // Compute aggregates
  const totalSpend = rows.reduce((s, r) => s + Number(r.cost), 0)
  const totalDirect = rows.reduce((s, r) => s + Number(r.estimated_direct_cost), 0)
  const totalSaved = totalDirect - totalSpend
  const requestCount = rows.length
  const loopsKilled = rows.filter((r) => r.status === 'loop_killed').length

  // Active agents
  const agentIds = new Set(rows.map((r) => r.api_key_id).filter(Boolean))
  const activeAgents = agentIds.size

  // Model distribution
  const modelMap = new Map<string, { count: number; cost: number }>()
  for (const r of rows) {
    if (r.status !== 'success') continue
    const entry = modelMap.get(r.model) ?? { count: 0, cost: 0 }
    entry.count++
    entry.cost += Number(r.cost)
    modelMap.set(r.model, entry)
  }
  const totalSuccessCount = rows.filter((r) => r.status === 'success').length
  const modelDistribution = Array.from(modelMap.entries())
    .map(([model, data]) => ({
      name: model,
      pct: totalSuccessCount > 0 ? Math.round((data.count / totalSuccessCount) * 100) : 0,
      cost: data.cost,
      requests: data.count,
    }))
    .sort((a, b) => b.pct - a.pct)

  // Daily cost data (last 7 days for week, or each day in range)
  const dayMap = new Map<string, { actual: number; direct: number }>()
  for (const r of rows) {
    const day = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const entry = dayMap.get(day) ?? { actual: 0, direct: 0 }
    entry.actual += Number(r.cost)
    entry.direct += Number(r.estimated_direct_cost)
    dayMap.set(day, entry)
  }
  const dailyCostData = Array.from(dayMap.entries()).map(([day, data]) => ({
    day,
    actual: Number(data.actual.toFixed(4)),
    without: Number(data.direct.toFixed(4)),
  }))

  // Savings breakdown
  const routingSaved = rows
    .filter((r) => r.requested_model && r.requested_model !== r.model)
    .reduce((s, r) => s + (Number(r.estimated_direct_cost) - Number(r.cost)), 0)
  const loopSaved = rows
    .filter((r) => r.status === 'loop_killed')
    .reduce((s, r) => s + Number(r.estimated_direct_cost), 0)

  // Agent performance — fetch API keys for connection status
  const { data: apiKeys } = await service
    .from('api_keys')
    .select('id, is_active, last_used_at')
    .eq('user_id', user.id)

  const keyStatusMap = new Map<string, { isActive: boolean; lastUsedAt: string | null }>()
  for (const k of apiKeys ?? []) {
    keyStatusMap.set(k.id, { isActive: k.is_active, lastUsedAt: k.last_used_at })
  }

  function deriveConnectionStatus(keyId: string): 'connected' | 'idle' | 'disconnected' | 'revoked' {
    const info = keyStatusMap.get(keyId)
    if (!info || !info.isActive) return 'revoked'
    if (!info.lastUsedAt) return 'disconnected'
    const msSince = now.getTime() - new Date(info.lastUsedAt).getTime()
    if (msSince < 5 * 60 * 1000) return 'connected'
    if (msSince < 24 * 60 * 60 * 1000) return 'idle'
    return 'disconnected'
  }

  const agentMap = new Map<string, { label: string; spend: number; saved: number; requests: number; loops: number; active: boolean; connectionStatus: string }>()
  for (const r of rows) {
    const key = r.api_key_id ?? 'unknown'
    const entry = agentMap.get(key) ?? { label: r.agent_label ?? 'Unknown', spend: 0, saved: 0, requests: 0, loops: 0, active: false, connectionStatus: deriveConnectionStatus(key) }
    entry.spend += Number(r.cost)
    entry.saved += Number(r.estimated_direct_cost) - Number(r.cost)
    entry.requests++
    if (r.status === 'loop_killed') entry.loops++
    if (r.status === 'success') entry.active = true
    agentMap.set(key, entry)
  }
  const agentPerformance = Array.from(agentMap.entries()).map(([id, data]) => ({
    id,
    ...data,
  }))

  // Activity by hour (24 buckets)
  const hourMap = new Array(24).fill(0)
  for (const r of rows) {
    const hour = new Date(r.created_at).getHours()
    hourMap[hour]++
  }

  // Budget usage
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: userProfile } = await service
    .from('users')
    .select('daily_budget, monthly_budget')
    .eq('id', user.id)
    .single()

  const dailySpend = rows
    .filter((r) => new Date(r.created_at).toISOString() >= startOfDay)
    .reduce((s, r) => s + Number(r.cost), 0)
  const monthlySpend = rows
    .filter((r) => new Date(r.created_at).toISOString() >= startOfMonth)
    .reduce((s, r) => s + Number(r.cost), 0)

  return NextResponse.json({
    totalSaved: Number(totalSaved.toFixed(4)),
    totalSpend: Number(totalSpend.toFixed(4)),
    requestCount,
    loopsKilled,
    activeAgents,
    modelDistribution,
    dailyCostData,
    savingsBreakdown: {
      routing: Number(routingSaved.toFixed(4)),
      loops: Number(loopSaved.toFixed(4)),
    },
    agentPerformance,
    budgetUsage: {
      dailySpend: Number(dailySpend.toFixed(4)),
      monthlySpend: Number(monthlySpend.toFixed(4)),
      dailyBudget: userProfile?.daily_budget ?? null,
      monthlyBudget: userProfile?.monthly_budget ?? null,
    },
    activityByHour: hourMap,
  })
}
