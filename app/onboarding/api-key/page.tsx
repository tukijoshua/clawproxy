'use client';

import { useState } from 'react';
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

export default function ApiKeyPage() {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const apiKey = 'cp_sk_a8f3x9d2e5b1c7f4m6k9p2r5t8w1y4';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <OnboardingLayout currentStep={5}>
      <div className="pt-[80px] sm:pt-[129px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[20px] sm:px-0">
        {/* Key icon */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/images/onboarding/icon-key.svg"
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
            Your API key
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] text-[#55554F] text-center">
            Copy this key — you&apos;ll need it in a moment.
            <br />
            We never store it in plain text.
          </p>
        </motion.div>

        {/* API Key + Warning */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[522px] mt-[28px] sm:mt-[33px] flex flex-col gap-[14px] sm:gap-[16px]"
        >
          {/* Dark key box */}
          <div
            className="w-full h-[52px] sm:h-[58px] rounded-[6px] flex items-center justify-between px-[16px] sm:px-[28px] relative overflow-hidden"
            style={{ backgroundColor: '#383838' }}
          >
            <span
              className="text-[11px] sm:text-[13.5px] leading-[1.32] text-white truncate mr-[12px]"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.022em',
              }}
            >
              {apiKey}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="cursor-pointer shrink-0"
            >
              <Image
                src="/images/onboarding/icon-copy.svg"
                alt="Copy"
                width={19}
                height={19}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.button>
            {copied && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-[28px] right-0 text-[12px] text-[#17803D] bg-[#E2F3EA] px-[8px] py-[4px] rounded-[4px]"
              >
                Copied!
              </motion.span>
            )}
          </div>

          {/* Warning box */}
          <div
            className="w-full min-h-[52px] sm:min-h-[58px] rounded-[8px] flex items-center gap-[12px] sm:gap-[16px] px-[14px] sm:px-[17px] py-[12px] sm:py-0"
            style={{
              backgroundColor: '#FFFBF0',
              border: '1px solid #E8D5A0',
            }}
          >
            <div className="shrink-0">
              <Image
                src="/images/onboarding/icon-alert.svg"
                alt=""
                width={25}
                height={25}
              />
            </div>
            <span className="text-[12px] sm:text-[13px] leading-[1.4] text-[#B8860B]">
              Save this somewhere safe. This is the only time you&apos;ll see the full key.
            </span>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[523px] flex items-center gap-[6px] mt-[24px] sm:mt-[28px]"
        >
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
            onClick={() => router.push('/onboarding/connection-test')}
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
              I&apos;ve saved it — continue →
            </span>
          </motion.button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
