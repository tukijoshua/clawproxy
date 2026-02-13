'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

const plans = [
  {
    name: 'Starter',
    price: '$0',
    illustration: '/images/dashboard/pricing-starter-decoration.svg',
    features: ['10,000 requests/mo', 'Basic dashboard', 'Daily alerts', '3-day history'],
    cta: 'Current plan',
    ctaBg: '#F0EFEB',
    ctaText: '#141413',
    ctaBorder: '1px solid #E4E3DE',
    border: '1px solid #E4E3DE',
    shadow: '0px 1px 2px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.04)',
    upgradeHref: null,
  },
  {
    name: 'Pro',
    price: '$29',
    badge: 'Current',
    mostPopular: true,
    illustration: '/images/dashboard/pricing-pro-decoration.svg',
    features: ['Unlimited routing', 'Loop detection', 'Compression', 'Spending limits', '90-day history', 'CSV export'],
    cta: 'Upgrade to Pro',
    ctaBg: '#157A3E',
    ctaText: '#FFFFFF',
    ctaBorder: 'none',
    border: '2px solid #157A3E',
    shadow: 'none',
    upgradeHref: '/dashboard/upgrade?plan=pro',
  },
  {
    name: 'Team',
    price: '$79',
    illustration: '/images/dashboard/pricing-team-decoration.svg',
    features: ['Everything in Pro', 'Up to 10 agents', 'Team members', 'Custom rules', 'API + webhooks', 'Slack support'],
    cta: 'Upgrade to Team',
    ctaBg: '#7C3AED',
    ctaText: '#FFFFFF',
    ctaBorder: 'none',
    border: '1px solid #E4E3DE',
    shadow: '0px 1px 2px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.04)',
    upgradeHref: '/dashboard/upgrade?plan=team',
  },
];

export default function PricingPage() {
  const router = useRouter();
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="pt-[16px] mb-[16px] px-[4px] sm:px-0">
        <h1
          className="text-[26px] leading-[1.08] text-[#111110]"
          style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
        >
          Plans & Pricing
        </h1>
      </motion.div>

      {/* ── Pricing cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mb-[7px]">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            variants={fadeUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white rounded-[12px] relative overflow-visible"
            style={{
              border: plan.border,
              boxShadow: plan.shadow,
            }}
          >
            {/* Most Popular badge */}
            {plan.mostPopular && (
              <div
                className="absolute -top-[8px] left-1/2 -translate-x-1/2 h-[16px] px-[10px] flex items-center justify-center rounded-[2px] z-10"
                style={{ backgroundColor: '#089C3D', border: '1px solid #0C5526' }}
              >
                <span
                  className="text-[9px] leading-[1.15] text-white uppercase"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.078em' }}
                >
                  Most Popular
                </span>
              </div>
            )}

            {/* Decorative illustration */}
            <div className="absolute top-[19px] left-[26px]">
              <Image
                src={plan.illustration}
                alt=""
                width={58}
                height={66}
                className="pointer-events-none select-none"
              />
            </div>

            <div className="px-[29px] pt-[110px] pb-[29px]">
              {/* Plan name */}
              <div className="flex items-center gap-[8px]">
                <span
                  className="text-[13px] leading-[1.3] text-[#5C5C58]"
                  style={{ fontFamily: plan.name === 'Pro' ? 'Aeonik Pro, sans-serif' : 'DM Sans, sans-serif', fontWeight: plan.name === 'Pro' ? 400 : 600 }}
                >
                  {plan.name}
                </span>
                {plan.badge && (
                  <span
                    className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px] leading-[1.15] text-[#0D5428]"
                    style={{ backgroundColor: 'rgba(8,156,61,0.2)', border: '1px solid #0C5526', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-[4px] mt-[4px]">
                <span
                  className="text-[40px] leading-[1.15] text-[#141413]"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.025em' }}
                >
                  {plan.price}
                </span>
                <span
                  className="text-[15px] leading-[1.15] text-[#9C9C96] mb-[6px]"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.067em' }}
                >
                  /mo
                </span>
              </div>

              {/* Features */}
              <div className="mt-[16px] space-y-[7px]">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-[10px]">
                    <span className="text-[12px] text-[#157A3E]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>✓</span>
                    <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => plan.upgradeHref && router.push(plan.upgradeHref)}
                className={`w-full h-[37px] rounded-[8px] flex items-center justify-center mt-[24px] transition hover:opacity-90 ${plan.upgradeHref ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  backgroundColor: plan.ctaBg,
                  border: plan.ctaBorder,
                  color: plan.ctaText,
                  fontFamily: 'Aeonik Pro, sans-serif',
                  fontSize: '13px',
                }}
              >
                {plan.cta}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
