'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

export default function SettingsPage() {
  const [dailyLimit, setDailyLimit] = useState('15.00');
  const [monthlyLimit, setMonthlyLimit] = useState('300.00');
  const [alert75, setAlert75] = useState(true);
  const [alert90, setAlert90] = useState(true);
  const [loopDetection, setLoopDetection] = useState(true);
  const [compression, setCompression] = useState(true);
  const [simpleModel, setSimpleModel] = useState('Gemini Flash-Lite — $0.075/M');
  const [mediumModel, setMediumModel] = useState('Claude Haiku 4.5 — $0.80/M');
  const [complexModel, setComplexModel] = useState('Claude Opus 4.6 — $15/M');
  const [copied, setCopied] = useState(false);

  const endpoint = 'https://api.clawproxy.com/v1';

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="pt-[16px] mb-[16px] px-[4px] sm:px-0">
        <h1
          className="text-[26px] leading-[1.08] text-[#111110]"
          style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
        >
          Settings
        </h1>
      </motion.div>

      {/* ── Proxy Endpoint ──────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
        <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
          Your proxy endpoint
        </span>
        <div
          className="mt-[8px] flex items-center justify-between rounded-[5px] px-[16px] h-[46px]"
          style={{ backgroundColor: '#383838' }}
        >
          <span className="text-[13px] leading-[1.15] text-white truncate" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            {endpoint}
          </span>
          <button onClick={handleCopy} className="ml-[12px] shrink-0 text-white/70 hover:text-white transition">
            {copied ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Spending Controls + Model Routing ────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-[3px] mt-[3px]">
        {/* Spending Controls */}
        <div className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            Spending controls
          </span>

          {/* Daily limit */}
          <span className="text-[11px] leading-[1.15] text-[#5C5C58] uppercase block mt-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.045em' }}>
            Daily limit ($)
          </span>
          <input
            type="text"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            className="w-full h-[37px] mt-[4px] px-[13px] rounded-[6px] border border-[#E4E3DE] text-[13px] text-black outline-none focus:border-[#17803D] transition"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          />

          {/* Monthly limit */}
          <span className="text-[11px] leading-[1.15] text-[#5C5C58] uppercase block mt-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.045em' }}>
            Monthly limit ($)
          </span>
          <input
            type="text"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            className="w-full h-[37px] mt-[4px] px-[13px] rounded-[6px] border border-[#E4E3DE] text-[13px] text-black outline-none focus:border-[#17803D] transition"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          />

          {/* Alert toggles */}
          <div className="mt-[12px]" style={{ borderTop: '1px solid #E4E3DE' }}>
            <div className="flex items-center justify-between py-[15px]" style={{ borderBottom: '1px solid #E4E3DE' }}>
              <div>
                <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Alert at 75%</span>
                <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Email notification</span>
              </div>
              <button
                onClick={() => setAlert75(!alert75)}
                className="w-[38px] h-[20px] rounded-[10px] relative transition-colors"
                style={{ backgroundColor: alert75 ? '#157A3E' : '#D4D3CE' }}
              >
                <div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all" style={{ left: alert75 ? '20px' : '2px' }} />
              </button>
            </div>
            <div className="flex items-center justify-between py-[15px]">
              <div>
                <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Alert at 90%</span>
                <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Email + dashboard</span>
              </div>
              <button
                onClick={() => setAlert90(!alert90)}
                className="w-[38px] h-[20px] rounded-[10px] relative transition-colors"
                style={{ backgroundColor: alert90 ? '#157A3E' : '#D4D3CE' }}
              >
                <div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all" style={{ left: alert90 ? '20px' : '2px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Model Routing */}
        <div className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            Model routing
          </span>

          {/* Simple tasks */}
          <span className="text-[11px] leading-[1.15] text-[#5C5C58] uppercase block mt-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.045em' }}>
            Simple tasks
          </span>
          <select
            value={simpleModel}
            onChange={(e) => setSimpleModel(e.target.value)}
            className="w-full h-[36px] mt-[4px] px-[13px] rounded-[6px] border border-[#E4E3DE] text-[12px] text-black outline-none focus:border-[#17803D] transition appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23141B34%22%20stroke-width%3D%221%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_13px_center]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            <option>Gemini Flash-Lite — $0.075/M</option>
            <option>Claude Haiku 4.5 — $0.80/M</option>
          </select>

          {/* Medium tasks */}
          <span className="text-[11px] leading-[1.15] text-[#5C5C58] uppercase block mt-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.045em' }}>
            Medium tasks
          </span>
          <select
            value={mediumModel}
            onChange={(e) => setMediumModel(e.target.value)}
            className="w-full h-[36px] mt-[4px] px-[13px] rounded-[6px] border border-[#E4E3DE] text-[12px] text-black outline-none focus:border-[#17803D] transition appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23141B34%22%20stroke-width%3D%221%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_13px_center]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            <option>Claude Haiku 4.5 — $0.80/M</option>
            <option>Claude Sonnet 4.5 — $3/M</option>
          </select>

          {/* Complex tasks */}
          <span className="text-[11px] leading-[1.15] text-[#5C5C58] uppercase block mt-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.045em' }}>
            Complex tasks
          </span>
          <select
            value={complexModel}
            onChange={(e) => setComplexModel(e.target.value)}
            className="w-full h-[36px] mt-[4px] px-[13px] rounded-[6px] border border-[#E4E3DE] text-[12px] text-black outline-none focus:border-[#17803D] transition appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23141B34%22%20stroke-width%3D%221%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_13px_center]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            <option>Claude Opus 4.6 — $15/M</option>
            <option>Claude Sonnet 4.5 — $3/M</option>
          </select>
        </div>
      </motion.div>

      {/* ── Features ────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px] mt-[3px] mb-[7px]">
        <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
          Features
        </span>

        <div className="mt-[8px]" style={{ borderTop: '1px solid #E4E3DE' }}>
          <div className="flex items-center justify-between py-[15px]" style={{ borderBottom: '1px solid #E4E3DE' }}>
            <div>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Loop detection</span>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Block repeated requests</span>
            </div>
            <button
              onClick={() => setLoopDetection(!loopDetection)}
              className="w-[38px] h-[20px] rounded-[10px] relative transition-colors shrink-0"
              style={{ backgroundColor: loopDetection ? '#157A3E' : '#D4D3CE' }}
            >
              <div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all" style={{ left: loopDetection ? '20px' : '2px' }} />
            </button>
          </div>
          <div className="flex items-center justify-between py-[15px]">
            <div>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Context compression</span>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>200K→40K tokens</span>
            </div>
            <button
              onClick={() => setCompression(!compression)}
              className="w-[38px] h-[20px] rounded-[10px] relative transition-colors shrink-0"
              style={{ backgroundColor: compression ? '#157A3E' : '#D4D3CE' }}
            >
              <div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all" style={{ left: compression ? '20px' : '2px' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
