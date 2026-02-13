'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from './components/OnboardingLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function OnboardingPage() {
  const [role, setRole] = useState<'technical' | 'non-technical' | null>(null);
  const [agentCount, setAgentCount] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!role || !agentCount) return;
    localStorage.setItem(
      'onboarding',
      JSON.stringify({ role, agentCount, step: 3 })
    );
    router.push('/onboarding/how-it-works');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout currentStep={2}>
      <div className="w-full max-w-[520px] pt-[50px] sm:pt-[77px] px-[20px] sm:px-0 pb-[40px] sm:pb-[60px] flex flex-col items-center gap-[32px] sm:gap-[40px]">
        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[335px] flex flex-col items-center gap-[10px]"
        >
          <h1
            className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center w-full"
            style={{
              fontFamily: 'PP Mondwest, serif',
              letterSpacing: '-0.027em',
            }}
          >
            Welcome! Quick question
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] text-[#55554F] text-center w-full">
            This helps us give you the right setup instructions.
          </p>
        </motion.div>

        {/* Option cards */}
        <div className="w-full flex flex-col sm:flex-row gap-[12px]">
          {/* I'm technical */}
          <motion.button
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setRole('technical')}
            className="w-full sm:w-[254px] rounded-[10px] cursor-pointer flex flex-col items-center py-[28px] sm:py-[38px] px-[20px]"
            style={{
              backgroundColor: 'white',
              border:
                role === 'technical'
                  ? '2px solid #17803D'
                  : '2px solid #E2E1DC',
              boxShadow:
                role === 'technical'
                  ? '0 0 0 3px rgba(23, 128, 61, 0.1)'
                  : 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <Image
              src="/images/onboarding/icon-technical.svg"
              alt=""
              width={30}
              height={30}
            />
            <span className="text-[15px] leading-[1.15] text-[#111110] mt-[10px]">
              I&apos;m technical
            </span>
            <span className="text-[12.5px] leading-[1.5] text-[#8F8F87] text-center mt-[6px] max-w-[195px]">
              I can edit config files, run terminal commands, and manage my
              own setup.
            </span>
          </motion.button>

          {/* I'm non-technical */}
          <motion.button
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setRole('non-technical')}
            className="w-full sm:w-[254px] rounded-[10px] cursor-pointer flex flex-col items-center py-[28px] sm:py-[38px] px-[20px]"
            style={{
              backgroundColor: 'white',
              border:
                role === 'non-technical'
                  ? '2px solid #17803D'
                  : '2px solid #E2E1DC',
              boxShadow:
                role === 'non-technical'
                  ? '0 0 0 3px rgba(23, 128, 61, 0.1)'
                  : 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <Image
              src="/images/onboarding/icon-nontechnical.svg"
              alt=""
              width={30}
              height={30}
            />
            <span className="text-[15px] leading-[1.15] text-[#111110] mt-[10px]">
              I&apos;m non-technical
            </span>
            <span className="text-[12.5px] leading-[1.5] text-[#8F8F87] text-center mt-[6px] max-w-[210px]">
              I use OpenClaw but don&apos;t want to touch config files. Just
              make it work!
            </span>
          </motion.button>
        </div>

        {/* Agent count question */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-[10px]"
        >
          <span className="text-[13px] leading-[1.15] text-[#8F8F87] text-center">
            How many agents do you run?
          </span>
          <div className="flex gap-[8px]">
            {[
              { value: '1', width: 49 },
              { value: '2–5', width: 63 },
              { value: '5+', width: 57 },
            ].map((chip) => (
              <motion.button
                key={chip.value}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setAgentCount(chip.value)}
                className="h-[33px] rounded-lg flex items-center justify-center cursor-pointer"
                style={{
                  width: `${chip.width}px`,
                  backgroundColor:
                    agentCount === chip.value ? '#17803D' : 'white',
                  border:
                    agentCount === chip.value
                      ? '1px solid #17803D'
                      : '1px solid #E2E1DC',
                  transition:
                    'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                <span
                  className="text-[13px] leading-[1.15] text-center"
                  style={{
                    letterSpacing: '-0.008em',
                    color:
                      agentCount === chip.value ? '#FFFFFF' : '#55554F',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {chip.value}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full flex items-center gap-[6px]"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
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
            whileHover={role && agentCount ? { scale: 1.01 } : {}}
            whileTap={role && agentCount ? { scale: 0.99 } : {}}
            onClick={handleContinue}
            disabled={!role || !agentCount}
            className="flex-1 h-[43px] rounded-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                !role || !agentCount
                  ? 'rgba(23, 128, 61, 0.4)'
                  : '#17803D',
              transition: 'background-color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (role && agentCount)
                e.currentTarget.style.backgroundColor = '#14702f';
            }}
            onMouseLeave={(e) => {
              if (role && agentCount)
                e.currentTarget.style.backgroundColor = '#17803D';
            }}
          >
            <span
              className="text-[14px] sm:text-[15px] leading-[1.15] text-white"
              style={{ letterSpacing: '-0.013em' }}
            >
              Continue →
            </span>
          </motion.button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
