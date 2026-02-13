'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

/* ── Agent data ──────────────────────────────────────────────────── */
const agentList = [
  { name: 'Main Dev Agent', status: 'active' as const, color: '#E2F3EA', colorBorder: '#0C5526', apiKey: 'cp_sk_a8f3...', lastSeen: '2 min ago', saved: '$4.82', spent: '$1.93', requests: '847', loops: '2' },
  { name: 'Email Bot', status: 'active' as const, color: 'rgba(37,99,235,0.35)', colorBorder: '#2563EB', apiKey: 'cp_sk_7bx2...', lastSeen: '5 min ago', saved: '$1.93', spent: '$0.41', requests: '312', loops: '' },
  { name: 'Slack Monitor', status: 'idle' as const, color: 'rgba(124,58,237,0.35)', colorBorder: '#7C3AED', apiKey: 'cp_sk_k9m4...', lastSeen: '2 hours ago', saved: '$0.24', spent: '$0.08', requests: '63', loops: '' },
  { name: 'Email Bot', status: 'active' as const, color: 'rgba(37,99,235,0.35)', colorBorder: '#2563EB', apiKey: 'cp_sk_7bx2...', lastSeen: '5 min ago', saved: '$1.93', spent: '$0.41', requests: '312', loops: '' },
  { name: 'Slack Monitor', status: 'idle' as const, color: 'rgba(124,58,237,0.35)', colorBorder: '#7C3AED', apiKey: 'cp_sk_k9m4...', lastSeen: '2 hours ago', saved: '$0.24', spent: '$0.08', requests: '63', loops: '' },
  { name: 'Main Dev Agent', status: 'active' as const, color: '#E2F3EA', colorBorder: '#0C5526', apiKey: 'cp_sk_a8f3...', lastSeen: '2 min ago', saved: '$4.82', spent: '$1.93', requests: '847', loops: '2' },
  { name: 'Email Bot', status: 'active' as const, color: 'rgba(37,99,235,0.35)', colorBorder: '#2563EB', apiKey: 'cp_sk_7bx2...', lastSeen: '5 min ago', saved: '$1.93', spent: '$0.41', requests: '312', loops: '' },
  { name: 'Slack Monitor', status: 'idle' as const, color: 'rgba(124,58,237,0.35)', colorBorder: '#7C3AED', apiKey: 'cp_sk_k9m4...', lastSeen: '2 hours ago', saved: '$0.24', spent: '$0.08', requests: '63', loops: '' },
];

const agentColors = [
  '#17803D', '#2563EB', '#7C3AED', '#D97706',
  '#DC2626', '#0D9488', '#4F46E5', '#EA580C',
];

export default function AgentsPage() {
  const [modalStep, setModalStep] = useState<0 | 1 | 2>(0); // 0 = closed, 1 = step 1, 2 = step 2
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#17803D');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const generatedKey = 'cp_sk_e025952ba306284e34c3ac9385fbaae279dc7e428d13a6eb';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredAgents = agentList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between pt-[16px] mb-[16px] px-[4px] sm:px-0">
        <div>
          <h1
            className="text-[26px] leading-[1.08] text-[#111110]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
          >
            Agents
          </h1>
          <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Each agent gets its own API key and per-agent tracking.
          </p>
        </div>
        <button
          onClick={() => setModalStep(1)}
          className="h-[37px] px-[20px] rounded-[6px] text-[13px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition mt-[12px] sm:mt-[10px] shrink-0"
          style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          + Add agent
        </button>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={fadeUp}>
        <div
          className="flex items-center gap-[10px] h-[40px] px-[22px] rounded-[8px] mb-[7px]"
          style={{ backgroundColor: 'rgba(255,255,255,0.64)', border: '1px solid #CBCBCB' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search for agents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#000000] outline-none placeholder:text-black/50"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          />
        </div>
      </motion.div>

      {/* Agent cards list */}
      <motion.div variants={fadeUp} className="flex flex-col gap-[3px] mb-[7px]">
        {filteredAgents.map((agent, i) => (
          <div
            key={`${agent.name}-${i}`}
            className="bg-white border border-[#E2E1DC] rounded-[12px] px-[25px] py-[21px] flex flex-col sm:flex-row sm:items-center gap-[12px] sm:gap-0 hover:shadow-md transition"
          >
            {/* Left: avatar + name + status + meta */}
            <div className="flex items-center gap-[16px] sm:flex-1 min-w-0">
              <div
                className="w-[40px] h-[40px] rounded-[2px] shrink-0"
                style={{ backgroundColor: agent.color, border: `1px solid ${agent.colorBorder}` }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[15px] text-[#111110] truncate" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {agent.name}
                  </span>
                  <span
                    className="shrink-0 inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px] uppercase"
                    style={{
                      backgroundColor: agent.status === 'active' ? '#E2F3EA' : '#EEEDEA',
                      border: agent.status === 'active' ? '1px solid #0C5526' : 'none',
                      color: agent.status === 'active' ? '#17803D' : '#B8B8B0',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="flex items-center gap-[6px] mt-[3px]">
                  <span className="text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.apiKey}</span>
                  <span className="text-[12px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>· {agent.lastSeen}</span>
                </div>
              </div>
            </div>

            {/* Right: metrics */}
            <div className="flex items-center gap-[24px] sm:gap-[32px] shrink-0">
              <div className="text-right">
                <span className="text-[14px] text-[#17803D] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.saved}</span>
                <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>saved today</span>
              </div>
              <div className="text-right">
                <span className="text-[14px] text-[#111110] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.spent}</span>
                <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>spent today</span>
              </div>
              <div className="text-right">
                <span className="text-[14px] text-[#111110] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.requests}</span>
                <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>requests</span>
              </div>
              {agent.loops && (
                <div className="text-right">
                  <span className="text-[14px] text-[#D93025] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.loops}</span>
                  <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>loops killed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Modal overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {modalStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
            style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
            onClick={() => { setModalStep(0); setNewAgentName(''); setCopied(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-[16px] w-full overflow-y-auto"
              style={{ maxWidth: 520, maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* ── Step 1: Name & Color ─────────────────────────── */}
            {modalStep === 1 && (
              <div className="px-[28px] py-[24px]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className="text-[24px] leading-[1.08] text-[#111110]"
                      style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.021em' }}
                    >
                      Add an agent
                    </h2>
                    <p className="text-[13.5px] leading-[1.5] text-[#55554F] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      Give this agent a name so you can track its costs separately.
                    </p>
                  </div>
                  <button
                    onClick={() => { setModalStep(0); setNewAgentName(''); }}
                    className="w-[32px] h-[32px] rounded-[8px] border border-[#E2E1DC] flex items-center justify-center text-[#8F8F87] hover:bg-[#F5F5F3] transition shrink-0 ml-[12px]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>

                {/* Agent name */}
                <label className="text-[12px] text-[#55554F] block mt-[24px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Agent name
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full h-[42px] mt-[4px] px-[15px] rounded-[6px] border border-[#E2E1DC] text-[14px] text-black outline-none focus:border-[#17803D] transition"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  placeholder=""
                />
                <span className="text-[11.5px] text-[#B8B8B0] block mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  This is just a label for your dashboard — your agent won&apos;t see it.
                </span>

                {/* Color */}
                <label className="text-[12px] text-[#55554F] block mt-[20px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Color
                </label>
                <div className="flex gap-[8px] mt-[6px]">
                  {agentColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className="w-[32px] h-[32px] rounded-[5px] flex items-center justify-center transition-all cursor-pointer"
                      style={{
                        backgroundColor: selectedColor === c ? `${c}4D` : c,
                        border: `2px solid ${selectedColor === c ? c : 'transparent'}`,
                        boxShadow: selectedColor === c ? '0px 0px 0px 2px white' : 'none',
                      }}
                    >
                      {selectedColor === c && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="11 4 5.5 9.5 3 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-[8px] mt-[36px]">
                  <button
                    onClick={() => { setModalStep(0); setNewAgentName(''); }}
                    className="h-[37px] px-[12px] rounded-[6px] text-[13px] text-[#8F8F87] cursor-pointer hover:bg-[#F5F5F3] transition"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setModalStep(2)}
                    className="h-[37px] px-[20px] rounded-[6px] text-[13px] text-white cursor-pointer hover:opacity-90 transition"
                    style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    Create agent →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: API Key Reveal ───────────────────────── */}
            {modalStep === 2 && (
              <div className="px-[28px] py-[24px]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className="text-[24px] leading-[1.08] text-[#111110]"
                      style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.021em' }}
                    >
                      Your agent&apos;s API key
                    </h2>
                    <p className="text-[13.5px] leading-[1.5] text-[#55554F] mt-[8px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      Paste this key into this agent&apos;s OpenClaw config.
                    </p>
                  </div>
                  <button
                    onClick={() => { setModalStep(0); setCopied(false); }}
                    className="w-[32px] h-[32px] rounded-[8px] border border-[#E2E1DC] flex items-center justify-center text-[#8F8F87] hover:bg-[#F5F5F3] transition shrink-0 ml-[12px]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>

                {/* API key box */}
                <div
                  className="mt-[16px] rounded-[5px] px-[20px] py-[16px] flex items-start justify-between gap-[12px]"
                  style={{ backgroundColor: '#383838' }}
                >
                  <span
                    className="text-[13px] leading-[1.32] text-white break-all"
                    style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.023em' }}
                  >
                    {generatedKey}
                  </span>
                  <button onClick={handleCopyKey} className="shrink-0 text-white/70 hover:text-white transition mt-[2px]">
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Warning */}
                <div
                  className="mt-[16px] flex items-center gap-[12px] px-[15px] py-[14px] rounded-[6px]"
                  style={{ backgroundColor: '#FDF6E3', border: '1px solid #E8D5A0' }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="text-[12.5px] leading-[1.15] text-[#B8860B]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    Save this now. You won&apos;t see the full key again — only the prefix.
                  </span>
                </div>

                {/* Quick setup card */}
                <div
                  className="mt-[16px] rounded-[8px] px-[21px] py-[17px]"
                  style={{ backgroundColor: '#FAFAF8', border: '1px solid #EEEDE9' }}
                >
                  <span className="text-[12px] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.042em' }}>
                    Quick setup
                  </span>
                  <div className="mt-[14px] space-y-[14px]">
                    {[
                      'Open this agent\'s OpenClaw config file',
                      'Add or update the lines below',
                      'Restart the agent',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-[10px]">
                        <div
                          className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 text-[11px] text-[#17803D]"
                          style={{ backgroundColor: '#E2F3EA', fontFamily: 'Aeonik Pro, sans-serif' }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-[13px] leading-[1.5] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Code block */}
                  <div className="mt-[14px] rounded-[4px] px-[16px] py-[14px]" style={{ backgroundColor: '#383838' }}>
                    <pre className="text-[12px] leading-[1.5] text-white whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
{`OPENAI_API_KEY=${generatedKey.slice(0, 24)}...
OPENAI_BASE_URL=https://api.clawproxy.com/v1`}
                    </pre>
                  </div>
                </div>

                {/* Or run */}
                <div className="flex items-center gap-[8px] mt-[16px]">
                  <span className="text-[12.5px] text-[#8F8F87] shrink-0" style={{ fontFamily: 'DM Sans, sans-serif' }}>Or run:</span>
                  <div
                    className="flex-1 h-[36px] rounded-[4px] px-[12px] flex items-center justify-between overflow-hidden"
                    style={{ backgroundColor: '#EEEDEA' }}
                  >
                    <span className="text-[11px] text-[#8F8F87] truncate" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      curl -sL https://clawproxy.com/setup | bash -s -- {generatedKey.slice(0, 24)}...
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F8F87" strokeWidth="1.5" className="shrink-0 ml-[8px] cursor-pointer">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </div>
                </div>

                {/* Done button */}
                <button
                  onClick={() => { setModalStep(0); setCopied(false); }}
                  className="w-full h-[43px] rounded-[6px] text-[13px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition mt-[20px]"
                  style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  I&apos;ve saved the key — done
                </button>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
