'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePlan } from '@/lib/user-context';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

type TimeRange = 'today' | 'week' | 'month';

/* ── Data ────────────────────────────────────────────────────────── */
const modelDistribution = [
  { name: 'Flash-Lite', pct: 48, cost: '$0.89', barColor: 'rgba(23,128,61,0.25)', borderColor: '#000000', dotColor: '#89BE9C', textColor: '#000000' },
  { name: 'Haiku 4.5', pct: 22, cost: '$2.94', barColor: 'rgba(147,197,253,0.53)', borderColor: '#4793E9', dotColor: '#93C5FD', textColor: 'rgba(0,0,0,0.7)' },
  { name: 'Sonnet 4.5', pct: 18, cost: '$5.77', barColor: 'rgba(252,211,77,0.42)', borderColor: '#EB9327', dotColor: '#FCD34D', textColor: 'rgba(0,0,0,0.7)' },
  { name: 'Opus 4.6', pct: 12, cost: '$8.80', barColor: 'rgba(249,168,212,0.59)', borderColor: '#EF69B2', dotColor: '#F9A8D4', textColor: '#111110' },
];

const costBySkill = [
  { rank: 1, name: 'Heartbeat checks', cost: '$0.12', model: 'Flash-Lite', barWidth: 5, barColor: 'rgba(37,99,235,0.62)', barBorder: '#2563EB' },
  { rank: 2, name: 'Email triage', cost: '$1.84', model: 'Haiku 4.5', barWidth: 17, barColor: 'rgba(8,156,61,0.2)', barBorder: undefined },
  { rank: 3, name: 'Code review', cost: '$4.20', model: 'Sonnet 4.5', barWidth: 45, barColor: '#EEEDEA', barBorder: undefined },
  { rank: 4, name: 'File operations', cost: '$0.45', model: 'Flash-Lite', barWidth: 8, barColor: '#EEEDEA', barBorder: undefined },
  { rank: 5, name: 'Complex reasoning', cost: '$6.80', model: 'Opus 4.6', barWidth: 67, barColor: 'rgba(195,110,6,0.38)', barBorder: '#BD5800' },
];

const weeklyData = [
  { day: 'Mon', without: 68, with: 19 },
  { day: 'Tue', without: 61, with: 17 },
  { day: 'Wed', without: 89, with: 25 },
  { day: 'Thu', without: 76, with: 14 },
  { day: 'Fri', without: 100, with: 31 },
  { day: 'Sat', without: 55, with: 8 },
  { day: 'Sun', without: 19, with: 5 },
];

const howYoureSaving = [
  { icon: '/images/dashboard/layers-01.svg', title: 'Model routing', desc: '73% requests → cheaper models', amount: '$3.14' },
  { icon: '/images/dashboard/repeat.svg', title: 'Loop prevention', desc: '2 loops caught today', amount: '$0.89' },
  { icon: '/images/dashboard/ai-content-generator-02.svg', title: 'Context compression', desc: 'Avg 78% token reduction', amount: '$0.89' },
];

/* ── Agent filter + performance data (Team) ────────────────────────── */
const agents = [
  { name: 'All agents', dotColor: '#22C55E', active: true },
  { name: 'Main Dev Agent', dotColor: '#22C55E', active: false },
  { name: 'Email Assistant', dotColor: '#22C55E', active: false },
  { name: 'Code Reviewer', dotColor: '#22C55E', active: false },
  { name: 'Research Bot', dotColor: '#B8B8B0', active: false },
  { name: 'Slack Monitor', dotColor: '#22C55E', active: false, glow: true },
];

const agentPerformance = [
  { name: 'Main Dev Agent', status: 'active', spend: '$1.93', saved: '$4.82', requests: '847', loops: '2' },
  { name: 'Email Assistant', status: 'active', spend: '$0.67', saved: '$2.14', requests: '312', loops: '0' },
  { name: 'Code Reviewer', status: 'active', spend: '$2.41', saved: '$3.07', requests: '156', loops: '1' },
  { name: 'Research Bot', status: 'paused', spend: '$0.00', saved: '$0.00', requests: '0', loops: '0' },
  { name: 'Slack Monitor', status: 'active', spend: '$0.38', saved: '$1.92', requests: '489', loops: '0' },
];

/* ── Activity data (deterministic) ───────────────────────────────── */
const activityHeights = [
  42, 28, 15, 8, 5, 3, 4, 12, 22, 35, 48, 55,
  62, 70, 58, 45, 72, 80, 88, 65, 50, 38, 42, 55,
  68, 75, 82, 78, 70, 55, 48, 42, 35, 30, 25, 38,
  45, 55, 60, 52, 40, 30, 22, 15, 10, 8, 5, 18,
];

export default function DashboardPage() {
  const { isPaid, canExportCsv, canUseLoopDetection } = usePlan();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('All agents');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-[16px] px-[4px] sm:px-0">
        <div className="pt-[16px] sm:pt-[16px]">
          <h1
            className="text-[26px] leading-[1.08] text-[#111110]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
          >
            Overview
          </h1>
          <p
            className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            Your agent &middot; {today}
          </p>
        </div>

        {/* Time range toggle */}
        <div className="flex gap-[8px] mt-[12px] sm:mt-[7px]">
          {([
            { key: 'today' as const, label: 'Today' },
            { key: 'week' as const, label: 'This week' },
            { key: 'month' as const, label: 'This month' },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeRange(item.key)}
              className="h-[30px] rounded-[6px] flex items-center justify-center cursor-pointer transition-all"
              style={{
                padding: '0 15px',
                backgroundColor: timeRange === item.key ? '#111110' : '#FFFFFF',
                border: timeRange === item.key ? '1px solid #111110' : '1px solid #E2E1DC',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              <span
                className="text-[12px] leading-[1.15]"
                style={{
                  color: timeRange === item.key ? '#FFFFFF' : '#55554F',
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Agent filter bar (multi-agent plans only) ──────── */}
      {isPaid && (
        <motion.div variants={fadeUp} className="flex items-center gap-[8px] mb-[10px] overflow-x-auto pb-[4px] px-[4px] sm:px-0">
          {agents.map((agent) => (
            <button
              key={agent.name}
              onClick={() => setSelectedAgent(agent.name)}
              className="shrink-0 h-[34px] flex items-center gap-[8px] px-[15px] transition-all cursor-pointer"
              style={{
                borderRadius: selectedAgent === agent.name ? '7px' : '8px',
                backgroundColor: selectedAgent === agent.name ? 'rgba(34,197,94,0.08)' : '#FFFFFF',
                border: selectedAgent === agent.name ? '1px solid #0C5526' : '1px solid #E2E1DC',
              }}
            >
              <div
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{
                  backgroundColor: agent.dotColor,
                  boxShadow: agent.glow ? '0px 0px 6px 0px rgba(34,197,94,0.4)' : 'none',
                }}
              />
              <span
                className="text-[12.5px] leading-[1.15] text-[#111110] whitespace-nowrap"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                {agent.name}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Stat cards row ──────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-5 gap-[3px]">
        {/* Saved today */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden"
          style={{ height: 135 }}
        >
          <Image
            src="/images/dashboard/money-04.svg"
            alt=""
            width={36}
            height={36}
            className="absolute right-[21px] top-[17px]"
          />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>
              Saved today
            </span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>
              $4.82
            </span>
            <div className="flex items-center gap-[6px] mt-[8px]">
              <span
                className="inline-flex items-center h-[19px] px-[7px] rounded-[2px] text-[11.5px] leading-[1.3] font-semibold text-[#17803D]"
                style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526', fontFamily: 'DM Sans, sans-serif' }}
              >
                ↑ 12%
              </span>
              <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                vs yesterday
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actual spend */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden"
          style={{ height: 135 }}
        >
          <Image
            src="/images/dashboard/analytics-01.svg"
            alt=""
            width={36}
            height={36}
            className="absolute right-[21px] top-[17px]"
          />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>
              Actual spend
            </span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>
              $1.93
            </span>
            <span className="text-[11.5px] leading-[1.15] text-[#8F8F87] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              13% of $15 daily limit
            </span>
          </div>
        </motion.div>

        {/* Requests routed */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden"
          style={{ height: 135 }}
        >
          <Image
            src="/images/dashboard/zap.svg"
            alt=""
            width={36}
            height={36}
            className="absolute right-[21px] top-[17px]"
          />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>
              Requests routed
            </span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>
              847
            </span>
            <div className="flex items-center gap-[6px] mt-[8px]">
              <span
                className="inline-flex items-center h-[19px] px-[7px] rounded-[2px] text-[11.5px] leading-[1.3] font-semibold text-[#17803D]"
                style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526', fontFamily: 'DM Sans, sans-serif' }}
              >
                73%
              </span>
              <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                sent to cheaper models
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loops killed */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden"
          style={{ height: 135 }}
        >
          {canUseLoopDetection ? (
            <>
              <Image
                src="/images/dashboard/shield-energy.svg"
                alt=""
                width={36}
                height={36}
                className="absolute right-[21px] top-[17px]"
              />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>
                  Loops killed
                </span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>
                  2
                </span>
                <span className="text-[11.5px] leading-[1.15] text-[#8F8F87] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Saved ~$0.89
                </span>
              </div>
            </>
          ) : (
            <Link href="/dashboard/upgrade?plan=pro" className="block px-[21px] pt-[27px] h-full">
              <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>
                Loops killed
              </span>
              <div className="flex items-center gap-[6px] mt-[18px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F8F87" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[13px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Pro feature</span>
              </div>
              <span className="text-[11.5px] leading-[1.15] text-[#17803D] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Upgrade &rarr;
              </span>
            </Link>
          )}
        </motion.div>

        {/* Active agents (Team) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden"
          style={{ height: 135 }}
        >
          <Image
            src="/images/dashboard/robot-01.svg"
            alt=""
            width={36}
            height={36}
            className="absolute right-[21px] top-[17px]"
          />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>
              Active agents
            </span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>
              5
            </span>
            <span className="text-[11.5px] leading-[1.15] text-[#8F8F87] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              1 paused
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Cost comparison + How you're saving ─────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[3px] mt-[3px]">
        {/* Cost comparison chart */}
        <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
              Cost comparison · This week
            </span>
            {canExportCsv ? (
              <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Export CSV &rarr;
              </span>
            ) : (
              <Link href="/dashboard/upgrade?plan=pro" className="flex items-center gap-[4px] text-[11.5px] leading-[1.15] text-[#8F8F87] hover:text-[#55554F] transition" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Pro
              </Link>
            )}
          </div>

          {/* Chart area */}
          <div className="relative" style={{ height: 180 }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between" style={{ width: 30 }}>
              {['$15', '$11', '$7', '$4', '$0'].map((label) => (
                <span key={label} className="text-[10px] leading-[1.15] text-[#B8B8B0] text-right block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {label}
                </span>
              ))}
            </div>

            {/* Grid lines */}
            <div className="absolute left-[40px] right-0 top-0 bottom-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-px bg-[#EEEDE9]" />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute left-[40px] right-0 top-[6px] bottom-[6px] flex items-end gap-[4px]">
              {weeklyData.map((d, i) => (
                <div
                  key={d.day}
                  className="flex-1 flex gap-[4px] items-end h-full relative group"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {hoveredBar === i && (
                    <div className="absolute -top-[36px] left-1/2 -translate-x-1/2 bg-[#111110] text-white text-[10px] px-[8px] py-[4px] rounded-[4px] whitespace-nowrap z-10">
                      Without: ${(d.without / 100 * 15).toFixed(2)} · With: ${(d.with / 100 * 15).toFixed(2)}
                    </div>
                  )}
                  <div
                    className="flex-1 rounded-[2px] transition-all duration-200"
                    style={{
                      height: `${d.without}%`,
                      backgroundColor: hoveredBar === i ? '#D4D3CE' : '#EEEDEA',
                    }}
                  />
                  <div
                    className="flex-1 rounded-[2px] transition-all duration-200"
                    style={{
                      height: `${d.with}%`,
                      backgroundColor: hoveredBar === i ? '#0C5526' : 'rgba(23,128,61,0.51)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Day labels */}
          <div className="flex mt-[6px]" style={{ paddingLeft: 40 }}>
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 text-center">
                <span className="text-[10px] leading-[1.15] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-[16px] mt-[10px]">
            <div className="flex items-center gap-[6px]">
              <div className="w-[10px] h-[3px] rounded-[2px] bg-[#EEEDEA]" />
              <span className="text-[12px] leading-[1.15] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Without ClawProxy</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="w-[10px] h-[3px] rounded-[2px] bg-[#17803D]" />
              <span className="text-[12px] leading-[1.15] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>With ClawProxy</span>
            </div>
          </div>
        </div>

        {/* How you're saving */}
        <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
          <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
            How you&apos;re saving
          </span>

          <div className="mt-[10px]">
            {howYoureSaving.map((item, i) => (
              <div
                key={item.title}
                className="flex items-start py-[15px]"
                style={{ borderBottom: i < howYoureSaving.length - 1 ? '1px solid #EEEDE9' : 'none' }}
              >
                <Image src={item.icon} alt="" width={23} height={23} className="mt-[1px] shrink-0" />
                <div className="ml-[15px] flex-1 min-w-0">
                  <span className="text-[13px] leading-[1.15] text-[#111110] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {item.title}
                  </span>
                  <span className="text-[11px] leading-[1.15] text-[#8F8F87] block mt-[3px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {item.desc}
                  </span>
                </div>
                <span className="text-[14px] leading-[1.15] text-[#17803D] shrink-0 ml-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Model distribution + Cost by skill ──────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-[3px] mt-[3px]">
        {/* Model distribution */}
        <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
          <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
            Model distribution · Today
          </span>

          {/* Stacked bar */}
          <div className="flex h-[36px] mt-[14px] rounded-[1px] overflow-hidden">
            {modelDistribution.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-center relative group"
                style={{
                  width: `${m.pct}%`,
                  backgroundColor: m.barColor,
                  borderRight: m.name !== 'Opus 4.6' ? `1px solid ${m.borderColor}` : 'none',
                }}
              >
                <span
                  className={`text-[10.5px] leading-[1.15] ${m.pct >= 18 ? 'block' : 'hidden sm:block'}`}
                  style={{ fontFamily: 'Aeonik Pro, sans-serif', color: m.textColor }}
                >
                  {m.name} {m.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Legend items */}
          <div className="mt-[14px] space-y-[7px]">
            {modelDistribution.map((m) => (
              <div
                key={m.name}
                className="flex items-center h-[30px] px-[13px] rounded-[6px] bg-[#FAFAF8] border border-[#EEEDE9]"
              >
                <div
                  className="w-[10px] h-[10px] rounded-[3px] shrink-0"
                  style={{ backgroundColor: m.dotColor }}
                />
                <span className="text-[12px] leading-[1.15] text-[#111110] ml-[16px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {m.name}
                </span>
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] ml-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {m.pct}%
                </span>
                <span className="text-[11px] leading-[1.15] text-[#55554F] ml-auto" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {m.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by skill */}
        <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
              Cost by skill
            </span>
            <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              View all →
            </span>
          </div>

          <div className="mt-[10px]">
            {costBySkill.map((s, i) => (
              <div
                key={s.rank}
                className="flex items-center h-[34px] transition-colors"
                style={{
                  borderBottom: i < costBySkill.length - 1 ? '1px solid #EEEDE9' : 'none',
                  backgroundColor: hoveredSkill === i ? '#FAFAF8' : 'transparent',
                }}
                onMouseEnter={() => setHoveredSkill(i)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <span className="text-[11px] leading-[1.15] text-[#B8B8B0] w-[14px] shrink-0" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  #{s.rank}
                </span>
                <span className="text-[13px] leading-[1.15] text-[#111110] ml-[20px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {s.name}
                </span>

                {/* Mini progress bar */}
                <div className="ml-auto flex items-center gap-[12px]">
                  <div className="w-[80px] h-[6px] rounded-[3px] bg-[#EEEDEA] overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${s.barWidth}%`,
                        backgroundColor: s.barColor,
                        border: s.barBorder ? `1px solid ${s.barBorder}` : 'none',
                      }}
                    />
                  </div>
                  <span className="text-[12px] leading-[1.15] text-[#111110] text-right w-[40px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {s.cost}
                  </span>
                  <span className="text-[10px] leading-[1.15] text-[#8F8F87] w-[60px] text-right hidden sm:block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {s.model}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Request activity + Daily budget ──────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[3px] mt-[3px]">
        {/* Request activity */}
        <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
          <div className="flex items-center justify-between mb-[12px]">
            <span className="text-[11px] leading-[1.3] text-[#8F8F87] uppercase font-semibold" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.064em' }}>
              Request activity · 24 hours
            </span>
            <div className="flex items-center gap-[3px]">
              <div
                className="w-[7px] h-[7px] rounded-full"
                style={{ backgroundColor: '#22C55E', opacity: 0.48 }}
              />
              <span className="text-[11px] leading-[1.3] text-[#55554F]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {' '}Live
              </span>
            </div>
          </div>

          {/* Activity chart */}
          <div className="relative" style={{ height: 189 }}>
            <svg className="w-full h-full" viewBox="0 0 707 189" preserveAspectRatio="none">
              <defs>
                <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(13,148,136,0.2)" />
                  <stop offset="100%" stopColor="rgba(13,148,136,0)" />
                </linearGradient>
              </defs>

              <path
                d={`M ${activityHeights.map((h, i) => `${(i / (activityHeights.length - 1)) * 707},${189 - (h / 100) * 170}`).join(' L ')} L 707,189 L 0,189 Z`}
                fill="url(#activityGrad)"
              />

              <polyline
                points={activityHeights.map((h, i) => `${(i / (activityHeights.length - 1)) * 707},${189 - (h / 100) * 170}`).join(' ')}
                fill="none"
                stroke="#0D9488"
                strokeWidth="1.8"
              />

              <circle
                cx={707}
                cy={189 - (activityHeights[activityHeights.length - 1] / 100) * 170}
                r="3.5"
                fill="#0D9488"
                stroke="white"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          {/* Time labels */}
          <div className="flex justify-between mt-[4px]">
            {['12am', '4am', '8am', '12pm', '4pm', '8pm', 'Now'].map((t) => (
              <span key={t} className="text-[9.5px] leading-[1.15] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Daily budget */}
        <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
          <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
            Daily budget
          </span>

          {/* Circular progress */}
          <div className="flex justify-center mt-[20px]">
            <div className="relative" style={{ width: 140, height: 87.5 }}>
              <svg viewBox="0 0 140 105" className="w-full h-full overflow-visible">
                <path
                  d="M 17.5 87.5 A 52.5 52.5 0 1 1 122.5 87.5"
                  fill="none"
                  stroke="#EEEDEA"
                  strokeWidth="10.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 17.5 87.5 A 52.5 52.5 0 0 1 21.5 64"
                  fill="none"
                  stroke="#17803D"
                  strokeWidth="10.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Budget text */}
          <div className="text-center mt-[12px]">
            <span className="text-[28px] leading-[1.3] text-[#111110] font-bold block" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.036em' }}>
              $1.93
            </span>
            <span className="text-[11px] leading-[1.3] text-[#111110] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              of $15.00 limit
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center mt-[14px] gap-0">
            <div className="text-center">
              <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Remaining
              </span>
              <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                $13.07
              </span>
            </div>
            <div className="w-px h-[32px] bg-[#E2E1DC] mx-[16px]" />
            <div className="text-center">
              <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Monthly
              </span>
              <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                $18.40
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Agent Performance (Team) ────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[9px] shadow-claw-sm mt-[3px] mb-[7px] overflow-hidden">
        <div className="flex items-center justify-between px-[23px] py-[18px]">
          <span
            className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase"
            style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}
          >
            Agent performance
          </span>
          <span
            className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            + Add agent
          </span>
        </div>

        {/* Table header */}
        <div
          className="hidden sm:grid h-[36px] items-center px-[20px]"
          style={{
            gridTemplateColumns: '1fr 100px 80px 80px 80px 60px',
            borderBottom: '1px solid #EEEDE9',
          }}
        >
          {['Agent', 'Status', 'Spend', 'Saved', 'Requests', 'Loops'].map((h) => (
            <span
              key={h}
              className="text-[10px] leading-[1.15] text-[#B8B8B0] uppercase"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.06em' }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {agentPerformance.map((agent, i) => (
          <div key={agent.name}>
            {/* Desktop */}
            <div
              className="hidden sm:grid h-[44px] items-center px-[20px] hover:bg-[#FAFAF8] transition"
              style={{
                gridTemplateColumns: '1fr 100px 80px 80px 80px 60px',
                borderBottom: i < agentPerformance.length - 1 ? '1px solid #EEEDE9' : 'none',
              }}
            >
              <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                {agent.name}
              </span>
              <div>
                <span
                  className="inline-flex items-center gap-[5px] h-[18px] px-[8px] rounded-[20px] text-[10px]"
                  style={{
                    backgroundColor: agent.status === 'active' ? '#E2F3EA' : '#EEEDEA',
                    fontFamily: 'Aeonik Pro, sans-serif',
                    letterSpacing: '0.03em',
                  }}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full"
                    style={{ backgroundColor: agent.status === 'active' ? '#22C55E' : '#B8B8B0' }}
                  />
                  <span style={{ color: agent.status === 'active' ? '#17803D' : '#B8B8B0' }}>
                    {agent.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </span>
              </div>
              <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.spend}</span>
              <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.saved}</span>
              <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.requests}</span>
              <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.loops}</span>
            </div>

            {/* Mobile */}
            <div
              className="sm:hidden px-[16px] py-[12px]"
              style={{ borderBottom: i < agentPerformance.length - 1 ? '1px solid #EEEDE9' : 'none' }}
            >
              <div className="flex items-center justify-between mb-[6px]">
                <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.name}</span>
                <span
                  className="inline-flex items-center gap-[4px] h-[18px] px-[8px] rounded-[20px] text-[10px]"
                  style={{
                    backgroundColor: agent.status === 'active' ? '#E2F3EA' : '#EEEDEA',
                    color: agent.status === 'active' ? '#17803D' : '#B8B8B0',
                    fontFamily: 'Aeonik Pro, sans-serif',
                  }}
                >
                  <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: agent.status === 'active' ? '#22C55E' : '#B8B8B0' }} />
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-[16px] text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                <span>Spend: {agent.spend}</span>
                <span>Saved: {agent.saved}</span>
                <span>Req: {agent.requests}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
