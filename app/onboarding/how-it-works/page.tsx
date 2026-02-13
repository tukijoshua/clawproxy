'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '../components/OnboardingLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <OnboardingLayout currentStep={3}>
      <div className="pt-[40px] sm:pt-[69px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0 w-full">
        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-[10px]"
        >
          <h1
            className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center tracking-[-0.027em]"
            style={{ fontFamily: 'PP Mondwest, serif' }}
          >
            Here&apos;s how ClawProxy works
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] text-[#55554F] text-center">
            3 things happen when you connect. Takes 30 seconds.
          </p>
        </motion.div>

        {/* Timeline content */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[680px] mt-[32px] sm:mt-[40px]"
        >
          {/* Section 1: Config change */}
          <div className="flex">
            <div className="flex flex-col items-center w-[32px] sm:w-[40px] flex-shrink-0">
              <div className="w-[32px] sm:w-[40px] h-[32px] sm:h-[40px] rounded-[8px] sm:rounded-[10px] border border-[#E2E1DC] bg-white flex items-center justify-center">
                <span className="text-[14px] sm:text-[16px] leading-[1.15] text-[#0C5526]">1</span>
              </div>
              <div className="w-[2px] flex-1 bg-[#17803D]" />
            </div>
            <div className="flex-1 ml-[12px] sm:ml-[18px] pt-[4px] sm:pt-[6px]">
              <h3 className="text-[15px] sm:text-[16px] leading-[1.15] tracking-[-0.0125em] text-[#111110]">
                You change one line in your config
              </h3>
              <p className="mt-[6px] text-[13px] sm:text-[13.5px] leading-[1.6] text-[#55554F]">
                Instead of sending requests directly to Anthropic, they go through ClawProxy first. Your agent
                doesn&apos;t notice any difference.
              </p>
              <div
                className="mt-[12px] sm:mt-[15px] w-full rounded-[5px] px-[12px] sm:px-[16px] py-[12px] sm:py-[14px] overflow-x-auto"
                style={{ backgroundColor: '#383838' }}
              >
                <pre
                  className="text-[11px] sm:text-[12px] leading-[1.7] text-white whitespace-pre"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
{`// Before (expensive — every request hits Opus)
"apiBaseUrl": "https://api.anthropic.com"

// After (smart — we route to the right model)
"apiBaseUrl": "https://api.clawproxy.ai/v1"`}
                </pre>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-[20px] sm:h-[28px]" />

          {/* Section 2: Classification */}
          <div className="flex">
            <div className="flex flex-col items-center w-[32px] sm:w-[40px] flex-shrink-0">
              <div className="w-[32px] sm:w-[40px] h-[32px] sm:h-[40px] rounded-[8px] sm:rounded-[10px] border border-[#E2E1DC] bg-white flex items-center justify-center">
                <span className="text-[14px] sm:text-[16px] leading-[1.15] text-[#0C5526]">2</span>
              </div>
              <div className="w-[2px] flex-1 bg-[#17803D]" />
            </div>
            <div className="flex-1 ml-[12px] sm:ml-[18px] pt-[4px] sm:pt-[6px]">
              <h3 className="text-[15px] sm:text-[16px] leading-[1.15] tracking-[-0.0125em] text-[#111110]">
                We classify every request in real-time
              </h3>
              <p className="mt-[6px] text-[13px] sm:text-[13.5px] leading-[1.6] text-[#55554F]">
                Each request gets analyzed: is this a simple heartbeat? An email draft? Complex code review? We
                figure it out in under 1ms.
              </p>
              {/* Flow diagram */}
              <div className="mt-[12px] sm:mt-[15px] flex flex-col sm:flex-row items-stretch sm:items-center gap-[6px] sm:gap-[7px]">
                <div className="h-[32px] bg-white border border-[#E2E1DC] rounded-[10px] flex items-center gap-[4px] px-[12px] sm:px-[15px] sm:w-[194px]">
                  <Image src="/images/onboarding/icon-robot.svg" alt="" width={17} height={17} className="shrink-0" />
                  <span className="text-[11px] sm:text-[12px] leading-[1.15] text-[#111110] text-center flex-1">
                    Your agent sends request
                  </span>
                </div>
                <Image src="/images/onboarding/icon-arrow-right.svg" alt="" width={10} height={10} className="hidden sm:block shrink-0" />
                <div className="h-[32px] bg-white border border-[#E2E1DC] rounded-[10px] flex items-center gap-[4px] px-[12px] sm:px-[13.5px] sm:w-[159px]">
                  <Image src="/images/onboarding/icon-brain.svg" alt="" width={17} height={17} className="shrink-0" />
                  <span className="text-[11px] sm:text-[12px] leading-[1.15] text-[#111110] text-center flex-1">
                    ClawProxy classifies
                  </span>
                </div>
                <Image src="/images/onboarding/icon-arrow-right.svg" alt="" width={10} height={10} className="hidden sm:block shrink-0" />
                <div className="h-[32px] bg-white border border-[#E2E1DC] rounded-[10px] flex items-center gap-[4px] px-[12px] sm:px-[15.5px] sm:w-[177px]">
                  <Image src="/images/onboarding/icon-zap.svg" alt="" width={17} height={17} className="shrink-0" />
                  <span className="text-[11px] sm:text-[12px] leading-[1.15] text-[#111110] text-center flex-1">
                    Routes to best model
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-[24px] sm:h-[32px]" />

          {/* Section 3: Cost routing */}
          <div className="flex">
            <div className="flex flex-col items-center w-[32px] sm:w-[40px] flex-shrink-0">
              <div className="w-[32px] sm:w-[40px] h-[32px] sm:h-[40px] rounded-[8px] sm:rounded-[10px] border border-[#E2E1DC] bg-white flex items-center justify-center">
                <span className="text-[14px] sm:text-[16px] leading-[1.15] text-[#0C5526]">3</span>
              </div>
              <div className="w-[2px] flex-1 bg-[#17803D]" />
            </div>
            <div className="flex-1 ml-[12px] sm:ml-[18px] pt-[4px] sm:pt-[6px]">
              <h3 className="text-[15px] sm:text-[16px] leading-[1.15] tracking-[-0.0125em] text-[#111110]">
                Simple tasks → cheap models. Complex → stays premium.
              </h3>
              <p className="mt-[6px] text-[13px] sm:text-[13.5px] leading-[1.6] text-[#55554F]">
                A &quot;yes/no&quot; heartbeat check doesn&apos;t need a $15/M token model. We send it to Flash-Lite at $0.075/M
                same answer, 200× cheaper. Complex tasks still go to Opus.
              </p>
              {/* Pricing cards */}
              <div className="mt-[12px] sm:mt-[15px] grid grid-cols-3 gap-[8px]">
                {[
                  { icon: '/images/onboarding/icon-bubble-chat.svg', label: 'Simple', desc: 'Heartbeats, lookups', price: '$0.50/M' },
                  { icon: '/images/onboarding/icon-mail.svg', label: 'Medium', desc: 'Emails, summaries', price: '$0.80/M' },
                  { icon: '/images/onboarding/icon-brain-complex.svg', label: 'Complex', desc: 'Code, analysis', price: '$15/M' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-white border border-[#E2E1DC] rounded-[10px] flex flex-col items-center justify-center gap-[6px] px-[8px] sm:px-[10px] py-[14px] sm:py-[18px]"
                  >
                    <Image src={card.icon} alt="" width={21} height={21} className="shrink-0" />
                    <div
                      className="text-center"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      <span className="text-[11px] sm:text-[12px] leading-[1.302] font-semibold text-[#111110] block">
                        {card.label}
                      </span>
                      <span className="text-[10px] sm:text-[12px] leading-[1.302] text-[#8F8F87] block">
                        {card.desc}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] leading-[1.15] text-[#17803D] text-center">
                      {card.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Green result card */}
          <div className="mt-[20px] sm:mt-[28px] w-full max-w-[680px] rounded-[10px] flex items-start gap-[12px] sm:gap-[16px] p-[14px] sm:p-[20px]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #B8DBCA' }}>
            <div className="shrink-0 mt-[2px]">
              <Image src="/images/onboarding/icon-idea.svg" alt="" width={25} height={25} />
            </div>
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] sm:text-[14px] leading-[1.3] text-[#0C5526]">
                Average result: $312/mo → $84/mo
              </span>
              <span className="text-[12px] sm:text-[12.5px] leading-[1.3] text-[#0C5526] opacity-80">
                That&apos;s $228/month back in your pocket. Your agent works exactly the same.
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-[20px] sm:mt-[24px] flex items-center gap-[6px]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="w-[80px] sm:w-[96px] h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer shrink-0"
              style={{ transition: 'background-color 0.15s ease' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#E8E7E4')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#F0EFED')
              }
            >
              <Image
                src="/images/onboarding/icon-back-arrow.svg"
                alt=""
                width={8}
                height={8}
              />
              <span
                className="text-[15px] leading-[1.15] text-black"
                style={{ letterSpacing: '-0.013em' }}
              >
                Back
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/onboarding/setup')}
              className="flex-1 h-[43px] rounded-lg flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: '#17803D',
                transition: 'background-color 0.25s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#14702f')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#17803D')
              }
            >
              <span
                className="text-[13px] sm:text-[14px] leading-[1.15] text-white"
                style={{ letterSpacing: '-0.007em' }}
              >
                Let&apos;s set it up →
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
