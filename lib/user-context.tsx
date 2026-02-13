'use client';

import { createContext, useContext } from 'react';
import { PLAN_LIMITS } from '@/lib/constants';
import type { User } from '@/lib/supabase/types';
import type { Plan } from '@/lib/supabase/types';

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

export function usePlan() {
  const user = useContext(UserContext);
  const plan: Plan = user?.plan ?? 'starter';
  const limits = PLAN_LIMITS[plan];

  return {
    plan,
    isPaid: plan !== 'starter',
    canUseLoopDetection: limits.loopDetection,
    canUseCompression: limits.compression,
    canExportCsv: limits.csvExport,
    canUseSpendingLimits: limits.spendingLimits,
    canInviteMembers: limits.maxMembers > 1,
    maxAgents: limits.maxAgents,
    maxRules: limits.maxRules,
    maxMembers: limits.maxMembers,
    historyDays: limits.historyDays,
    agentCount: user?.agent_count ?? 0,
  };
}
