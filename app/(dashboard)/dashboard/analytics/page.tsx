'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePlan } from '@/lib/user-context';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

type TimeRange = 'month' | 'last' | '90d';

/* ── Agent filter data (Team) ─────────────────────────────────────── */
const agents = [
  { name: 'All agents', dotColor: '#22C55E' },
  { name: 'Main Dev Agent', dotColor: '#22C55E' },
  { name: 'Email Assistant', dotColor: '#22C55E' },
  { name: 'Code Reviewer', dotColor: '#22C55E' },
  { name: 'Research Bot', dotColor: '#B8B8B0' },
  { name: 'Slack Monitor', dotColor: '#22C55E' },
];

/* ── Data ────────────────────────────────────────────────────────── */
const modelDistribution = [
  { name: 'Flash-Lite', pct: 48, requests: '19,204', cost: '$4.23', barColor: 'rgba(23,128,61,0.25)', borderColor: '#000000', dotColor: '#6EE7B7', textColor: '#000000' },
  { name: 'Haiku 4.5', pct: 22, requests: '8,810', cost: '$13.97', barColor: 'rgba(147,197,253,0.53)', borderColor: '#4793E9', dotColor: '#93C5FD', textColor: 'rgba(0,0,0,0.7)' },
  { name: 'Sonnet 4.5', pct: 18, requests: '7,209', cost: '$27.43', barColor: 'rgba(252,211,77,0.42)', borderColor: '#EB9327', dotColor: '#FCD34D', textColor: 'rgba(0,0,0,0.7)' },
  { name: 'Opus 4.6', pct: 12, requests: '4,805', cost: '$41.86', barColor: 'rgba(249,168,212,0.59)', borderColor: '#EF69B2', dotColor: '#F9A8D4', textColor: '#111110' },
];

const skillsData = [
  { rank: 1, name: 'Heartbeat checks', volume: '6,840 req/d', costDay: '$0.57', savedDay: '+$78.04', model: 'Flash-Lite', barWidth: 100, trendDir: 'down' as const, trendColor: '#17803D' },
  { rank: 2, name: 'Email triage', volume: '1,616 req/d', costDay: '$8.74', savedDay: '+$42.33', model: 'Haiku 4.5', barWidth: 50, trendDir: 'up' as const, trendColor: '#D93025' },
  { rank: 3, name: 'Code review', volume: '423 req/d', costDay: '$19.95', savedDay: '+$29.93', model: 'Sonnet 4.5', barWidth: 56, trendDir: 'up' as const, trendColor: '#D93025' },
  { rank: 4, name: 'File operations', volume: '2,947 req/d', costDay: '$2.14', savedDay: '+$60.80', model: 'Flash-Lite', barWidth: 6, trendDir: 'down' as const, trendColor: '#17803D' },
  { rank: 5, name: 'Complex reasoning', volume: '200 req/d', costDay: '$32.30', savedDay: '—', model: 'Opus 4.6', barWidth: 90, trendDir: 'right' as const, trendColor: '#B8B8B0' },
  { rank: 6, name: 'Slack integration', volume: '998 req/d', costDay: '$4.37', savedDay: '+$19.72', model: 'Haiku 4.5', barWidth: 12, trendDir: 'down' as const, trendColor: '#17803D' },
  { rank: 7, name: 'Calendar sync', volume: '855 req/d', costDay: '$3.18', savedDay: '+$44.32', model: 'Flash-Lite', barWidth: 8, trendDir: 'down' as const, trendColor: '#17803D' },
  { rank: 8, name: 'Git diff analysis', volume: '371 req/d', costDay: '$14.73', savedDay: '+$22.09', model: 'Sonnet 4.5', barWidth: 40, trendDir: 'up' as const, trendColor: '#D93025' },
];

/* Daily cost chart data (Feb 1-11) — Team scale */
const dailyCostData = [
  { day: 'Feb 1', without: 57, actual: 8.6 },
  { day: 'Feb 2', without: 52, actual: 7.1 },
  { day: 'Feb 3', without: 62, actual: 10.0 },
  { day: 'Feb 4', without: 48, actual: 5.7 },
  { day: 'Feb 5', without: 67, actual: 11.9 },
  { day: 'Feb 6', without: 52, actual: 7.6 },
  { day: 'Feb 7', without: 43, actual: 3.8 },
  { day: 'Feb 8', without: 57, actual: 9.0 },
  { day: 'Feb 9', without: 62, actual: 10.5 },
  { day: 'Feb 10', without: 52, actual: 6.7 },
  { day: 'Feb 11', without: 57, actual: 8.1 },
];

export default function AnalyticsPage() {
  const { canExportCsv, isPaid, plan } = usePlan();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('All agents');

  // Starter only gets "This month", Pro/Team get all options
  const timeRangeOptions = isPaid
    ? [
        { key: 'month' as const, label: 'This month' },
        { key: 'last' as const, label: 'Last month' },
        { key: '90d' as const, label: 'Last 90 days' },
      ]
    : [
        { key: 'month' as const, label: 'This month' },
      ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-[12px] px-[4px] sm:px-0">
        <div className="pt-[16px]">
          <h1
            className="text-[26px] leading-[1.08] text-[#111110]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
          >
            Analytics <span className="text-[#8F8F87]">&gt;</span> <span className="text-[#8F8F87]">{selectedAgent}</span>
          </h1>
          <p
            className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            February 2026
          </p>
        </div>

        <div className="flex gap-[8px] mt-[12px] sm:mt-[7px]">
          {timeRangeOptions.map((item) => (
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
                style={{ color: timeRange === item.key ? '#FFFFFF' : '#55554F' }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Agent filter bar (multi-agent plans only) */}
      {isPaid && (
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
      )}

      {/* ── Stat cards ──────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-[3px]">
        {/* Total savings */}
        <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
          <Image src="/images/dashboard/money-04.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Total savings</span>
            <span className="text-[30px] leading-[1] text-[#17803D] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>$247</span>
            <div className="flex items-center gap-[6px] mt-[8px]">
              <span className="inline-flex items-center h-[19px] px-[7px] rounded-[2px] text-[11.5px] leading-[1.3] font-semibold text-[#17803D]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526', fontFamily: 'DM Sans, sans-serif' }}>+24%</span>
              <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Total spend */}
        <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
          <Image src="/images/dashboard/analytics-01.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Total spend</span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>$87</span>
            <div className="flex items-center gap-[6px] mt-[8px]">
              <span className="inline-flex items-center h-[19px] px-[7px] rounded-[2px] text-[11.5px] leading-[1.3] font-semibold text-[#17803D]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526', fontFamily: 'DM Sans, sans-serif' }}>-22%</span>
              <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>would be $338</span>
            </div>
          </div>
        </motion.div>

        {/* Requests */}
        <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
          <Image src="/images/dashboard/zap.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Requests</span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>40,028</span>
            <div className="flex items-center gap-[6px] mt-[8px]">
              <span className="inline-flex items-center h-[19px] px-[7px] rounded-[2px] text-[11.5px] leading-[1.3] font-semibold text-[#17803D]" style={{ backgroundColor: '#E2F3EA', border: '1px solid #0C5526', fontFamily: 'DM Sans, sans-serif' }}>+12%</span>
              <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>73% routed cheaper</span>
            </div>
          </div>
        </motion.div>

        {/* Avg cost/request */}
        <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
          <Image src="/images/dashboard/analytics-01.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
          <div className="px-[21px] pt-[27px]">
            <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Avg cost/request</span>
            <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>$0.002</span>
            <div className="flex items-center gap-[6px] mt-[8px]">
              <span className="inline-flex items-center h-[19px] px-[7px] rounded-[2px] text-[11.5px] leading-[1.3] font-semibold text-[#D93025]" style={{ backgroundColor: '#FDE8E6', border: '1px solid #D93025', fontFamily: 'DM Sans, sans-serif' }}>-74%</span>
              <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>from $0.0084</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Model distribution ──────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] mt-[3px]">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
            Model distribution · This month
          </span>
          <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Details →
          </span>
        </div>

        {/* Stacked bar */}
        <div className="flex h-[42px] rounded-[1px] overflow-hidden">
          {modelDistribution.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-center"
              style={{
                width: `${m.pct}%`,
                backgroundColor: m.barColor,
                borderRight: m.name !== 'Opus 4.6' ? `1px solid ${m.borderColor}` : 'none',
              }}
            >
              <span className={`text-[11.5px] leading-[1.15] ${m.pct >= 18 ? 'block' : 'hidden sm:block'}`} style={{ fontFamily: 'Aeonik Pro, sans-serif', color: m.textColor }}>
                {m.name} {m.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[8px] mt-[14px]">
          {modelDistribution.map((m) => (
            <div key={m.name} className="bg-[#FAFAF8] border border-[#EEEDE9] rounded-[8px] p-[14px]">
              <div className="flex items-center gap-[8px] mb-[10px]">
                <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: m.dotColor }} />
                <span className="text-[13px] leading-[1.15] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{m.name}</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Requests</span>
                  <span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{m.requests}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Cost</span>
                  <span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{m.cost}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Share</span>
                  <span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{m.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Daily cost chart ────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] mt-[3px]">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
            Daily cost · Feb 2026
          </span>
          {canExportCsv ? (
            <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              Download report &rarr;
            </span>
          ) : (
            <Link href="/dashboard/upgrade?plan=pro" className="flex items-center gap-[4px] text-[11.5px] leading-[1.15] text-[#8F8F87] hover:text-[#55554F] transition" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Pro
            </Link>
          )}
        </div>

        {/* Chart */}
        <div className="relative" style={{ height: 200 }}>
          <svg className="w-full h-full" viewBox="0 0 900 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="withoutGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(208,207,202,0.12)" />
                <stop offset="100%" stopColor="rgba(208,207,202,0)" />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(23,128,61,0.12)" />
                <stop offset="100%" stopColor="rgba(23,128,61,0)" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="0" y1={i * 66} x2="900" y2={i * 66} stroke="#EEEDE9" strokeWidth="0.89" />
            ))}

            {/* Without ClawProxy area */}
            <path
              d={`M ${dailyCostData.map((d, i) => `${(i / (dailyCostData.length - 1)) * 900},${200 - (d.without / 75) * 180}`).join(' L ')} L 900,200 L 0,200 Z`}
              fill="url(#withoutGrad)"
            />
            <polyline
              points={dailyCostData.map((d, i) => `${(i / (dailyCostData.length - 1)) * 900},${200 - (d.without / 75) * 180}`).join(' ')}
              fill="none" stroke="#D0CFCA" strokeWidth="1" strokeDasharray="3.56 2.67"
            />

            {/* Actual cost area */}
            <path
              d={`M ${dailyCostData.map((d, i) => `${(i / (dailyCostData.length - 1)) * 900},${200 - (d.actual / 75) * 180}`).join(' L ')} L 900,200 L 0,200 Z`}
              fill="url(#actualGrad)"
            />
            <polyline
              points={dailyCostData.map((d, i) => `${(i / (dailyCostData.length - 1)) * 900},${200 - (d.actual / 75) * 180}`).join(' ')}
              fill="none" stroke="#17803D" strokeWidth="1.78"
            />

            {/* Data points */}
            {dailyCostData.map((d, i) => (
              <circle
                key={i}
                cx={(i / (dailyCostData.length - 1)) * 900}
                cy={200 - (d.actual / 75) * 180}
                r="3.5" fill="#17803D" stroke="white" strokeWidth="1.8"
              />
            ))}
          </svg>

          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
            {['$75', '$50', '$25', '$0'].map((l) => (
              <span key={l} className="text-[8px] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* X-axis */}
        <div className="flex justify-between mt-[4px]">
          {dailyCostData.map((d) => (
            <span key={d.day} className="text-[9px] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{d.day.replace('Feb ', '')}</span>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-[16px] mt-[10px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[10px] h-[3px] rounded-[2px] bg-[#17803D]" />
            <span className="text-[12px] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Actual cost</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <div className="w-[10px] h-[3px] rounded-[2px] bg-[#D0CFCA]" />
            <span className="text-[12px] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Without ClawProxy (est)</span>
          </div>
        </div>
      </motion.div>

      {/* ── Skills ranked by cost ────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] mt-[3px] mb-[7px]">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
            All skills ranked by cost
          </span>
          {canExportCsv ? (
            <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              Export &rarr;
            </span>
          ) : (
            <Link href="/dashboard/upgrade?plan=pro" className="flex items-center gap-[4px] text-[11.5px] leading-[1.15] text-[#8F8F87] hover:text-[#55554F] transition" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Pro
            </Link>
          )}
        </div>

        {/* Table header */}
        <div className="hidden sm:grid items-center h-[32px]" style={{ gridTemplateColumns: '30px 1fr 100px 80px 80px 80px 40px', borderBottom: '1px solid #EEEDE9' }}>
          {['#', 'Skill', 'Volume', 'Cost/day', 'Saved/day', 'Model', 'Trend'].map((h) => (
            <span key={h} className="text-[10px] leading-[1.15] text-[#B8B8B0] uppercase" style={{ fontFamily: h === '#' ? 'DM Sans, sans-serif' : 'Aeonik Pro, sans-serif', letterSpacing: '0.06em', fontWeight: h === '#' ? 600 : 400 }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {skillsData.map((s, i) => (
          <div
            key={s.rank}
            className="hidden sm:grid items-center h-[44px] transition-colors"
            style={{
              gridTemplateColumns: '30px 1fr 100px 80px 80px 80px 40px',
              borderBottom: i < skillsData.length - 1 ? '1px solid #EEEDE9' : 'none',
              backgroundColor: hoveredSkill === i ? '#FAFAF8' : 'transparent',
            }}
            onMouseEnter={() => setHoveredSkill(i)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <span className="text-[11px] text-[#B8B8B0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.rank}</span>
            <div className="flex items-center gap-[12px]">
              <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{s.name}</span>
              <div className="w-[50px] h-[6px] rounded-[3px] bg-[#EEEDEA] overflow-hidden">
                <div className="h-full rounded-[3px]" style={{ width: `${s.barWidth}%`, backgroundColor: 'rgba(37,99,235,0.62)', border: '1px solid #2563EB' }} />
              </div>
            </div>
            <span className="text-[12px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{s.volume}</span>
            <span className="text-[12px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{s.costDay}</span>
            <span className="text-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: s.savedDay.startsWith('+') ? '#17803D' : '#111110' }}>{s.savedDay}</span>
            <span className="text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{s.model}</span>
            <span className="text-[12px]" style={{ color: s.trendColor }}>
              {s.trendDir === 'down' ? '↓' : s.trendDir === 'up' ? '↑' : '→'}
            </span>
          </div>
        ))}

        {/* Mobile rows */}
        {skillsData.map((s) => (
          <div key={`m-${s.rank}`} className="sm:hidden py-[10px]" style={{ borderBottom: '1px solid #EEEDE9' }}>
            <div className="flex items-center justify-between mb-[4px]">
              <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>#{s.rank} {s.name}</span>
              <span className="text-[12px]" style={{ color: s.trendColor }}>{s.trendDir === 'down' ? '↓' : s.trendDir === 'up' ? '↑' : '→'}</span>
            </div>
            <div className="flex items-center gap-[12px] text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              <span>{s.costDay}/d</span>
              <span>{s.model}</span>
              <span style={{ color: s.savedDay.startsWith('+') ? '#17803D' : '#8F8F87' }}>{s.savedDay}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
