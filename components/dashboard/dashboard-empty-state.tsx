'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface KeyInfo {
  key_prefix: string
  is_active: boolean
}

export function DashboardEmptyState() {
  const [keyPrefix, setKeyPrefix] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [troubleshootOpen, setTroubleshootOpen] = useState(false)

  useEffect(() => {
    fetch('/api/keys')
      .then((r) => r.json())
      .then((data) => {
        const active = data.keys?.find((k: KeyInfo) => k.is_active)
        if (active) setKeyPrefix(active.key_prefix)
      })
      .catch(() => {})
  }, [])

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const proxyEndpoint = 'https://www.clawproxy.ai/api/proxy/v1'

  return (
    <div className="py-[40px] sm:py-[56px] px-[20px] sm:px-[40px]">
      {/* Hero */}
      <div className="text-center mb-[32px]">
        <h2
          className="text-[22px] sm:text-[26px] leading-[1.15] text-[#111110] tracking-[-0.02em]"
          style={{ fontFamily: 'PP Mondwest, serif' }}
        >
          Your proxy is ready! Here&apos;s how to start saving.
        </h2>
        <p
          className="text-[13px] sm:text-[14px] leading-[1.5] text-[#8F8F87] mt-[8px] max-w-[480px] mx-auto"
          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          Just use OpenClaw like you normally do. Every AI request your agent makes will automatically route through ClawProxy and save you money.
        </p>
      </div>

      {/* Your setup */}
      <div
        className="rounded-[10px] p-[20px] sm:p-[24px] mb-[24px] max-w-[560px] mx-auto"
        style={{ backgroundColor: '#FAFAF8', border: '1px solid #E2E1DC' }}
      >
        <span
          className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block mb-[16px]"
          style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.06em' }}
        >
          Your setup
        </span>

        {/* Proxy endpoint */}
        <div className="flex items-center justify-between gap-[12px] mb-[12px]">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Proxy endpoint</span>
            <span
              className="text-[12.5px] text-[#111110] block mt-[2px] truncate"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {proxyEndpoint}
            </span>
          </div>
          <button
            onClick={() => handleCopy(proxyEndpoint, 'endpoint')}
            className="shrink-0 h-[30px] px-[12px] rounded-[6px] text-[11px] cursor-pointer transition-colors"
            style={{
              backgroundColor: copied === 'endpoint' ? '#E2F3EA' : '#FFFFFF',
              border: '1px solid #E2E1DC',
              color: copied === 'endpoint' ? '#17803D' : '#55554F',
              fontFamily: 'Aeonik Pro, sans-serif',
            }}
          >
            {copied === 'endpoint' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* API key */}
        <div className="flex items-center justify-between gap-[12px] mb-[14px]">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Your API key</span>
            <span
              className="text-[12.5px] text-[#111110] block mt-[2px] truncate"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {keyPrefix ? `${keyPrefix}...` : 'Loading...'}
            </span>
          </div>
          {keyPrefix && (
            <button
              onClick={() => handleCopy(keyPrefix, 'key')}
              className="shrink-0 h-[30px] px-[12px] rounded-[6px] text-[11px] cursor-pointer transition-colors"
              style={{
                backgroundColor: copied === 'key' ? '#E2F3EA' : '#FFFFFF',
                border: '1px solid #E2E1DC',
                color: copied === 'key' ? '#17803D' : '#55554F',
                fontFamily: 'Aeonik Pro, sans-serif',
              }}
            >
              {copied === 'key' ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-[6px]">
          <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#22C55E' }} />
          <span className="text-[12px] text-[#17803D]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Connected
          </span>
        </div>
      </div>

      {/* What to do next */}
      <div className="max-w-[560px] mx-auto mb-[24px]">
        <p
          className="text-[13px] leading-[1.5] text-[#55554F] text-center mb-[20px]"
          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          Open your terminal and chat with your agent — that&apos;s it! Your stats will appear here in real-time.
        </p>

        {/* Try it now examples */}
        <div
          className="rounded-[10px] p-[20px] sm:p-[24px]"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E1DC' }}
        >
          <span
            className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block mb-[14px]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.06em' }}
          >
            Try it now — example messages
          </span>

          {[
            { message: '"What time is it?"', route: 'Routes to cheapest model', savings: 'saves ~99%' },
            { message: '"Write me a short email"', route: 'Routes to mid-tier', savings: 'saves ~80%' },
            { message: '"Debug this function..."', route: 'Stays on premium', savings: 'complex task' },
          ].map((example, i) => (
            <div
              key={i}
              className="flex items-start gap-[12px] py-[10px]"
              style={{ borderBottom: i < 2 ? '1px solid #F0EFED' : 'none' }}
            >
              <span
                className="text-[13px] leading-[1.4] text-[#111110] flex-1"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                {example.message}
              </span>
              <span
                className="text-[11px] leading-[1.4] text-[#8F8F87] shrink-0 text-right"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                {example.route}
                <br />
                <span className="text-[#17803D]">{example.savings}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="max-w-[560px] mx-auto">
        <button
          onClick={() => setTroubleshootOpen(!troubleshootOpen)}
          className="w-full flex items-center justify-between py-[12px] px-[16px] rounded-[8px] cursor-pointer transition-colors"
          style={{
            backgroundColor: troubleshootOpen ? '#FAFAF8' : 'transparent',
            border: troubleshootOpen ? '1px solid #E2E1DC' : '1px solid transparent',
          }}
        >
          <span className="text-[13px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Not seeing data?
          </span>
          <motion.svg
            animate={{ rotate: troubleshootOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#8F8F87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>

        <AnimatePresence>
          {troubleshootOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-[16px] pt-[8px] pb-[16px] space-y-[10px]">
                {[
                  { text: 'Make sure your OpenClaw gateway is running:', code: 'openclaw gateway restart' },
                  { text: 'Check your config points to:', code: 'https://www.clawproxy.ai/api/proxy/v1' },
                  { text: 'Verify your API key is active in Settings \u2192 API Keys', code: null },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[12px] leading-[1.5] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      {item.text}
                    </p>
                    {item.code && (
                      <code
                        className="text-[11px] text-[#111110] bg-[#F0EFED] px-[8px] py-[3px] rounded-[4px] mt-[4px] inline-block"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {item.code}
                      </code>
                    )}
                  </div>
                ))}
                <a
                  href="/docs"
                  className="text-[12px] text-[#2563EB] hover:underline inline-block mt-[4px]"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  Read the full docs for more help &rarr;
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
