import { getServiceClient } from '@/lib/supabase/service'

export async function applyRoutingRules(
  userId: string,
  requestedModel: string,
): Promise<{ model: string; ruleApplied: string | null }> {
  const supabase = getServiceClient()

  const { data: rules } = await supabase
    .from('routing_rules')
    .select('name, rule_type, conditions, action_value')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  if (!rules || rules.length === 0) {
    return { model: requestedModel, ruleApplied: null }
  }

  for (const rule of rules) {
    if (rule.rule_type === 'model_override') {
      const conditions = rule.conditions as { source_model?: string }
      if (!conditions.source_model || conditions.source_model === requestedModel) {
        return { model: rule.action_value, ruleApplied: rule.name }
      }
    }
  }

  return { model: requestedModel, ruleApplied: null }
}
