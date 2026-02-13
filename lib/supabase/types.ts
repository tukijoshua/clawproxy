export type Plan = 'starter' | 'pro' | 'team';

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  role: string | null;
  agent_count: number;
  onboarding_completed: boolean;
  whop_user_id: string | null;
  whop_membership_id: string | null;
  cancel_reason: string | null;
  payment_failed: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutingRule {
  id: string;
  user_id: string;
  name: string;
  rule_type: string;
  conditions: Record<string, unknown>;
  action_value: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface TeamInvitation {
  id: string;
  inviter_id: string;
  email: string;
  role: string;
  token: string;
  personal_message: string | null;
  status: InvitationStatus;
  expires_at: string;
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
