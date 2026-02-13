import { getServiceClient } from '@/lib/supabase/service'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Plan } from '@/lib/supabase/types'

export async function checkBudget(
  userId: string,
  plan: Plan,
  dailyBudget: number | null,
  monthlyBudget: number | null,
): Promise<{ allowed: boolean; reason?: string }> {
  if (!PLAN_LIMITS[plan].spendingLimits) {
    return { allowed: true }
  }

  if (!dailyBudget && !monthlyBudget) {
    return { allowed: true }
  }

  const supabase = getServiceClient()
  const now = new Date()

  if (dailyBudget) {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const { data } = await supabase
      .from('request_logs')
      .select('cost')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .in('status', ['success', 'error'])

    const dailySpend = (data ?? []).reduce((sum, r) => sum + Number(r.cost), 0)
    if (dailySpend >= dailyBudget) {
      return { allowed: false, reason: `Daily budget of $${dailyBudget} exceeded ($${dailySpend.toFixed(4)} spent)` }
    }
  }

  if (monthlyBudget) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data } = await supabase
      .from('request_logs')
      .select('cost')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth)
      .in('status', ['success', 'error'])

    const monthlySpend = (data ?? []).reduce((sum, r) => sum + Number(r.cost), 0)
    if (monthlySpend >= monthlyBudget) {
      return { allowed: false, reason: `Monthly budget of $${monthlyBudget} exceeded ($${monthlySpend.toFixed(4)} spent)` }
    }
  }

  return { allowed: true }
}
