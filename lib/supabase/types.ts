export type Plan = 'starter' | 'pro' | 'team';

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  role: string | null;
  agent_count: number;
  onboarding_completed: boolean;
  whop_membership_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  label: string;
  scope: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}
