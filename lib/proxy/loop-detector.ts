import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase/service'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Plan } from '@/lib/supabase/types'

export function hashRequest(body: { model?: string; messages?: Array<{ role?: string; content?: string }> }): string {
  const messages = (body.messages ?? []).slice(-3).map((m) => ({
    role: m.role ?? '',
    content: (m.content ?? '').slice(0, 200),
  }))
  const payload = JSON.stringify({ model: body.model ?? '', messages })
  return crypto.createHash('sha256').update(payload).digest('hex')
}

export async function detectLoop(
  userId: string,
  requestHash: string,
  plan: Plan,
): Promise<boolean> {
  if (!PLAN_LIMITS[plan].loopDetection) return false

  const supabase = getServiceClient()
  const cutoff = new Date(Date.now() - 60_000).toISOString()

  const { count } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('request_hash', requestHash)
    .gte('created_at', cutoff)

  return (count ?? 0) > 10
}
