'use client';

import { useState, useCallback } from 'react';
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
type PageState = 'configure' | 'testing' | 'success' | 'failed';

interface TestResult {
  step: string;
  status: 'pass' | 'fail';
  message: string;
  detail?: string;
}

export default function ConnectionTestPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('configure');
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    CHECKLIST.map(() => 'pending')
  );
  const [failedStep, setFailedStep] = useState<{ message: string; detail?: string } | null>(null);
  const [retrying, setRetrying] = useState(false);

  const runTest = useCallback(async () => {
    setPageState('testing');
    setStepStatuses(CHECKLIST.map(() => 'pending'));
    setFailedStep(null);

    setStepStatuses((prev) => {
      const next = [...prev];
      next[0] = 'running';
      return next;
    });

    try {
      const res = await fetch('/api/proxy/test', { method: 'POST' });
      const data = await res.json();
      const results: TestResult[] = data.results ?? [];

      for (let i = 0; i < CHECKLIST.length; i++) {
        const result = results.find((r) => r.step === CHECKLIST[i].key);

        if (!result) break;

        await new Promise((r) => setTimeout(r, 400));

        if (result.status === 'pass') {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = 'done';
            if (i + 1 < CHECKLIST.length) next[i + 1] = 'running';
            return next;
          });
        } else {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = 'failed';
            return next;
          });
          setPageState('failed');
          setFailedStep({ message: result.message, detail: result.detail });
          setRetrying(false);
          return;
        }
      }

      await new Promise((r) => setTimeout(r, 300));
      setPageState('success');
    } catch {
      setStepStatuses((prev) => {
        const next = [...prev];
        next[0] = 'failed';
        return next;
      });
      setPageState('failed');
      setFailedStep({
        message: 'Network error',
        detail: 'Could not reach the server. Check your internet connection and try again.',
      });
    }
    setRetrying(false);
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    runTest();
  };

  // ── "Configure first" initial state ──
  if (pageState === 'configure') {
    return (
      <OnboardingLayout currentStep={5}>
        <div className="pt-[40px] sm:pt-[80px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0 w-full max-w-[440px]">
          {/* Icon */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div
              className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E7', border: '2px solid #E8D5A0' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px]">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-[20px] sm:mt-[24px] text-center"
          >
            <h1
              className="text-[24px] sm:text-[28px] leading-[1.15] text-[#111110] tracking-[-0.027em]"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              Have you configured your agent?
            </h1>
            <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#55554F] mt-[10px]">
              Before we test the connection, make sure you&apos;ve set up your
              OpenClaw agent to route through ClawProxy.
            </p>
          </motion.div>

          {/* Checklist */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-[24px] sm:mt-[28px] w-full"
          >
            <div
              className="rounded-[10px] px-[18px] sm:px-[22px] py-[16px] sm:py-[20px]"
              style={{ backgroundColor: '#FAFAF8', border: '1px solid #E2E1DC' }}
            >
              <p className="text-[12px] leading-[1.15] text-[#8F8F87] uppercase tracking-[0.05em] mb-[14px]">
                Setup checklist
              </p>
              {[
                'Ran the setup command or edited your config manually',
                'Added your ClawProxy API key to the config',
                'Restarted your OpenClaw agent (openclaw restart)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-[10px] mb-[10px] last:mb-0">
                  <div className="w-[18px] h-[18px] rounded-[4px] border border-[#D4D4CF] bg-white shrink-0 mt-[1px]" />
                  <span className="text-[13px] leading-[1.45] text-[#55554F]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-[24px] sm:mt-[28px] w-full flex flex-col gap-[10px]"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={runTest}
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
                Yes, I&apos;ve configured it — test now
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/onboarding/setup')}
              className="w-full h-[43px] rounded-lg flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: '#F0EFED',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#E8E7E4')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#F0EFED')
              }
            >
              <span
                className="text-[13px] sm:text-[14px] leading-[1.15] text-[#55554F]"
                style={{ letterSpacing: '-0.007em' }}
              >
                Not yet — take me back to setup
              </span>
            </motion.button>
          </motion.div>
        </div>
      </OnboardingLayout>
    );
  }

  // ── Testing / Success / Failed states ──
  return (
    <OnboardingLayout currentStep={5}>
      <div className="pt-[50px] sm:pt-[129px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0 w-full max-w-[480px]">
        {/* Status heading */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-[28px] sm:mt-[36px] text-center"
        >
          <AnimatePresence mode="wait">
            {pageState === 'success' ? (
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
            ) : pageState === 'failed' ? (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-[22px] sm:text-[26px] leading-[1.15] text-[#C23A2D]">
                  Connection failed
                </h1>
                <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#55554F] mt-[6px] max-w-[340px] mx-auto">
                  One of the checks didn&apos;t pass. Make sure you&apos;ve configured your agent and try again.
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
          {pageState === 'failed' && failedStep && (
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
          {pageState === 'success' && (
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

          {pageState === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-[16px] w-full max-w-[360px] flex flex-col gap-[8px]"
            >
              <div className="flex gap-[8px]">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/onboarding/setup')}
                  className="w-[130px] h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer shrink-0"
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
                    className="text-[14px] leading-[1.15] text-black"
                    style={{ letterSpacing: '-0.013em' }}
                  >
                    Back to setup
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
}
