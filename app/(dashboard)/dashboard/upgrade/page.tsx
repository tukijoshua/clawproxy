'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

const CHECKOUT_URLS: Record<string, string> = {
  pro: 'https://whop.com/checkout/plan_Eak9h298U3wzn',
  team: 'https://whop.com/checkout/plan_34Xxy0vq5Wt8n',
};

const planConfigs = {
  pro: {
    title: 'Upgrade to Pro',
    subtitle: 'Unlock loop detection, compression, spending limits, and full analytics.',
    roiMultiplier: '8.5×',
    roiDescription: 'Average return on your $29/month subscription',
    roiBreakdown: 'Pay $29 → Save $247 → Net gain: $218/month',
    price: '$29/mo',
    ctaLabel: 'Upgrade to Pro →',
    ctaBg: '#17803D',
    compareFrom: 'Free',
    compareTo: 'Pro',
    features: [
      { name: 'Request routing', from: '✓', to: '✓' },
      { name: 'Basic dashboard', from: '✓', to: '✓' },
      { name: 'Requests / month', from: '10,000', to: 'Unlimited' },
      { name: 'Loop detection', from: '✕', to: '✓' },
      { name: 'Context compression', from: '✕', to: '✓' },
      { name: 'Spending limits', from: '✕', to: '✓' },
      { name: 'Per-skill breakdown', from: '✕', to: '✓' },
      { name: 'Request history', from: '3 days', to: '90 days' },
      { name: 'CSV export', from: '✕', to: '✓' },
      { name: 'Priority support', from: '✕', to: '✓' },
    ],
  },
  team: {
    title: 'Upgrade to Team',
    subtitle: 'Multi-agent routing, team collaboration, custom rules, and dedicated support.',
    roiMultiplier: '12×',
    roiDescription: 'Average return on your $79/month subscription',
    roiBreakdown: 'Pay $79 → Save $948 → Net gain: $869/month',
    price: '$79/mo',
    ctaLabel: 'Upgrade to Team →',
    ctaBg: '#7C3AED',
    compareFrom: 'Pro',
    compareTo: 'Team',
    features: [
      { name: 'Everything in Pro', from: '✓', to: '✓' },
      { name: 'Multi-agent routing', from: '✕', to: '✓' },
      { name: 'Team members', from: '✕', to: 'Up to 10' },
      { name: 'Custom rules', from: '✕', to: '✓' },
      { name: 'API + webhooks', from: '✕', to: '✓' },
      { name: 'Slack support', from: '✕', to: '✓' },
      { name: 'Agent analytics', from: 'Basic', to: 'Per-agent' },
      { name: 'Request history', from: '90 days', to: '90 days' },
      { name: 'CSV export', from: '✓', to: '✓' },
      { name: 'Priority support', from: '✓', to: 'Dedicated' },
    ],
  },
};

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = (searchParams.get('plan') as 'pro' | 'team') || 'pro';
  const plan = planConfigs[planKey] || planConfigs.pro;

  const handleUpgrade = () => {
    const url = CHECKOUT_URLS[planKey];
    if (url) window.location.href = url;
  };

  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-90px)] py-[32px] px-[16px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="w-full max-w-[740px] bg-white rounded-[14px] px-[40px] py-[44px] sm:px-[56px]"
        style={{ border: '1px solid #E2E1DC' }}
      >
        <div className="text-center mb-[32px]">
          <h1
            className="text-[40px] leading-[1.1] text-[#141413]"
            style={{ fontFamily: 'Instrument Serif, serif', letterSpacing: '-0.0375em' }}
          >
            {plan.title}
          </h1>
          <p className="mt-[10px] text-[15px] leading-[1.5] text-[#5C5C58]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            {plan.subtitle}
          </p>
        </div>

        <div
          className="rounded-[5px] px-[24px] py-[18px] mb-[28px]"
          style={{
            backgroundColor: planKey === 'team' ? '#F0EAFF' : '#DCEEE3',
            border: `1px solid ${planKey === 'team' ? '#C4B5FD' : '#B8DBCA'}`,
          }}
        >
          <div className="flex items-center gap-[16px]">
            <span
              className="text-[48px] leading-[1]"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', color: planKey === 'team' ? '#7C3AED' : '#157A3E', letterSpacing: '-0.02em' }}
            >
              {plan.roiMultiplier}
            </span>
            <div>
              <p className="text-[13px] leading-[1.4]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: planKey === 'team' ? '#5B21B6' : '#0D5428' }}>
                {plan.roiDescription}
              </p>
              <p className="text-[12px] leading-[1.4] mt-[2px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: planKey === 'team' ? '#5B21B6' : '#0D5428', opacity: 0.8 }}>
                {plan.roiBreakdown}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[7px] overflow-hidden mb-[32px]" style={{ border: '1px solid #E4E3DE' }}>
          <div className="grid grid-cols-[1fr_100px_120px] sm:grid-cols-[1fr_120px_140px] h-[44px] items-center" style={{ backgroundColor: '#F0EFEB' }}>
            <span className="pl-[20px] text-[12px] text-[#5C5C58]" style={{ fontFamily: 'Aeonik Pro, sans-serif', fontWeight: 500 }}>Feature</span>
            <span className="text-center text-[12px] text-[#5C5C58]" style={{ fontFamily: 'Aeonik Pro, sans-serif', fontWeight: 500 }}>{plan.compareFrom}</span>
            <div className="h-full flex items-center justify-center text-center" style={{ backgroundColor: planKey === 'team' ? 'rgba(124,58,237,0.08)' : 'rgba(220,238,227,0.3)' }}>
              <span className="text-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', fontWeight: 500, color: planKey === 'team' ? '#7C3AED' : '#157A3E' }}>
                {plan.compareTo} {plan.price}
              </span>
            </div>
          </div>

          {plan.features.map((feature, i) => (
            <div
              key={feature.name}
              className="grid grid-cols-[1fr_100px_120px] sm:grid-cols-[1fr_120px_140px] h-[42px] items-center"
              style={{ borderTop: '1px solid #E4E3DE', backgroundColor: i % 2 === 1 ? '#FAFAF8' : 'white' }}
            >
              <span className="pl-[20px] text-[13px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{feature.name}</span>
              <span
                className="text-center text-[13px]"
                style={{ fontFamily: 'Aeonik Pro, sans-serif', color: feature.from === '✓' ? '#157A3E' : feature.from === '✕' ? '#9C9C96' : '#141413' }}
              >
                {feature.from}
              </span>
              <div className="h-full flex items-center justify-center" style={{ backgroundColor: planKey === 'team' ? 'rgba(124,58,237,0.04)' : 'rgba(220,238,227,0.15)' }}>
                <span
                  className="text-[13px]"
                  style={{
                    fontFamily: 'Aeonik Pro, sans-serif',
                    color: feature.to === '✓' ? '#157A3E' : feature.to === '✕' ? '#9C9C96' : planKey === 'team' ? '#7C3AED' : '#157A3E',
                    fontWeight: feature.to !== '✓' && feature.to !== '✕' ? 500 : 400,
                  }}
                >
                  {feature.to}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => router.back()}
            className="h-[43px] px-[24px] rounded-[8px] text-[14px] text-[#141413] cursor-pointer transition hover:opacity-80"
            style={{ backgroundColor: '#F0EFEB', fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            ← Back
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 h-[43px] rounded-[8px] text-[14px] text-white cursor-pointer transition hover:opacity-90"
            style={{ backgroundColor: plan.ctaBg, fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            {plan.ctaLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-90px)]" />}>
      <UpgradeContent />
    </Suspense>
  );
}
