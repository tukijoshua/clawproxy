import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = getServiceClient()

  // Get all API keys for this user
  const { data: keys } = await service
    .from('api_keys')
    .select('id, label, key_prefix, is_active, last_used_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!keys || keys.length === 0) {
    return NextResponse.json({ agents: [] })
  }

  // Get today's start
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Get request logs for all keys today
  const keyIds = keys.map((k) => k.id)
  const { data: logs } = await service
    .from('request_logs')
    .select('api_key_id, cost, estimated_direct_cost, status')
    .eq('user_id', user.id)
    .in('api_key_id', keyIds)
    .gte('created_at', startOfDay)

  // Aggregate per key
  const statsMap = new Map<string, { spend: number; saved: number; requests: number; loops: number }>()
  for (const log of logs ?? []) {
    const id = log.api_key_id
    if (!id) continue
    const entry = statsMap.get(id) ?? { spend: 0, saved: 0, requests: 0, loops: 0 }
    entry.spend += Number(log.cost)
    entry.saved += Number(log.estimated_direct_cost) - Number(log.cost)
    entry.requests++
    if (log.status === 'loop_killed') entry.loops++
    statsMap.set(id, entry)
  }

  const agents = keys.map((key) => {
    const stats = statsMap.get(key.id) ?? { spend: 0, saved: 0, requests: 0, loops: 0 }
    return {
      id: key.id,
      name: key.label,
      keyPrefix: key.key_prefix,
      isActive: key.is_active,
      lastUsedAt: key.last_used_at,
      createdAt: key.created_at,
      spend: Number(stats.spend.toFixed(4)),
      saved: Number(stats.saved.toFixed(4)),
      requests: stats.requests,
      loops: stats.loops,
    }
  })

  return NextResponse.json({ agents })
}
