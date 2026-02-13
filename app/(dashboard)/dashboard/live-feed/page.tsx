'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

/* ── Types ───────────────────────────────────────────────────────── */
type Complexity = 'simple' | 'medium' | 'complex' | 'loop';

interface FeedRow {
  time: string;
  complexity: Complexity;
  request: string;
  routeFrom: string;
  routeTo: string;
  tokens: string;
  cost: string;
  saved: string;
  agent?: string;
}

/* ── Agent filter data (Team) ─────────────────────────────────────── */
const agents = [
  { name: 'All agents', dotColor: '#22C55E' },
  { name: 'Main Dev Agent', dotColor: '#22C55E' },
  { name: 'Email Assistant', dotColor: '#22C55E' },
  { name: 'Code Reviewer', dotColor: '#22C55E' },
  { name: 'Research Bot', dotColor: '#B8B8B0' },
  { name: 'Slack Monitor', dotColor: '#22C55E' },
];

/* ── Badge styles per complexity ─────────────────────────────────── */
const badgeStyles: Record<Complexity, { bg: string; border: string; text: string }> = {
  simple:  { bg: '#DCEEE3', border: '#17803D', text: '#0D5428' },
  medium:  { bg: '#EBF2FF', border: '#2563EB', text: '#2563EB' },
  complex: { bg: '#FFF8E7', border: '#B8860B', text: '#B8860B' },
  loop:    { bg: '#FDECEA', border: '#DA0A16', text: '#C23A2D' },
};

/* ── Sample feed data ────────────────────────────────────────────── */
const feedData: FeedRow[] = [
  { time: '2s',  complexity: 'simple',  request: 'Heartbeat check',   routeFrom: 'Opus', routeTo: 'Flash-Lite',  tokens: '482',    cost: '$0.0000', saved: '+$0.011', agent: 'Main Dev Agent' },
  { time: '26s', complexity: 'complex', request: 'Refactor auth',     routeFrom: 'Opus', routeTo: 'Opus 4.6',    tokens: '18,400',  cost: '$0.2760', saved: '—', agent: 'Code Reviewer' },
  { time: '5s',  complexity: 'simple',  request: 'Read calendar',     routeFrom: 'Opus', routeTo: 'Haiku 4.5',   tokens: '1,240',   cost: '$0.0010', saved: '+$0.018', agent: 'Email Assistant' },
  { time: '11s', complexity: 'medium',  request: 'Draft email',       routeFrom: 'Opus', routeTo: 'Sonnet 4.5',  tokens: '3,800',   cost: '$0.0110', saved: '+$0.045', agent: 'Email Assistant' },
  { time: '18s', complexity: 'loop',    request: 'Loop detected (×12)', routeFrom: '',   routeTo: '',             tokens: '—',       cost: '—',       saved: '+$0.089', agent: 'Main Dev Agent' },
  { time: '26s', complexity: 'complex', request: 'Refactor auth',     routeFrom: 'Opus', routeTo: 'Opus 4.6',    tokens: '18,400',  cost: '$0.2760', saved: '—', agent: 'Code Reviewer' },
  { time: '33s', complexity: 'simple',  request: 'Summarize Slack',   routeFrom: 'Opus', routeTo: 'Haiku 4.5',   tokens: '2,100',   cost: '$0.0020', saved: '+$0.031', agent: 'Slack Monitor' },
  { time: '40s', complexity: 'simple',  request: 'Heartbeat check',   routeFrom: 'Opus', routeTo: 'Flash-Lite',  tokens: '490',     cost: '$0.0000', saved: '+$0.011', agent: 'Main Dev Agent' },
  { time: '18s', complexity: 'loop',    request: 'Loop detected (×12)', routeFrom: '',   routeTo: '',             tokens: '—',       cost: '—',       saved: '+$0.089', agent: 'Code Reviewer' },
  { time: '47s', complexity: 'simple',  request: 'File search',       routeFrom: 'Opus', routeTo: 'Flash-Lite',  tokens: '620',     cost: '$0.0001', saved: '+$0.009', agent: 'Main Dev Agent' },
  { time: '1m',  complexity: 'medium',  request: 'Code review PR',    routeFrom: 'Opus', routeTo: 'Sonnet 4.5',  tokens: '12,600',  cost: '$0.0380', saved: '+$0.151', agent: 'Code Reviewer' },
  { time: '5s',  complexity: 'simple',  request: 'Read calendar',     routeFrom: 'Opus', routeTo: 'Haiku 4.5',   tokens: '1,240',   cost: '$0.0010', saved: '+$0.018', agent: 'Email Assistant' },
  { time: '26s', complexity: 'complex', request: 'Refactor auth',     routeFrom: 'Opus', routeTo: 'Opus 4.6',    tokens: '18,400',  cost: '$0.2760', saved: '—', agent: 'Main Dev Agent' },
  { time: '2s',  complexity: 'simple',  request: 'Heartbeat check',   routeFrom: 'Opus', routeTo: 'Flash-Lite',  tokens: '482',     cost: '$0.0000', saved: '+$0.011', agent: 'Slack Monitor' },
  { time: '18s', complexity: 'loop',    request: 'Loop detected (×12)', routeFrom: '',   routeTo: '',             tokens: '—',       cost: '—',       saved: '+$0.089', agent: 'Main Dev Agent' },
  { time: '5s',  complexity: 'simple',  request: 'Read calendar',     routeFrom: 'Opus', routeTo: 'Haiku 4.5',   tokens: '1,240',   cost: '$0.0010', saved: '+$0.018', agent: 'Email Assistant' },
  { time: '26s', complexity: 'complex', request: 'Refactor auth',     routeFrom: 'Opus', routeTo: 'Opus 4.6',    tokens: '18,400',  cost: '$0.2760', saved: '—', agent: 'Code Reviewer' },
  { time: '1m',  complexity: 'medium',  request: 'Code review PR',    routeFrom: 'Opus', routeTo: 'Sonnet 4.5',  tokens: '12,600',  cost: '$0.0380', saved: '+$0.151', agent: 'Code Reviewer' },
  { time: '11s', complexity: 'medium',  request: 'Draft email',       routeFrom: 'Opus', routeTo: 'Sonnet 4.5',  tokens: '3,800',   cost: '$0.0110', saved: '+$0.045', agent: 'Email Assistant' },
  { time: '11s', complexity: 'medium',  request: 'Draft email',       routeFrom: 'Opus', routeTo: 'Sonnet 4.5',  tokens: '3,800',   cost: '$0.0110', saved: '+$0.045', agent: 'Slack Monitor' },
];

export default function LiveFeedPage() {
  const [rows, setRows] = useState(feedData);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('All agents');
  const tableRef = useRef<HTMLDivElement>(null);

  /* Simulate new rows appearing at the top every few seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      const randomRow = feedData[Math.floor(Math.random() * feedData.length)];
      const newRow = { ...randomRow, time: 'now' };
      setRows((prev) => [newRow, ...prev.slice(0, 29)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredRows = selectedAgent === 'All agents'
    ? rows
    : rows.filter((r) => r.agent === selectedAgent);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-[10px] pt-[16px] mb-[12px] px-[4px] sm:px-0">
        <div
          className="w-[7px] h-[7px] rounded-[3.5px]"
          style={{ backgroundColor: '#10B981', opacity: 0.978 }}
        />
        <h1
          className="text-[26px] leading-[1.08] text-[#111110]"
          style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
        >
          Live request feed
        </h1>
      </motion.div>

      {/* Agent filter bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-[8px] mb-[16px] overflow-x-auto pb-[4px] px-[4px] sm:px-0">
        {agents.map((a) => {
          const isActive = selectedAgent === a.name;
          return (
            <button
              key={a.name}
              onClick={() => setSelectedAgent(a.name)}
              className="shrink-0 h-[30px] px-[14px] rounded-[20px] flex items-center gap-[7px] cursor-pointer transition-all text-[12px] leading-[1.15]"
              style={{
                backgroundColor: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                border: isActive ? '1px solid #0C5526' : '1px solid #E2E1DC',
                color: isActive ? '#111110' : '#8F8F87',
                fontFamily: 'Aeonik Pro, sans-serif',
              }}
            >
              <div
                className="w-[7px] h-[7px] rounded-full"
                style={{ backgroundColor: a.dotColor }}
              />
              {a.name}
            </button>
          );
        })}
      </motion.div>

      {/* Table */}
      <motion.div
        variants={fadeUp}
        ref={tableRef}
        className="bg-white border border-[#E4E3DE] rounded-[10px] overflow-hidden mb-[7px]"
      >
        {/* Header row */}
        <div
          className="hidden sm:grid h-[32px] items-center bg-[#F0EFED]"
          style={{
            gridTemplateColumns: '56px 80px 1fr 120px 200px 76px 76px 76px',
            borderBottom: '1px solid #E4E3DE',
          }}
        >
          {['Time', 'Request', '', 'Agent', 'Route', 'Tokens', 'Cost', 'Saved'].map((h, i) => (
            <span
              key={i}
              className="text-[10px] leading-[1.15] text-black uppercase px-[12px]"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Data rows */}
        <div className="max-h-[660px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {filteredRows.map((row, i) => (
              <motion.div
                key={`${row.request}-${row.time}-${i}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Desktop row */}
                <div
                  className="hidden sm:grid h-[36px] items-center transition-colors"
                  style={{
                    gridTemplateColumns: '56px 80px 1fr 120px 200px 76px 76px 76px',
                    borderBottom: '1px solid #E4E3DE',
                    backgroundColor: hoveredRow === i ? '#FAFAF8' : 'transparent',
                  }}
                >
                  {/* Time */}
                  <span
                    className="text-[10px] leading-[1.15] text-[#9C9C96] px-[12px]"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {row.time}
                  </span>

                  {/* Complexity badge */}
                  <div className="px-[12px]">
                    <span
                      className="inline-flex items-center h-[17px] px-[9px] rounded-[2px] text-[10px] leading-[1.15]"
                      style={{
                        backgroundColor: badgeStyles[row.complexity].bg,
                        border: `1px solid ${badgeStyles[row.complexity].border}`,
                        color: badgeStyles[row.complexity].text,
                        fontFamily: 'Aeonik Pro, sans-serif',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {row.complexity}
                    </span>
                  </div>

                  {/* Request name */}
                  <span
                    className="text-[12px] leading-[1.15] text-[#141413] px-[12px] truncate"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {row.request}
                  </span>

                  {/* Agent */}
                  <span
                    className="text-[11px] leading-[1.15] text-[#8F8F87] px-[12px] truncate"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {row.agent}
                  </span>

                  {/* Route */}
                  <div className="px-[12px] flex items-center gap-[2px]">
                    {row.complexity === 'loop' ? (
                      <span
                        className="inline-flex items-center h-[17px] px-[8px] rounded-[20px] text-[10px] leading-[1.15]"
                        style={{
                          backgroundColor: '#FDECEA',
                          color: '#C23A2D',
                          fontFamily: 'Aeonik Pro, sans-serif',
                          letterSpacing: '0.03em',
                        }}
                      >
                        blocked
                      </span>
                    ) : (
                      <>
                        <span
                          className="text-[10px] leading-[1.15] text-[#141413] opacity-50"
                          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                        >
                          {row.routeFrom}
                        </span>
                        <span
                          className="text-[10px] leading-[1.15] text-[#157A3E] mx-[2px]"
                          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                        >
                          →
                        </span>
                        <span
                          className="text-[10px] leading-[1.15] text-[#141413]"
                          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                        >
                          {row.routeTo}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Tokens */}
                  <span
                    className="text-[11px] leading-[1.15] text-[#141413] px-[12px]"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {row.tokens}
                  </span>

                  {/* Cost */}
                  <span
                    className="text-[11px] leading-[1.15] text-[#141413] px-[12px]"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {row.cost}
                  </span>

                  {/* Saved */}
                  <span
                    className="text-[11px] leading-[1.15] px-[12px]"
                    style={{
                      fontFamily: 'Aeonik Pro, sans-serif',
                      color: row.saved.startsWith('+') ? '#157A3E' : '#157A3E',
                    }}
                  >
                    {row.saved}
                  </span>
                </div>

                {/* Mobile row */}
                <div
                  className="sm:hidden px-[12px] py-[10px]"
                  style={{ borderBottom: '1px solid #E4E3DE' }}
                >
                  <div className="flex items-center justify-between mb-[6px]">
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="text-[10px] text-[#9C9C96]"
                        style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                      >
                        {row.time}
                      </span>
                      <span
                        className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px]"
                        style={{
                          backgroundColor: badgeStyles[row.complexity].bg,
                          border: `1px solid ${badgeStyles[row.complexity].border}`,
                          color: badgeStyles[row.complexity].text,
                          fontFamily: 'Aeonik Pro, sans-serif',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {row.complexity}
                      </span>
                      <span
                        className="text-[10px] text-[#8F8F87]"
                        style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                      >
                        {row.agent}
                      </span>
                    </div>
                    <span
                      className="text-[11px]"
                      style={{
                        fontFamily: 'Aeonik Pro, sans-serif',
                        color: row.saved.startsWith('+') ? '#157A3E' : '#157A3E',
                      }}
                    >
                      {row.saved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px] text-[#141413]"
                      style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                    >
                      {row.request}
                    </span>
                    {row.complexity !== 'loop' && (
                      <span
                        className="text-[10px] text-[#9C9C96]"
                        style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                      >
                        {row.routeFrom} → {row.routeTo}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
