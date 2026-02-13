'use client';

import { useEffect, useState, useCallback } from 'react';
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
  { key: 'server', label: 'Reaching ClawProxy servers' },
  { key: 'api_key', label: 'Validating API key' },
  { key: 'upstream', label: 'Testing upstream provider' },
  { key: 'logging', label: 'Verifying request logging' },
];

type StepStatus = 'pending' | 'running' | 'done' | 'failed';

interface TestResult {
  step: string;
  status: 'pass' | 'fail';
  message: string;
  detail?: string;
}

export default function ConnectionTestPage() {
  const router = useRouter();
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    CHECKLIST.map(() => 'pending')
  );
  const [allDone, setAllDone] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [failedStep, setFailedStep] = useState<{ message: string; detail?: string } | null>(null);
  const [retrying, setRetrying] = useState(false);

  const runTest = useCallback(async () => {
    setStepStatuses(CHECKLIST.map(() => 'pending'));
    setAllDone(false);
    setHasFailed(false);
    setFailedStep(null);

    // Animate steps one by one based on real results
    setStepStatuses((prev) => {
      const next = [...prev];
      next[0] = 'running';
      return next;
    });

    try {
      const res = await fetch('/api/proxy/test', { method: 'POST' });
      const data = await res.json();
      const results: TestResult[] = data.results ?? [];

      // Animate each result with a small delay between steps
      for (let i = 0; i < CHECKLIST.length; i++) {
        const result = results.find((r) => r.step === CHECKLIST[i].key);

        if (!result) {
          // Step wasn't reached (earlier step failed)
          break;
        }

        // Mark current step as done or failed
        await new Promise((r) => setTimeout(r, 400));

        if (result.status === 'pass') {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = 'done';
            // Start next step if exists
            if (i + 1 < CHECKLIST.length) next[i + 1] = 'running';
            return next;
          });
        } else {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = 'failed';
            return next;
          });
          setHasFailed(true);
          setFailedStep({ message: result.message, detail: result.detail });
          setRetrying(false);
          return;
        }
      }

      // All passed
      await new Promise((r) => setTimeout(r, 300));
      setAllDone(true);
    } catch {
      // Network error
      setStepStatuses((prev) => {
        const next = [...prev];
        next[0] = 'failed';
        return next;
      });
      setHasFailed(true);
      setFailedStep({
        message: 'Network error',
        detail: 'Could not reach the server. Make sure the dev server is running (npm run dev).',
      });
    }
    setRetrying(false);
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const handleRetry = () => {
    setRetrying(true);
    runTest();
  };

  return (
    <OnboardingLayout currentStep={5}>
      <div className="pt-[80px] sm:pt-[129px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0 w-full max-w-[480px]">
        {/* Status heading */}
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
                  ClawProxy is receiving and routing requests. Everything works.
                </p>
              </motion.div>
            ) : hasFailed ? (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-[22px] sm:text-[26px] leading-[1.15] text-[#C23A2D]">
                  Connection failed
                </h1>
                <p className="text-[13px] sm:text-[14px] leading-[1.15] text-[#55554F] mt-[6px]">
                  One of the checks didn&apos;t pass. See details below.
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
                  Running live diagnostics against your proxy setup.
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
          {CHECKLIST.map((item, i) => (
            <div
              key={item.key}
              className="flex items-center h-[45px]"
              style={{
                borderBottom:
                  i < CHECKLIST.length - 1 ? '1px solid #EEEDE9' : 'none',
              }}
            >
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
                ) : stepStatuses[i] === 'failed' ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="w-[20px] h-[20px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FDECEA' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="#C23A2D" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
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
                  color:
                    stepStatuses[i] === 'done'
                      ? '#111110'
                      : stepStatuses[i] === 'failed'
                        ? '#C23A2D'
                        : stepStatuses[i] === 'running'
                          ? '#111110'
                          : '#B8B8B0',
                }}
              >
                {item.label}
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
              {stepStatuses[i] === 'done' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto text-[11px] text-[#17803D]"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  pass
                </motion.span>
              )}
              {stepStatuses[i] === 'failed' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto text-[11px] text-[#C23A2D]"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  fail
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Error detail box */}
        <AnimatePresence>
          {hasFailed && failedStep && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-[16px] w-full max-w-[360px]"
            >
              <div
                className="rounded-[8px] px-[16px] py-[14px]"
                style={{ backgroundColor: '#FFF5F5', border: '1px solid #FED7D7' }}
              >
                <p className="text-[13px] leading-[1.4] text-[#C23A2D] font-medium">
                  {failedStep.message}
                </p>
                {failedStep.detail && (
                  <p className="text-[12px] leading-[1.5] text-[#9B2C2C] mt-[6px]">
                    {failedStep.detail}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
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

          {hasFailed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-[16px] w-full max-w-[360px] flex gap-[8px]"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="w-[96px] h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer shrink-0"
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
                onClick={handleRetry}
                disabled={retrying}
                className="flex-1 h-[43px] rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-60"
                style={{
                  backgroundColor: '#111110',
                  transition: 'background-color 0.25s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#2a2a28')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#111110')
                }
              >
                <span
                  className="text-[13px] sm:text-[14px] leading-[1.15] text-white"
                  style={{ letterSpacing: '-0.007em' }}
                >
                  {retrying ? 'Retrying...' : 'Retry connection test'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
}
