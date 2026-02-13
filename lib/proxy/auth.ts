import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase/service'
import type { Plan } from '@/lib/supabase/types'

export interface ValidatedKey {
  userId: string
  apiKeyId: string
  label: string
  user: {
    plan: Plan
    daily_budget: number | null
    monthly_budget: number | null
  }
}

export async function validateApiKey(rawKey: string): Promise<ValidatedKey | null> {
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const supabase = getServiceClient()

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('id, user_id, label, is_active')
    .eq('key_hash', keyHash)
    .single()

  if (error || !apiKey || !apiKey.is_active) return null

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('plan, daily_budget, monthly_budget')
    .eq('id', apiKey.user_id)
    .single()

  if (userError || !user) return null

  // Fire-and-forget last_used_at update
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id)
    .then(() => {})

  return {
    userId: apiKey.user_id,
    apiKeyId: apiKey.id,
    label: apiKey.label,
    user: {
      plan: (user.plan ?? 'starter') as Plan,
      daily_budget: user.daily_budget,
      monthly_budget: user.monthly_budget,
    },
  }
}
