import { NextResponse } from 'next/server';
import { PLAN_LIMITS } from '@/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Plan } from '@/lib/supabase/types';

const PLAN_RANK: Record<Plan, number> = { starter: 0, pro: 1, team: 2 };

export async function requirePlan(
  supabase: SupabaseClient,
  userId: string,
  minPlan: Plan,
) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('plan, agent_count')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      authorized: false as const,
      profile: null,
      response: NextResponse.json({ error: 'Profile not found' }, { status: 404 }),
    };
  }

  const userPlan = (profile.plan ?? 'starter') as Plan;

  if (PLAN_RANK[userPlan] < PLAN_RANK[minPlan]) {
    return {
      authorized: false as const,
      profile,
      response: NextResponse.json(
        {
          error: 'upgrade_required',
          message: `This action requires the ${minPlan} plan or higher.`,
          current_plan: userPlan,
          required_plan: minPlan,
        },
        { status: 403 },
      ),
    };
  }

  return { authorized: true as const, profile, limits: PLAN_LIMITS[userPlan] };
}
