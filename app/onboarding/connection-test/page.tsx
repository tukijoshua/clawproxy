'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingLayout from '../components/OnboardingLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const CHECKLIST = [
  'Reaching ClawProxy servers',
  'Validating API key',
  'Waiting for first request',
  'Routing verified',
];

type StepStatus = 'pending' | 'running' | 'done';

export default function ConnectionTestPage() {
  const router = useRouter();
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    CHECKLIST.map(() => 'pending')
  );
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const delays = [400, 1800, 3400, 5200];
    const durations = [1200, 1400, 1600, 1000];
    const timers: ReturnType<typeof setTimeout>[] = [];

    CHECKLIST.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = 'running';
            return next;
          });
        }, delays[i])
      );

      timers.push(
        setTimeout(() => {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = 'done';
            return next;
          });

          if (i === CHECKLIST.length - 1) {
            setTimeout(() => setAllDone(true), 400);
          }
        }, delays[i] + durations[i])
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <OnboardingLayout currentStep={5}>
      <div className="pt-[80px] sm:pt-[129px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0 w-full max-w-[480px]">
        {/* Status heading - changes based on progress */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-[28px] sm:mt-[36px] text-center"
        >
          <AnimatePresence mode="wait">
            {allDone ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center gap-[10px] mb-[8px]">
                  <Image
                    src="/images/onboarding/icon-checkmark-square.svg"
                    alt=""
                    width={32}
                    height={32}
                  />
                  <h1 className="text-[22px] sm:text-[26px] leading-[1.15] text-[#111110]">
                    Connection successful!
                  </h1>
                </div>
                <p className="text-[13px] sm:text-[14px] leading-[1.15] text-[#55554F]">
                  ClawProxy is receiving requests. Everything works.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-[22px] sm:text-[26px] leading-[1.15] text-[#111110]">
                  Testing connection...
                </h1>
                <p className="text-[13px] sm:text-[14px] leading-[1.15] text-[#55554F] mt-[6px]">
                  Running diagnostics. This takes a few seconds.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Checklist */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-[20px] sm:mt-[24px] w-full max-w-[360px]"
        >
          {CHECKLIST.map((label, i) => (
            <div
              key={label}
              className="flex items-center h-[45px]"
              style={{
                borderBottom:
                  i < CHECKLIST.length - 1 ? '1px solid #EEEDE9' : 'none',
              }}
            >
              {/* Status icon */}
              <div className="w-[24px] h-[24px] flex-shrink-0 flex items-center justify-center">
                {stepStatuses[i] === 'done' ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  >
                    <Image
                      src="/images/onboarding/icon-status-green.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </motion.div>
                ) : stepStatuses[i] === 'running' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-[18px] h-[18px] rounded-full border-[2px] border-[#E2E1DC] border-t-[#17803D]"
                  />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-[2px] border-[#E2E1DC]" />
                )}
              </div>
              <span
                className="ml-[10px] text-[13px] sm:text-[13.5px] leading-[1.15] transition-all duration-300"
                style={{
                  color: stepStatuses[i] === 'done' ? '#111110' : stepStatuses[i] === 'running' ? '#111110' : '#B8B8B0',
                }}
              >
                {label}
              </span>
              {stepStatuses[i] === 'running' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto text-[11px] text-[#17803D]"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  running
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Continue button - appears after all checks */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="mt-[24px] sm:mt-[28px] w-full max-w-[360px]"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push('/onboarding/done')}
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
                  Continue to dashboard →
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
}
