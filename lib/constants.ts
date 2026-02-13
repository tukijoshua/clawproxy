import type { Plan } from '@/lib/supabase/types';

export const PLANS: Record<Plan, { name: string; price: number; label: string; checkoutUrl: string | null }> = {
  starter: { name: 'Starter', price: 0, label: 'Starter', checkoutUrl: null },
  pro: { name: 'Pro', price: 29, label: 'Pro', checkoutUrl: 'https://whop.com/checkout/plan_Eak9h298U3wzn' },
  team: { name: 'Team', price: 79, label: 'Team', checkoutUrl: 'https://whop.com/checkout/plan_34Xxy0vq5Wt8n' },
} as const;

export const PLAN_BADGE_STYLES: Record<Plan, { bg: string; border: string; text: string }> = {
  starter: { bg: '#F0EFED', border: '#B8B8B0', text: '#55554F' },
  pro: { bg: '#E2F3EA', border: '#17803D', text: '#17803D' },
  team: { bg: '#F3EEFF', border: '#7C3AED', text: '#7C3AED' },
} as const;
