'use client';

import { useState, useEffect, useRef } from 'react';
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

/* ── Copy button ── */
function CopyBtn({ text, light }: { text: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-[10px] right-[10px] cursor-pointer"
    >
      <Image
        src="/images/onboarding/icon-copy.svg"
        alt="Copy"
        width={19}
        height={19}
        style={{ filter: light ? 'none' : 'brightness(0) invert(1)' }}
      />
      {copied && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-[28px] right-0 text-[12px] text-[#17803D] bg-[#E2F3EA] px-[8px] py-[4px] rounded-[4px] whitespace-nowrap"
        >
          Copied!
        </motion.span>
      )}
    </motion.button>
  );
}

export default function SetupPage() {
  const [apiKey, setApiKey] = useState('');
  const [keyLoading, setKeyLoading] = useState(true);
  const [keyError, setKeyError] = useState('');
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const [keyCopied, setKeyCopied] = useState(false);
  const generatingRef = useRef(false);
  const router = useRouter();

  // Check if in reconnect mode
  const [isReconnect, setIsReconnect] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsReconnect(new URLSearchParams(window.location.search).get('reconnect') === '1');
    }
  }, []);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Generate or restore API key (skip in reconnect mode)
  useEffect(() => {
    if (isReconnect) {
      setKeyLoading(false);
      return;
    }

    const stored = localStorage.getItem('onboarding_api_key');
    if (stored) {
      setApiKey(stored);
      setKeyLoading(false);
      return;
    }

    if (generatingRef.current) return;
    generatingRef.current = true;

    const generate = async () => {
      try {
        const res = await fetch('/api/keys/generate', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate key');
        setApiKey(data.key);
        localStorage.setItem('onboarding_api_key', data.key);
      } catch (err: unknown) {
        setKeyError(err instanceof Error ? err.message : 'Failed to generate key');
      } finally {
        setKeyLoading(false);
      }
    };
    generate();
  }, [isReconnect]);

  const handleCopyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleContinue = async () => {
    setVerifying(true);
    setVerifyError('');

    try {
      const testRes = await fetch('/api/onboarding/test-connection', { method: 'POST' });
      const testData = await testRes.json();

      if (!testRes.ok || !testData.success) {
        setVerifyError(
          testData.message || 'Connection verification failed. Make sure you have configured your agent correctly.',
        );
        setVerifying(false);
        return;
      }

      // If onboarding (not reconnect), complete it
      if (!isReconnect) {
        let role: string | null = null;
        let agentCount = 0;
        try {
          const stored = JSON.parse(localStorage.getItem('onboarding') || '{}');
          role = stored.role || null;
          agentCount = stored.agentCount ? parseInt(stored.agentCount, 10) : 0;
        } catch {
          /* ignore */
        }

        await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, agentCount }),
        });

        localStorage.removeItem('onboarding');
        localStorage.removeItem('onboarding_api_key');
      }

      router.push('/dashboard');
    } catch {
      setVerifyError('Could not reach the server. Check your internet connection.');
      setVerifying(false);
    }
  };

  const autoCommand = 'curl -fsSL https://www.clawproxy.ai/setup | bash';

  const manualConfigKey = isReconnect ? '<YOUR_SAVED_API_KEY>' : apiKey;
  const manualConfig = manualConfigKey
    ? JSON.stringify(
        {
          models: {
            providers: {
              anthropic: {
                baseUrl: 'https://www.clawproxy.ai/api/proxy/v1',
                headers: { 'x-clawproxy-key': manualConfigKey },
                models: [
                  { id: 'claude-opus-4-0-20250514', name: 'Claude Opus 4', contextWindow: 200000, maxTokens: 32000 },
                  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', contextWindow: 200000, maxTokens: 32000 },
                  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000, maxTokens: 16000 },
                  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000, maxTokens: 8192 },
                ],
              },
            },
          },
        },
        null,
        2,
      )
    : '';

  const canContinue = isReconnect || !!apiKey;

  return (
    <OnboardingLayout currentStep={4}>
      <div className="pt-[32px] sm:pt-[56px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0 w-full">
        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[540px] flex flex-col items-center gap-[10px]"
        >
          <h1
            className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center w-full tracking-[-0.027em]"
            style={{ fontFamily: 'PP Mondwest, serif' }}
          >
            {isReconnect ? 'Reconnect your agent' : 'Connect your agent'}
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] text-[#55554F] text-center w-full">
            {isReconnect
              ? 'Reconfigure your OpenClaw agent using the API key you saved when you first set up.'
              : 'Copy your API key and configure your OpenClaw agent to route through ClawProxy.'}
          </p>
        </motion.div>

        {/* Error notification */}
        <AnimatePresence>
          {verifyError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="w-full max-w-[540px] mt-[16px]"
            >
              <div
                className="flex items-start gap-[12px] px-[16px] py-[14px] rounded-[8px]"
                style={{ backgroundColor: '#FFF5F5', border: '1px solid #FED7D7' }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 mt-[1px]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="text-[13px] leading-[1.4] text-[#C23A2D] font-medium">
                    Configuration not detected
                  </p>
                  <p className="text-[12px] leading-[1.5] text-[#C23A2D] mt-[2px] opacity-80">
                    {verifyError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* API Key box (onboarding mode only) */}
        {!isReconnect && (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[540px] mt-[24px] sm:mt-[28px] flex flex-col gap-[12px]"
          >
            <div
              className="w-full h-[52px] sm:h-[58px] rounded-[6px] flex items-center justify-between px-[16px] sm:px-[28px] relative"
              style={{ backgroundColor: '#383838' }}
            >
              {keyLoading ? (
                <div className="flex items-center gap-[8px] flex-1">
                  <div className="h-[14px] w-[200px] sm:w-[320px] bg-[#555] rounded animate-pulse" />
                </div>
              ) : keyError ? (
                <span className="text-[12px] sm:text-[13px] leading-[1.32] text-red-400 truncate mr-[12px]">
                  {keyError}
                </span>
              ) : (
                <span
                  className="text-[11px] sm:text-[13.5px] leading-[1.32] text-white truncate mr-[12px]"
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.022em' }}
                >
                  {apiKey}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyKey}
                className="cursor-pointer shrink-0"
                disabled={keyLoading || !!keyError}
              >
                <Image
                  src="/images/onboarding/icon-copy.svg"
                  alt="Copy"
                  width={19}
                  height={19}
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </motion.button>
              {keyCopied && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-[-32px] right-[8px] text-[12px] text-[#17803D] bg-[#E2F3EA] px-[8px] py-[4px] rounded-[4px]"
                >
                  Copied!
                </motion.span>
              )}
            </div>

            <div
              className="w-full min-h-[44px] rounded-[8px] flex items-center gap-[12px] px-[14px] py-[10px]"
              style={{ backgroundColor: '#FFFBF0', border: '1px solid #E8D5A0' }}
            >
              <Image src="/images/onboarding/icon-alert.svg" alt="" width={20} height={20} className="shrink-0" />
              <span className="text-[12px] leading-[1.4] text-[#B8860B]">
                Save this key now. This is the only time you&apos;ll see it in full.
              </span>
            </div>
          </motion.div>
        )}

        {/* Reconnect mode: reminder about existing key */}
        {isReconnect && (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[540px] mt-[24px] sm:mt-[28px]"
          >
            <div
              className="w-full min-h-[44px] rounded-[8px] flex items-center gap-[12px] px-[14px] py-[10px]"
              style={{ backgroundColor: '#F0F7FF', border: '1px solid #BFDBFE' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="text-[12px] leading-[1.4] text-[#1E40AF]">
                Use the API key you saved when you first created this agent.
              </span>
            </div>
          </motion.div>
        )}

        {/* Tab interface */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[540px] mt-[24px] sm:mt-[28px]"
        >
          <div className="flex gap-[4px] mb-[2px]">
            {[
              { key: 'auto' as const, label: 'Automatic Setup', tag: 'Recommended' },
              { key: 'manual' as const, label: 'Manual Setup', tag: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-[6px] px-[14px] sm:px-[18px] h-[38px] rounded-t-[8px] cursor-pointer transition-all"
                style={{
                  backgroundColor: activeTab === tab.key ? '#383838' : '#F0EFED',
                  border: activeTab === tab.key ? '1px solid #383838' : '1px solid #E2E1DC',
                  borderBottom: 'none',
                }}
              >
                <span
                  className="text-[12px] sm:text-[13px] leading-[1.15]"
                  style={{ color: activeTab === tab.key ? '#FFFFFF' : '#55554F' }}
                >
                  {tab.label}
                </span>
                {tab.tag && (
                  <span
                    className="text-[9px] leading-[1.15] uppercase px-[6px] py-[2px] rounded-[2px]"
                    style={{
                      backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.15)' : '#E2F3EA',
                      color: activeTab === tab.key ? '#6EE7B7' : '#0C5526',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {tab.tag}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'auto' ? (
            <div
              className="rounded-[10px] rounded-tl-none overflow-hidden"
              style={{ border: '1px solid #E2E1DC' }}
            >
              <div className="relative" style={{ backgroundColor: '#383838' }}>
                <div className="px-[16px] sm:px-[22px] py-[16px] sm:py-[20px] overflow-x-auto">
                  <pre
                    className="text-[11px] sm:text-[12.5px] leading-[1.8] whitespace-pre"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E4E4E7' }}
                  >
                    {autoCommand}
                  </pre>
                </div>
                <CopyBtn text={autoCommand} />
              </div>
              <div className="p-[16px] sm:p-[22px] bg-white">
                {[
                  'Open Terminal (Mac: \u2318+Space \u2192 "Terminal" / Linux: Ctrl+Alt+T)',
                  'Paste the command above and press Enter',
                  'When prompted, paste your API key',
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start"
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#6B6B6A' }}
                  >
                    <span className="min-w-[20px] shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="rounded-[10px] rounded-tl-none overflow-hidden"
              style={{ border: '1px solid #E2E1DC' }}
            >
              <div className="relative" style={{ backgroundColor: '#383838' }}>
                <div className="px-[16px] sm:px-[22px] py-[16px] sm:py-[20px] overflow-x-auto">
                  <pre
                    className="text-[11px] sm:text-[12.5px] leading-[1.7] whitespace-pre"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E4E4E7' }}
                  >
                    {manualConfig}
                  </pre>
                </div>
                {manualConfig && <CopyBtn text={manualConfig} />}
              </div>
              <div className="p-[16px] sm:p-[22px] bg-white">
                {[
                  'Open your OpenClaw config file: ~/.openclaw/openclaw.json',
                  'Merge the "models.providers.clawproxy" block into your config',
                  'Save the file and restart: openclaw gateway restart',
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start"
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#6B6B6A' }}
                  >
                    <span className="min-w-[20px] shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Buttons */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[540px] flex items-center gap-[6px] mt-[24px] sm:mt-[28px]"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isReconnect ? router.push('/dashboard/agents') : router.back()}
            className="w-[80px] sm:w-[96px] h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer shrink-0"
            style={{ transition: 'background-color 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8E7E4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F0EFED')}
          >
            <Image src="/images/onboarding/icon-back-arrow.svg" alt="" width={8} height={8} />
            <span className="text-[15px] leading-[1.15] text-black" style={{ letterSpacing: '-0.013em' }}>
              Back
            </span>
          </motion.button>
          <motion.button
            whileHover={canContinue && !verifying ? { scale: 1.01 } : {}}
            whileTap={canContinue && !verifying ? { scale: 0.99 } : {}}
            onClick={handleContinue}
            disabled={!canContinue || verifying}
            className="flex-1 h-[43px] rounded-lg flex items-center justify-center gap-[8px] cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: !canContinue || verifying ? 'rgba(23, 128, 61, 0.4)' : '#17803D',
              transition: 'background-color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (canContinue && !verifying) e.currentTarget.style.backgroundColor = '#14702f';
            }}
            onMouseLeave={(e) => {
              if (canContinue && !verifying) e.currentTarget.style.backgroundColor = '#17803D';
            }}
          >
            {verifying && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-[14px] h-[14px] rounded-full border-[2px] border-white/30 border-t-white"
              />
            )}
            <span className="text-[13px] sm:text-[14px] leading-[1.15] text-white" style={{ letterSpacing: '-0.007em' }}>
              {verifying ? 'Verifying connection...' : "I\u2019ve configured my agent \u2192"}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
