'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const AVATAR_POOL = Array.from({ length: 12 }, (_, i) => `/landing/avatar-${i + 1}.png`);

/* ────────────────────────────────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────────────────────────────────── */

const faqItems = [
  {
    q: 'Will my agents notice the difference?',
    a: 'No. ClawProxy is fully transparent to your agents. Requests and responses look identical — we just route them to cheaper models when the task allows it.',
  },
  {
    q: 'What if a task is misclassified?',
    a: 'ClawProxy uses a conservative classifier. When in doubt, it routes to the more capable model. You can also pin specific tasks to specific models with custom routing rules.',
  },
  {
    q: 'Does this add latency?',
    a: 'Classification adds ~15ms per request. For most workloads, the cheaper models actually respond faster, so total latency often decreases.',
  },
  {
    q: 'How is this different from just switching to a cheaper model?',
    a: 'Switching everything to a cheaper model breaks complex tasks. ClawProxy keeps Opus 4.6 for tasks that need it and only downgrades simple ones — so quality stays the same while costs drop.',
  },
  {
    q: 'Can I use my own API keys?',
    a: 'Yes. ClawProxy works with your existing Anthropic API keys. We never store or access your keys — they pass through encrypted.',
  },
  {
    q: "What's the refund policy?",
    a: "If ClawProxy doesn't save you more than it costs in your first 30 days, we'll refund your subscription in full. No questions asked.",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   AVATAR CAROUSEL (endless cycling developer avatars)
   ──────────────────────────────────────────────────────────────────────────── */
function AvatarCarousel() {
  const VISIBLE = 5;
  const [count, setCount] = useState(VISIBLE);

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const avatars = Array.from({ length: count }, (_, i) => AVATAR_POOL[i % AVATAR_POOL.length]);
  const visible = avatars.slice(-VISIBLE);

  return (
    <div className="flex -space-x-[17px] h-[50px] items-center">
      {visible.map((src, i) => (
        <div
          key={count - VISIBLE + i}
          className="relative flex-shrink-0"
          style={{ zIndex: VISIBLE - i }}
        >
          <Image
            src={src}
            alt=""
            width={50}
            height={50}
            className="w-[50px] h-[50px] rounded-full border-[4px] border-white object-cover"
            style={{
              animation: i === 0 ? 'avatarFadeIn 0.8s ease' : undefined,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   FADE-IN WRAPPER (subtle scroll-triggered reveal)
   ──────────────────────────────────────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  y = 16,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   SECTION TAG (green dot + label)
   ──────────────────────────────────────────────────────────────────────────── */
function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-[10px]">
      <span className="relative flex h-[12px] w-[12px] items-center justify-center">
        <span className="absolute inline-flex h-[8px] w-[8px] rounded-full bg-black opacity-50" />
        <span className="inline-flex h-[8px] w-[8px] rounded-full bg-black" />
      </span>
      <span
        className="text-[11px] uppercase text-black"
        style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.091em', lineHeight: '2.18' }}
      >
        {label}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   SECTION HEADER (tag + heading + subheading)
   ──────────────────────────────────────────────────────────────────────────── */
function SectionHeader({
  tag,
  heading,
  sub,
  subFont = 'Aeonik Pro, sans-serif',
  glitchClass = '',
}: {
  tag: string;
  heading: string;
  sub: string;
  subFont?: string;
  glitchClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[20px] sm:gap-[35px] w-full max-w-[849px] mx-auto px-[16px]">
      <SectionTag label={tag} />
      <h2
        className={`text-[32px] sm:text-[60px] lg:text-[78px] leading-[1] text-center text-[#1A1A1A] glitch ${glitchClass}`}
        style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.05em' }}
        data-text={heading}
      >
        {heading}
      </h2>
      <p
        className="text-[14px] sm:text-[15.5px] leading-[1.34] text-center text-[#1A1A1A] max-w-[589px]"
        style={{ fontFamily: subFont, letterSpacing: '-0.021em' }}
      >
        {sub}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   CTA BUTTON
   ──────────────────────────────────────────────────────────────────────────── */
function CtaButton({ label = 'Get Started', href = '/auth/signup' }: { label?: string; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-[8px] h-[40px] sm:h-[44px] px-[28px] sm:px-[40px] rounded-[3px] text-[14px] sm:text-[16px] text-white cursor-pointer hover:opacity-90 transition"
      style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.02em' }}
    >
      {label}
      <svg width="16" height="16" viewBox="0 0 21 20" fill="none">
        <path d="M4.5 10H16.5M16.5 10L11.5 5M16.5 10L11.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   (Dashboard previews are now pixel-perfect PNG exports from Figma)
   ──────────────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────────────
   FEATURE CARD
   ──────────────────────────────────────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  description,
  dashboardImage,
  dashboardSide = 'left',
}: {
  icon: string;
  title: string;
  description: string;
  dashboardImage: string;
  dashboardSide?: 'left' | 'right';
}) {
  const textContent = (
    <motion.div
      className="flex flex-col gap-[16px] sm:gap-[21px] w-full lg:w-[483px] py-[16px] sm:py-[20px] lg:py-0"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
    >
      <Image src={icon} alt="" width={46} height={46} className="w-[36px] h-[36px] sm:w-[46px] sm:h-[46px]" />
      <span className="text-[18px] sm:text-[22px] leading-[1.15] text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
        {title}
      </span>
      <p className="text-[13px] sm:text-[14px] leading-[1.7] text-[#414141]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
        {description}
      </p>
      <CtaButton />
    </motion.div>
  );

  const dashboardContent = (
    <motion.div
      className="w-full lg:w-[545px] h-[220px] sm:h-[400px] lg:h-[566px] rounded-[4px] overflow-hidden"
      style={{ backgroundColor: '#D5D5D5' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Image
        src={dashboardImage}
        alt=""
        width={545}
        height={566}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );

  return (
    <div className="bg-white rounded-[7px] border border-[#E2E1DC] overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch p-[6px] sm:p-[8px] gap-[8px] lg:gap-0">
        {dashboardSide === 'left' ? (
          <>
            {dashboardContent}
            <div className="flex items-center justify-center flex-1 px-[12px] sm:px-[16px] lg:px-[40px]">{textContent}</div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center flex-1 px-[12px] sm:px-[16px] lg:px-[40px] order-2 lg:order-1">{textContent}</div>
            <div className="order-1 lg:order-2">{dashboardContent}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PRICING CARD
   ──────────────────────────────────────────────────────────────────────────── */
function PricingCard({
  name,
  price,
  icon,
  features,
  disabledFeatures = [],
  buttonLabel,
  buttonBg,
  buttonTextColor = '#FFFFFF',
  buttonBorder,
  popular = false,
  borderColor = '#E4E3DE',
  href = '/auth/signup',
}: {
  name: string;
  price: string;
  icon: { src: string; w: number; h: number };
  features: string[];
  disabledFeatures?: string[];
  buttonLabel: string;
  buttonBg: string;
  buttonTextColor?: string;
  buttonBorder?: string;
  popular?: boolean;
  borderColor?: string;
  href?: string;
}) {
  return (
    <div
      className="relative bg-white rounded-[12px] w-full sm:flex-1 sm:max-w-[360px] overflow-hidden"
      style={{
        border: `${popular ? '2px' : '1px'} solid ${borderColor}`,
        boxShadow: popular ? 'none' : '0px 1px 2px 0px rgba(0,0,0,0.06), 0px 1px 3px 0px rgba(0,0,0,0.04)',
      }}
    >
      <div className="px-[20px] sm:px-[29px] pt-[20px] sm:pt-[24px] pb-[20px] sm:pb-[29px]">
        {/* Plan icon */}
        <div className="h-[70px] flex items-end">
          <Image src={icon.src} alt="" width={icon.w} height={icon.h} />
        </div>

        {/* Plan name */}
        <div className="flex items-center gap-[6px]">
          <span className="text-[13px] text-[#5C5C58]" style={{ fontFamily: popular ? 'Aeonik Pro, sans-serif' : 'DM Sans, sans-serif', fontWeight: popular ? 400 : 600 }}>
            {name}
          </span>
          {popular && (
            <span
              className="inline-flex items-center h-[16px] px-[10px] rounded-[2px] text-[9px] text-white uppercase"
              style={{ backgroundColor: '#089C3D', border: '1px solid #0C5526', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.078em' }}
            >
              MOST POPULAR
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline mt-[4px]">
          <span
            className="text-[40px] leading-[1.15]"
            style={{
              fontFamily: popular ? 'Aeonik Pro, sans-serif' : 'DM Sans, sans-serif',
              fontWeight: popular ? 400 : 600,
              letterSpacing: popular ? '-0.025em' : undefined,
              color: popular ? '#141413' : '#5C5C58',
            }}
          >
            {price}
          </span>
          <span className="text-[15px] text-[#9C9C96] ml-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.067em' }}>
            /mo
          </span>
        </div>

        {/* Divider */}
        <div className="mt-[16px] mb-[16px]">
          {/* Features */}
          <div className="flex flex-col gap-[12px]">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-[10px]">
                <Image src="/landing/icon-check-pricing.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                <span className="text-[13.5px] leading-[1.4] text-[#111110]" style={{ fontFamily: popular ? 'Aeonik Pro, sans-serif' : 'DM Sans, sans-serif' }}>
                  {f}
                </span>
              </div>
            ))}
            {disabledFeatures.map((f) => (
              <div key={f} className="flex items-center gap-[10px]">
                <Image src="/landing/icon-dash-disabled.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                <span className="text-[13.5px] leading-[1.4] text-[#B8B8B0]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <Link
          href={href}
          className="flex items-center justify-center h-[37px] rounded-[2px] text-[14px] w-full mt-[16px] cursor-pointer hover:opacity-90 transition"
          style={{
            backgroundColor: buttonBg,
            color: buttonTextColor,
            border: buttonBorder ? `1px solid ${buttonBorder}` : undefined,
            fontFamily: 'Aeonik Pro, sans-serif',
          }}
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   FAQ ITEM
   ──────────────────────────────────────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E2E1DC]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-[23px] cursor-pointer text-left"
      >
        <span className="text-[16px] leading-[1.15] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
          {question}
        </span>
        <span
          className="text-[18px] text-[#B8B8B0] ml-[16px] flex-shrink-0"
          style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="pb-[20px]">
          <p className="text-[14px] leading-[1.6] text-[#55554F] max-w-[600px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: unknown } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F0EFED' }}>
      {/* ── Rainbow bar ──────────────────────────────────────────────────── */}
      <div
        className="w-full h-[6px]"
        style={{
          background: 'linear-gradient(90deg, rgba(255,151,6,1) 0%, rgba(255,225,31,1) 51%, rgba(23,128,61,1) 82%, rgba(255,48,52,1) 100%)',
        }}
      />

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex justify-center pt-[24px] px-[16px] pb-[8px]" style={{ backgroundColor: '#F0EFED' }}>
        <nav
          className="flex items-center justify-between w-full max-w-[667px] h-[46px] px-[12px] rounded-[4px]"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center">
            <span
              className="text-[24px] text-white"
              style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.027em' }}
            >
              ClawProxy
            </span>
          </Link>
          <Link
            href={isLoggedIn ? '/dashboard' : '/auth/signup'}
            className="flex items-center justify-center h-[27px] px-[10px] rounded-[4px] bg-white text-[12px] text-[#1A1A1A] hover:opacity-90 transition glitch-el-d4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {isLoggedIn ? 'Dashboard →' : 'Get Started'}
          </Link>
        </nav>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center pt-[48px] sm:pt-[120px] px-[16px]">
        <div className="max-w-[849px] w-full flex flex-col items-center gap-[24px] sm:gap-[35px]">
          <motion.h1
            className="text-[36px] sm:text-[72px] lg:text-[96px] leading-[1] text-center text-[#1A1A1A]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.05em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            Your AI agents are
            <br />
            <span className="glitch" data-text="burning">burning</span> money.
          </motion.h1>

          <motion.p
            className="text-[14px] sm:text-[15.5px] leading-[1.34] text-center text-[#1A1A1A] max-w-[523px]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.021em' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            ClawProxy sits between OpenClaw and the API. It routes every request to the cheapest model that can handle it. Same results. 70% less spend.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center gap-[20px] flex-wrap justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          >
            <CtaButton
              label={isLoggedIn ? 'Dashboard' : 'Start saving'}
              href={isLoggedIn ? '/dashboard' : '/auth/signup'}
            />
            <Link
              href="#setup"
              className="inline-flex items-center justify-center h-[40px] sm:h-[44px] px-[24px] sm:px-[34px] rounded-[3px] text-[14px] sm:text-[16px] text-black cursor-pointer hover:opacity-80 transition"
              style={{
                border: '0.9px solid rgba(101,101,101,0.31)',
                fontFamily: 'Aeonik Pro, sans-serif',
              }}
            >
              See how it works
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-[12px] sm:gap-[16px] mt-[10px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}
          >
            <AvatarCarousel />
            <span className="text-[11px] sm:text-[12.5px] leading-[1.3] text-center sm:text-left text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              2,400+ developers already saving · Avg $247/mo saved
            </span>
          </motion.div>
        </div>

        {/* Hero illustration */}
        <motion.div
          className="w-full max-w-[1261px] mt-[60px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        >
          <Image
            src="/landing/hero-illustration.svg"
            alt="ClawProxy routing diagram"
            width={1261}
            height={450}
            className="w-full h-auto glitch-el"
            priority
          />
        </motion.div>
      </section>

      {/* ── Problem Section ──────────────────────────────────────────────── */}
      <section id="problem" className="flex justify-center pt-[80px] sm:pt-[184px] px-[16px]">
        <div className="max-w-[1014px] w-full flex flex-col items-center gap-[40px] sm:gap-[81px]">
          <FadeIn>
            <SectionHeader
              tag="The problem"
              heading="OpenClaw sends everything to the most expensive model."
              glitchClass="glitch-d2"
              sub="Heartbeat checks, file scans, status pings — they all hit Opus 4.6 at $15/M tokens. Most of these tasks could run on a $0.075/M model and get the same result."
            />
          </FadeIn>

          {/* Without vs With cards */}
          <div className="flex flex-col sm:flex-row gap-[7px] w-full">
            {/* WITHOUT card */}
            <FadeIn delay={0} className="flex-1">
            <div className="bg-white rounded-[7px] border border-[#E2E1DC] px-[20px] sm:px-[33px] py-[24px] sm:py-[32px] relative overflow-hidden h-full">
              {/* Without icon */}
              <Image src="/landing/icon-clawproxy-without.svg" alt="" width={44} height={43} className="mb-[45px] glitch-el-d2" />

              <div className="flex items-center gap-[4px] mb-[12px]">
                <span className="text-[11px] uppercase text-[#111110] tracking-[0.091em]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Without{' '}
                </span>
                <span className="text-[24px] text-black" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.027em' }}>
                  ClawProxy
                </span>
              </div>

              <div className="mb-[30px]">
                <span className="text-[32px] sm:text-[42px] leading-[1.15] text-black block glitch glitch-d4" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.048em' }} data-text="$354">
                  $354
                </span>
                <span className="text-[13px] leading-[1.15] text-[#111110] opacity-50 block mt-[6px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  average monthly AI spend
                </span>
              </div>

              <div className="flex flex-col gap-[14px]">
                {[
                  'Every request hits Opus 4.6',
                  'Loops can burn $50+ overnight',
                  'No visibility into what costs what',
                  'No spending limits or alerts',
                  '200K token contexts billed in full',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-[10px]">
                    <Image src="/landing/icon-x-red.svg" alt="" width={24} height={24} />
                    <span className="text-[14px] leading-[1.15] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </FadeIn>

            {/* WITH card */}
            <FadeIn delay={0.15} className="flex-1">
            <div className="bg-white rounded-[7px] border border-[#E2E1DC] px-[20px] sm:px-[33px] py-[24px] sm:py-[32px] relative overflow-hidden h-full">
              {/* With icon */}
              <Image src="/landing/icon-clawproxy-with.svg" alt="" width={44} height={45} className="mb-[45px] glitch-el-d3" />

              <div className="flex items-center gap-[4px] mb-[12px]">
                <span className="text-[11px] uppercase text-[#111110] tracking-[0.091em]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  With
                </span>
                <span className="text-[24px] text-black" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.027em' }}>
                  ClawProxy
                </span>
              </div>

              <div className="mb-[30px]">
                <span className="text-[32px] sm:text-[42px] leading-[1.15] text-[#149644] block glitch glitch-d5" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.048em' }} data-text="$107">
                  $107
                </span>
                <span className="text-[13px] leading-[1.15] text-black opacity-50 block mt-[6px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  same work, 70% less spend
                </span>
              </div>

              <div className="flex flex-col gap-[14px]">
                {[
                  'Smart routing to cheapest capable model',
                  'Loops detected & killed automatically',
                  'Per-agent cost breakdown in real time',
                  'Hard caps, alerts, auto-pause',
                  'Context compressed 80% before billing',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-[10px]">
                    <Image src="/landing/icon-check-green.svg" alt="" width={24} height={24} />
                    <span className="text-[14px] leading-[1.15] text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Setup Section ────────────────────────────────────────────────── */}
      <section id="setup" className="flex justify-center pt-[80px] sm:pt-[184px] px-[16px]">
        <div className="max-w-[1014px] w-full flex flex-col items-center gap-[40px] sm:gap-[81px]">
          <FadeIn>
            <SectionHeader
              tag="Setup"
              heading="Start saving in 2 minutes."
              glitchClass="glitch-d3"
              sub="No code changes. No new SDK. Just point your config at ClawProxy and you're done."
            />
          </FadeIn>

          {/* 3 setup cards */}
          <div className="flex flex-col sm:flex-row gap-[7px] w-full justify-center items-stretch">
            {/* Step 1 */}
            <FadeIn delay={0} className="flex-1 sm:max-w-[342px]">
            <div className="bg-white rounded-[7px] border border-[#E2E1DC] px-[26px] py-[37px] h-full">
              {/* Icon */}
              <Image src="/landing/icon-note.svg" alt="" width={46} height={46} className="mb-[60px] glitch-el" />

              <h3 className="text-[17px] leading-[1.15] text-[#111110] mb-[14px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Sign up &amp; get your key
              </h3>
              <p className="text-[14px] leading-[1.6] text-[#55554F] mb-[22px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Create a free account. You'll get a ClawProxy API key instantly — no credit card needed.
              </p>

              {/* Code snippet */}
              <div className="rounded-[5px] px-[14px] py-[14px] mb-[15px]" style={{ backgroundColor: '#383838' }}>
                <code className="text-[11.5px] leading-[1.7] text-[#6EE7B7] block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  cp_sk_a8f3x9d2e5b1c7f4...
                </code>
              </div>

              {/* Time badge */}
              <div className="inline-flex items-center gap-[4px] h-[28px] px-[11px] rounded-[2px]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.25" stroke="#141B34" strokeWidth="0.94" />
                  <path d="M7.5 4.37V7.5L9.5 9.5" stroke="#141B34" strokeWidth="0.94" strokeLinecap="round" />
                </svg>
                <span className="text-[12px] text-[#17803D]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  30 seconds
                </span>
              </div>
            </div>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn delay={0.12} className="flex-1 sm:max-w-[341px]">
            <div className="bg-white rounded-[7px] border border-[#E2E1DC] px-[29px] py-[36px] h-full">
              {/* Icon */}
              <Image src="/landing/icon-settings.svg" alt="" width={46} height={46} className="mb-[14px] glitch-el-d2" />

              <h3 className="text-[17px] leading-[1.15] text-[#111110] mb-[14px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Point your config at us
              </h3>
              <p className="text-[14px] leading-[1.6] text-[#55554F] mb-[22px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Add two lines to your OpenClaw config. Or run our one-line installer.
              </p>

              {/* Code snippet */}
              <div className="rounded-[5px] px-[14px] py-[14px] mb-[15px]" style={{ backgroundColor: '#383838' }}>
                <code className="text-[11.5px] leading-[1.7] text-[#6EE7B7] block whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {`"apiBaseUrl":\n"https://api.clawproxy.ai/v1"\n"customHeaders": { "x-clawproxy-key":\n"cp_sk_..." }`}
                </code>
              </div>

              {/* Time badge */}
              <div className="inline-flex items-center gap-[4px] h-[28px] px-[11px] rounded-[2px]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.25" stroke="#141B34" strokeWidth="0.94" />
                  <path d="M7.5 4.37V7.5L9.5 9.5" stroke="#141B34" strokeWidth="0.94" strokeLinecap="round" />
                </svg>
                <span className="text-[12px] text-[#17803D]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  60 seconds
                </span>
              </div>
            </div>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn delay={0.24} className="flex-1 sm:max-w-[341px]">
            <div className="bg-white rounded-[7px] border border-[#E2E1DC] px-[28px] py-[32px] h-full">
              {/* Icon */}
              <Image src="/landing/icon-money.svg" alt="" width={46} height={46} className="mb-[82px] glitch-el-d3" />

              <h3 className="text-[17px] leading-[1.15] text-[#111110] mb-[14px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Watch your bill drop
              </h3>
              <p className="text-[14px] leading-[1.6] text-[#55554F] mb-[22px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Your agents work exactly the same. ClawProxy handles routing behind the scenes. Open your dashboard to see savings in real time.
              </p>

              {/* Time badge */}
              <div className="inline-flex items-center gap-[4px] h-[28px] px-[11px] rounded-[2px]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.25" stroke="#141B34" strokeWidth="0.94" />
                  <path d="M7.5 4.37V7.5L9.5 9.5" stroke="#141B34" strokeWidth="0.94" strokeLinecap="round" />
                </svg>
                <span className="text-[12px] text-[#17803D]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Instant
                </span>
              </div>
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────── */}
      <section id="features" className="flex justify-center pt-[80px] sm:pt-[184px] px-[16px]">
        <div className="max-w-[1107px] w-full flex flex-col items-center gap-[40px] sm:gap-[81px]">
          <FadeIn>
            <SectionHeader
              tag="Features"
              heading={'Everything you need to stop\nburning money on AI.'}
              glitchClass="glitch-d4"
              sub="No code changes. No new SDK. Just point your config at ClawProxy and you're done."
            />
          </FadeIn>

          <div className="flex flex-col gap-[32px] sm:gap-[69px] w-full">
            {/* Feature 1: Smart Routing */}
            <FeatureCard
              icon="/landing/icon-route.svg"
              title="Smart Routing"
              description="Every request is classified by complexity. Simple tasks (heartbeats, status checks, file scans) go to Flash-Lite at $0.075/M. Medium tasks (emails, summaries) go to Haiku at $0.80/M. Complex tasks (architecture, debugging) stay on Opus 4.6 at $15/M. Your agents never notice the difference."
              dashboardImage="/landing/feature-smart-routing.png"
              dashboardSide="left"
            />

            {/* Feature 2: Loop Detection */}
            <FeatureCard
              icon="/landing/icon-loop.svg"
              title="Loop Detection"
              description="When an agent gets stuck repeating the same request, ClawProxy detects the pattern and kills the loop before it drains your wallet. One user's overnight loop would've cost $200 — we caught it at request #5."
              dashboardImage="/landing/feature-loop-detection.png"
              dashboardSide="right"
            />

            {/* Feature 3: Context Compression */}
            <FeatureCard
              icon="/landing/icon-compress.svg"
              title="Context Compression"
              description="Before billing, ClawProxy summarizes bloated contexts. 200K tokens become 40K. You pay for 40K. The model sees all the information it needs, just condensed."
              dashboardImage="/landing/feature-context-compression.png"
              dashboardSide="left"
            />

            {/* Feature 4: Hard Spending Limits */}
            <FeatureCard
              icon="/landing/icon-spending.svg"
              title="Hard Spending Limits"
              description="Set daily and monthly caps. Get alerts at 75% and 90%. Auto-pause non-essential requests when you hit your limit. Complex user-initiated tasks still go through."
              dashboardImage="/landing/feature-spending-limits.png"
              dashboardSide="right"
            />

            {/* Feature 5: Full Analytics */}
            <FeatureCard
              icon="/landing/icon-analytics.svg"
              title="Full Analytics"
              description="See cost per agent, cost per skill, hourly patterns, and 90-day history. CSV export. Know exactly where every dollar goes."
              dashboardImage="/landing/feature-full-analytics.png"
              dashboardSide="left"
            />
          </div>
        </div>
      </section>

      {/* ── Pricing Section ──────────────────────────────────────────────── */}
      <section id="pricing" className="flex justify-center pt-[80px] sm:pt-[184px] px-[16px]">
        <div className="max-w-[1014px] w-full flex flex-col items-center gap-[40px] sm:gap-[81px]">
          <FadeIn>
            <div className="flex flex-col items-center gap-[35px] w-full max-w-[849px] mx-auto">
              <SectionTag label="Pricing" />
              <h2
                className="text-[32px] sm:text-[60px] lg:text-[78px] leading-[1] text-center text-[#1A1A1A] glitch glitch-d5"
                style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.05em' }}
                data-text="Plans that pay for themselves."
              >
                Plans that pay for themselves.
              </h2>
              <p
                className="text-[17px] leading-[1.6] text-center text-[#55554F] max-w-[589px]"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Every plan saves more than it costs. If it doesn&apos;t, we&apos;ll refund you.
              </p>
            </div>
          </FadeIn>

          {/* Pricing cards */}
          <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[9px] justify-center items-stretch w-full">
            <FadeIn delay={0}>
            <PricingCard
              name="Starter"
              price="$0"
              icon={{ src: '/landing/icon-pricing-starter.svg', w: 57, h: 61 }}
              features={[
                'Smart routing to 3 models',
                'Up to 10,000 requests/mo',
                'Basic dashboard & 7-day history',
                '1 agent',
              ]}
              disabledFeatures={[
                'No loop detection',
                'No context compression',
              ]}
              buttonLabel="Start free →"
              buttonBg="#F0EFEB"
              buttonTextColor="#111110"
              buttonBorder="#E4E3DE"
              href={isLoggedIn ? '/dashboard/upgrade?plan=starter' : '/auth/signup'}
            />
            </FadeIn>

            <FadeIn delay={0.12}>
            <PricingCard
              name="Pro "
              price="$29"
              icon={{ src: '/landing/icon-pricing-pro.svg', w: 59, h: 66 }}
              popular
              borderColor="#157A3E"
              features={[
                'Everything in Free, plus:',
                'Unlimited requests',
                'Loop detection & auto-kill',
                'Context compression (80% reduction)',
                'Hard spending limits & alerts',
                '90-day analytics + CSV export',
                '3 agents + custom routing rules',
              ]}
              buttonLabel="Start Pro plan →"
              buttonBg="#157A3E"
              href={isLoggedIn ? '/dashboard/upgrade?plan=pro' : '/auth/signup?plan=pro'}
            />
            </FadeIn>

            <FadeIn delay={0.24}>
            <PricingCard
              name="Team"
              price="$79"
              icon={{ src: '/landing/icon-pricing-team.svg', w: 57, h: 57 }}
              features={[
                'Everything in Pro, plus:',
                'Unlimited agents',
                'Team members (up to 25 seats)',
                'Per-agent cost tracking',
                'Custom routing rules (unlimited)',
                'Priority support',
              ]}
              buttonLabel="Start Team plan →"
              buttonBg="#7C3AED"
              href={isLoggedIn ? '/dashboard/upgrade?plan=team' : '/auth/signup?plan=team'}
            />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      <section id="faq" className="flex justify-center pt-[80px] sm:pt-[184px] px-[16px]">
        <div className="max-w-[1014px] w-full flex flex-col items-center gap-[40px] sm:gap-[81px]">
          <FadeIn>
            <div className="flex flex-col items-center gap-[35px]">
              <SectionTag label="FAQ" />
              <h2
                className="text-[36px] sm:text-[60px] lg:text-[78px] leading-[1] text-center text-[#1A1A1A] glitch glitch-d3"
                style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.05em' }}
                data-text="Common questions."
              >
                Common questions.
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="w-full max-w-[700px] mx-auto">
              {faqItems.map((item) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <FadeIn y={0} className="mt-[80px] sm:mt-[184px]">
      <footer className="border-t border-[#E2E1DC]">
        <div className="max-w-[1425px] mx-auto px-[16px] sm:px-[40px] py-[24px] sm:py-[32px] flex flex-col items-center gap-[20px]">
          <Link href="/">
            <span
              className="text-[24px] text-black"
              style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.027em' }}
            >
              ClawProxy
            </span>
          </Link>

          <div className="flex items-center gap-[20px] sm:gap-[36px] flex-wrap justify-center">
            {[
              { label: 'Docs', href: '/docs' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'GitHub', href: 'https://github.com/tukijoshua', external: true },
              { label: 'Twitter / X', href: 'https://x.com/TukiFromKL', external: true },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[12px] sm:text-[13px] text-[#565656] hover:text-black transition"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center gap-[8px]">
            <span className="text-[11px] sm:text-[12px] text-[#484848]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              © 2026 ClawProxy. All rights reserved.
            </span>
            <span className="text-[11px] sm:text-[12px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              Built with love by{' '}
              <a
                href="https://x.com/TukiFromKL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#17803D] hover:underline"
              >
                Tuki Joshua
              </a>
            </span>
          </div>
        </div>
      </footer>
      </FadeIn>
    </main>
  );
}
