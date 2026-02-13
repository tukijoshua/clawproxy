'use client';

import Link from 'next/link';
import { usePlan } from '@/lib/user-context';
import type { Plan } from '@/lib/supabase/types';

const PLAN_RANK: Record<Plan, number> = { starter: 0, pro: 1, team: 2 };

export function UpgradeGate({
  feature,
  requiredPlan,
  children,
}: {
  feature: string;
  requiredPlan: 'pro' | 'team';
  children: React.ReactNode;
}) {
  const { plan } = usePlan();
  const hasAccess = PLAN_RANK[plan] >= PLAN_RANK[requiredPlan];

  if (hasAccess) return <>{children}</>;

  const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
  const planColor = requiredPlan === 'pro' ? '#17803D' : '#7C3AED';

  return (
    <div
      className="bg-white border border-[#E4E3DE] rounded-[12px] px-[28px] py-[32px] flex flex-col items-center text-center"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Lock icon */}
      <div
        className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center mb-[16px]"
        style={{ backgroundColor: requiredPlan === 'pro' ? '#E2F3EA' : '#F3EEFF' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={planColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h3
        className="text-[18px] leading-[1.2] text-[#111110]"
        style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.02em' }}
      >
        {feature}
      </h3>

      <p
        className="text-[13px] leading-[1.5] text-[#8F8F87] mt-[6px] max-w-[320px]"
        style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
      >
        This feature requires the {planLabel} plan. Upgrade to unlock {feature.toLowerCase()}.
      </p>

      <Link
        href={`/dashboard/upgrade?plan=${requiredPlan}`}
        className="mt-[20px] h-[37px] px-[22px] rounded-[6px] text-[13px] text-white flex items-center justify-center hover:opacity-90 transition"
        style={{ backgroundColor: planColor, fontFamily: 'Aeonik Pro, sans-serif' }}
      >
        Upgrade to {planLabel} &rarr;
      </Link>
    </div>
  );
}
