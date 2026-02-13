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

export default function DonePage() {
  const router = useRouter();

  return (
    <OnboardingLayout currentStep={6}>
      <div className="pt-[80px] sm:pt-[129px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[20px] sm:px-0">
        {/* Stars icon */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/images/onboarding/icon-stars.svg"
            alt=""
            width={103}
            height={103}
            className="w-[80px] h-[80px] sm:w-[103px] sm:h-[103px]"
          />
        </motion.div>

        {/* Header */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-[10px] mt-[18px] sm:mt-[22px]"
        >
          <h1
            className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center tracking-[-0.027em]"
            style={{ fontFamily: 'PP Mondwest, serif' }}
          >
            You&apos;re all set!
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] text-[#55554F] text-center w-full max-w-[419px]">
            ClawProxy is now active. Every request from your
            OpenClaw agent is being intelligently routed to save you money.
          </p>
        </motion.div>

        {/* Savings card */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-[28px] sm:mt-[33px] w-full max-w-[380px]"
        >
          <div
            className="w-full rounded-[10px] py-[20px] sm:py-0 sm:h-[138px] flex flex-col items-center justify-center"
            style={{
              backgroundColor: '#E2F3EA',
              border: '2px solid #17803D',
            }}
          >
            <span
              className="text-[12px] leading-[1.08] text-[#0C5526] text-center uppercase"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              Projected monthly savings
            </span>
            <div className="flex items-end gap-[24px] sm:gap-[37px] mt-[14px] sm:mt-[16px]">
              {/* $247 */}
              <div className="flex flex-col items-center gap-[10px] sm:gap-[15px]">
                <span className="text-[28px] sm:text-[32px] leading-[1.15] text-[#17803D] tracking-[-0.031em]">
                  $247
                </span>
                <span
                  className="text-[11px] sm:text-[12px] leading-[1.302] text-[#0C5526] text-center"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  you&apos;ll save
                </span>
              </div>
              {/* 73% */}
              <div className="flex flex-col items-center gap-[10px] sm:gap-[15px]">
                <span className="text-[28px] sm:text-[32px] leading-[1.15] text-[#17803D] tracking-[-0.031em]">
                  73%
                </span>
                <span
                  className="text-[11px] sm:text-[12px] leading-[1.302] text-[#0C5526] text-center"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  cheaper
                </span>
              </div>
              {/* 8.5× */}
              <div className="flex flex-col items-center gap-[10px] sm:gap-[15px]">
                <span className="text-[28px] sm:text-[32px] leading-[1.15] text-[#17803D] tracking-[-0.031em]">
                  8.5×
                </span>
                <span
                  className="text-[11px] sm:text-[12px] leading-[1.302] text-[#0C5526] text-center"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  ROI on Pro
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Primary button */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-[12px] mt-[24px] sm:mt-[28px] w-full max-w-[381px]"
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/dashboard')}
            className="w-full h-[43px] rounded-lg flex items-center justify-center cursor-pointer"
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
              Open my dashboard →
            </span>
          </motion.button>

          {/* Secondary buttons */}
          <div className="flex items-center gap-[6px] w-full">
            <motion.a
              href="https://docs.clawproxy.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer"
              style={{ transition: 'background-color 0.15s ease' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#E8E7E4')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#F0EFED')
              }
            >
              <Image
                src="/images/onboarding/icon-file.svg"
                alt=""
                width={18}
                height={18}
              />
              <span
                className="text-[14px] sm:text-[15px] leading-[1.15] text-black"
                style={{ letterSpacing: '-0.013em' }}
              >
                Read docs
              </span>
            </motion.a>
            <motion.a
              href="https://discord.gg/clawproxy"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer"
              style={{ transition: 'background-color 0.15s ease' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#E8E7E4')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#F0EFED')
              }
            >
              <Image
                src="/images/onboarding/icon-discord.svg"
                alt=""
                width={18}
                height={18}
              />
              <span
                className="text-[14px] sm:text-[15px] leading-[1.15] text-black"
                style={{ letterSpacing: '-0.013em' }}
              >
                Join Discord
              </span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
