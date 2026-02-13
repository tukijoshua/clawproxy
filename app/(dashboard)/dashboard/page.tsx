'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePlan } from '@/lib/user-context';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

type TimeRange = 'today' | 'week' | 'month';

interface OverviewData {
  totalSaved: number;
  totalSpend: number;
  requestCount: number;
  loopsKilled: number;
  activeAgents: number;
  modelDistribution: Array<{ name: string; pct: number; cost: number; requests: number }>;
  dailyCostData: Array<{ day: string; actual: number; without: number }>;
  savingsBreakdown: { routing: number; loops: number };
  agentPerformance: Array<{ id: string; label: string; spend: number; saved: number; requests: number; loops: number; active: boolean }>;
  budgetUsage: { dailySpend: number; monthlySpend: number; dailyBudget: number | null; monthlyBudget: number | null };
  activityByHour: number[];
}

const MODEL_COLORS: Record<string, { barColor: string; borderColor: string; dotColor: string; textColor: string }> = {
  'google/gemini-2.0-flash-lite-001': { barColor: 'rgba(23,128,61,0.25)', borderColor: '#000000', dotColor: '#89BE9C', textColor: '#000000' },
  'anthropic/claude-haiku-4-5': { barColor: 'rgba(147,197,253,0.53)', borderColor: '#4793E9', dotColor: '#93C5FD', textColor: 'rgba(0,0,0,0.7)' },
  'anthropic/claude-3.5-haiku': { barColor: 'rgba(147,197,253,0.53)', borderColor: '#4793E9', dotColor: '#93C5FD', textColor: 'rgba(0,0,0,0.7)' },
  'anthropic/claude-sonnet-4-5': { barColor: 'rgba(252,211,77,0.42)', borderColor: '#EB9327', dotColor: '#FCD34D', textColor: 'rgba(0,0,0,0.7)' },
  'anthropic/claude-opus-4-6': { barColor: 'rgba(249,168,212,0.59)', borderColor: '#EF69B2', dotColor: '#F9A8D4', textColor: '#111110' },
  'openai/gpt-4o': { barColor: 'rgba(167,139,250,0.4)', borderColor: '#7C3AED', dotColor: '#A78BFA', textColor: 'rgba(0,0,0,0.7)' },
  'openai/gpt-4o-mini': { barColor: 'rgba(110,231,183,0.4)', borderColor: '#059669', dotColor: '#6EE7B7', textColor: 'rgba(0,0,0,0.7)' },
};

const DEFAULT_MODEL_COLOR = { barColor: '#EEEDEA', borderColor: '#B8B8B0', dotColor: '#B8B8B0', textColor: '#111110' };

function getModelColor(model: string) {
  return MODEL_COLORS[model] ?? DEFAULT_MODEL_COLOR;
}

function getDisplayName(model: string) {
  const parts = model.split('/');
  return parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? model;
}

function fmt(n: number) {
  return n < 1 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}

export default function DashboardPage() {
  const { isPaid, canExportCsv, canUseLoopDetection } = usePlan();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('all');

  const apiUrl = `/api/analytics/overview?range=${timeRange}&agent=${selectedAgent}`;
  const { data, loading } = useAnalytics<OverviewData>(apiUrl, [timeRange, selectedAgent]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isEmpty = !loading && data && data.requestCount === 0;
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`${appUrl}/api/proxy/v1`);
  };

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
          {(isPaid
            ? [
                { key: 'today' as const, label: 'Today' },
                { key: 'week' as const, label: 'This week' },
                { key: 'month' as const, label: 'This month' },
              ]
            : [
                { key: 'today' as const, label: 'Today' },
              ]
          ).map((item) => (
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
      {isPaid && data && data.agentPerformance.length > 0 && (
        <motion.div variants={fadeUp} className="flex items-center gap-[8px] mb-[10px] overflow-x-auto pb-[4px] px-[4px] sm:px-0">
          <button
            onClick={() => setSelectedAgent('all')}
            className="shrink-0 h-[34px] flex items-center gap-[8px] px-[15px] transition-all cursor-pointer"
            style={{
              borderRadius: selectedAgent === 'all' ? '7px' : '8px',
              backgroundColor: selectedAgent === 'all' ? 'rgba(34,197,94,0.08)' : '#FFFFFF',
              border: selectedAgent === 'all' ? '1px solid #0C5526' : '1px solid #E2E1DC',
            }}
          >
            <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: '#22C55E' }} />
            <span className="text-[12.5px] leading-[1.15] text-[#111110] whitespace-nowrap" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              All agents
            </span>
          </button>
          {data.agentPerformance.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className="shrink-0 h-[34px] flex items-center gap-[8px] px-[15px] transition-all cursor-pointer"
              style={{
                borderRadius: selectedAgent === agent.id ? '7px' : '8px',
                backgroundColor: selectedAgent === agent.id ? 'rgba(34,197,94,0.08)' : '#FFFFFF',
                border: selectedAgent === agent.id ? '1px solid #0C5526' : '1px solid #E2E1DC',
              }}
            >
              <div
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ backgroundColor: agent.active ? '#22C55E' : '#B8B8B0' }}
              />
              <span className="text-[12.5px] leading-[1.15] text-[#111110] whitespace-nowrap" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                {agent.label}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Upgrade nudge (Starter only) ─────────────────────── */}
      {!isPaid && (
        <motion.div variants={fadeUp}>
          <Link
            href="/dashboard/upgrade?plan=pro"
            className="flex items-center justify-between bg-[#E2F3EA] border border-[#0C5526] rounded-[10px] px-[20px] py-[14px] mb-[10px] hover:bg-[#d4eddf] transition group"
          >
            <div className="flex items-center gap-[10px]">
              <span className="text-[13px] leading-[1.15] text-[#0C5526]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Unlock loop detection, unlimited requests, and 90-day analytics with Pro
              </span>
            </div>
            <span className="text-[13px] leading-[1.15] text-[#17803D] group-hover:underline shrink-0 ml-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              Upgrade →
            </span>
          </Link>
        </motion.div>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {isEmpty && (
        <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm mb-[7px]">
          <EmptyState
            icon="/images/dashboard/robot-01.svg"
            title="No requests yet"
            description="Point your agent at the ClawProxy endpoint and send your first request to see real-time stats."
            action={{ label: 'Copy proxy endpoint', onClick: handleCopyEndpoint }}
          />
        </motion.div>
      )}

      {/* ── Loading skeletons ──────────────────────────────── */}
      {loading && (
        <>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-5 gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[3px] mt-[3px]">
            <ChartSkeleton height={180} />
            <ChartSkeleton height={180} />
          </motion.div>
          <motion.div variants={fadeUp} className="mt-[3px]"><TableSkeleton rows={5} /></motion.div>
        </>
      )}

      {/* ── Real data ──────────────────────────────────── */}
      {data && !isEmpty && !loading && (
        <>
          {/* ── Stat cards row ──────────────────────────────────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-5 gap-[3px]">
            {/* Saved */}
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/money-04.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Saved {timeRange === 'today' ? 'today' : timeRange === 'week' ? 'this week' : 'this month'}</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{fmt(data.totalSaved)}</span>
              </div>
            </motion.div>

            {/* Actual spend */}
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/analytics-01.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Actual spend</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{fmt(data.totalSpend)}</span>
                {data.budgetUsage.dailyBudget && (
                  <span className="text-[11.5px] leading-[1.15] text-[#8F8F87] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {Math.round((data.budgetUsage.dailySpend / data.budgetUsage.dailyBudget) * 100)}% of ${data.budgetUsage.dailyBudget} daily limit
                  </span>
                )}
              </div>
            </motion.div>

            {/* Requests routed */}
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/zap.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Requests routed</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{data.requestCount.toLocaleString()}</span>
                {!isPaid && (
                  <span className="text-[11.5px] leading-[1.15] text-[#8F8F87] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {data.requestCount.toLocaleString()} of 10,000 limit
                  </span>
                )}
              </div>
            </motion.div>

            {/* Loops killed */}
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              {canUseLoopDetection ? (
                <>
                  <Image src="/images/dashboard/shield-energy.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
                  <div className="px-[21px] pt-[27px]">
                    <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Loops killed</span>
                    <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{data.loopsKilled}</span>
                    <span className="text-[11.5px] leading-[1.15] text-[#8F8F87] block mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      Saved ~{fmt(data.savingsBreakdown.loops)}
                    </span>
                  </div>
                </>
              ) : (
                <Link href="/dashboard/upgrade?plan=pro" className="block px-[21px] pt-[27px] h-full">
                  <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Loops killed</span>
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

            {/* Active agents */}
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/robot-01.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Active agents</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{data.activeAgents}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Cost comparison + How you're saving ─────────────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[3px] mt-[3px]">
            {/* Cost comparison chart */}
            <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
              <div className="flex items-center justify-between mb-[14px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
                  Cost comparison
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

              {data.dailyCostData.length > 0 ? (
                <>
                  <div className="relative" style={{ height: 180 }}>
                    <div className="absolute left-[40px] right-0 top-0 bottom-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-full h-px bg-[#EEEDE9]" />)}
                    </div>
                    <div className="absolute left-[40px] right-0 top-[6px] bottom-[6px] flex items-end gap-[4px]">
                      {data.dailyCostData.map((d, i) => {
                        const maxVal = Math.max(...data.dailyCostData.map((x) => Math.max(x.without, x.actual)), 1);
                        return (
                          <div
                            key={d.day}
                            className="flex-1 flex gap-[4px] items-end h-full relative group"
                            onMouseEnter={() => setHoveredBar(i)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {hoveredBar === i && (
                              <div className="absolute -top-[36px] left-1/2 -translate-x-1/2 bg-[#111110] text-white text-[10px] px-[8px] py-[4px] rounded-[4px] whitespace-nowrap z-10">
                                Without: {fmt(d.without)} · With: {fmt(d.actual)}
                              </div>
                            )}
                            <div className="flex-1 rounded-[2px] transition-all duration-200" style={{ height: `${(d.without / maxVal) * 100}%`, backgroundColor: hoveredBar === i ? '#D4D3CE' : '#EEEDEA' }} />
                            <div className="flex-1 rounded-[2px] transition-all duration-200" style={{ height: `${(d.actual / maxVal) * 100}%`, backgroundColor: hoveredBar === i ? '#0C5526' : 'rgba(23,128,61,0.51)' }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex mt-[6px]" style={{ paddingLeft: 40 }}>
                    {data.dailyCostData.map((d) => (
                      <div key={d.day} className="flex-1 text-center">
                        <span className="text-[10px] leading-[1.15] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 180 }}>
                  <span className="text-[12px] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>No data yet</span>
                </div>
              )}

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
                {[
                  { icon: '/images/dashboard/layers-01.svg', title: 'Model routing', desc: `${data.savingsBreakdown.routing > 0 ? 'Routing requests to cheaper models' : 'No routing savings yet'}`, amount: fmt(data.savingsBreakdown.routing) },
                  { icon: '/images/dashboard/repeat.svg', title: 'Loop prevention', desc: `${data.loopsKilled} loop${data.loopsKilled !== 1 ? 's' : ''} caught`, amount: fmt(data.savingsBreakdown.loops) },
                ].map((item, i) => (
                  <div key={item.title} className="flex items-start py-[15px]" style={{ borderBottom: i < 1 ? '1px solid #EEEDE9' : 'none' }}>
                    <Image src={item.icon} alt="" width={23} height={23} className="mt-[1px] shrink-0" />
                    <div className="ml-[15px] flex-1 min-w-0">
                      <span className="text-[13px] leading-[1.15] text-[#111110] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{item.title}</span>
                      <span className="text-[11px] leading-[1.15] text-[#8F8F87] block mt-[3px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{item.desc}</span>
                    </div>
                    <span className="text-[14px] leading-[1.15] text-[#17803D] shrink-0 ml-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Model distribution ──────────────── */}
          {data.modelDistribution.length > 0 && (
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-[3px] mt-[3px]">
              <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>
                  Model distribution
                </span>
                <div className="flex h-[36px] mt-[14px] rounded-[1px] overflow-hidden">
                  {data.modelDistribution.map((m, i) => {
                    const colors = getModelColor(m.name);
                    return (
                      <div key={m.name} className="flex items-center justify-center relative" style={{ width: `${m.pct}%`, backgroundColor: colors.barColor, borderRight: i < data.modelDistribution.length - 1 ? `1px solid ${colors.borderColor}` : 'none' }}>
                        {m.pct >= 15 && <span className="text-[10.5px] leading-[1.15]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: colors.textColor }}>{getDisplayName(m.name)} {m.pct}%</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-[14px] space-y-[7px]">
                  {data.modelDistribution.map((m) => {
                    const colors = getModelColor(m.name);
                    return (
                      <div key={m.name} className="flex items-center h-[30px] px-[13px] rounded-[6px] bg-[#FAFAF8] border border-[#EEEDE9]">
                        <div className="w-[10px] h-[10px] rounded-[3px] shrink-0" style={{ backgroundColor: colors.dotColor }} />
                        <span className="text-[12px] leading-[1.15] text-[#111110] ml-[16px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{getDisplayName(m.name)}</span>
                        <span className="text-[11px] leading-[1.15] text-[#8F8F87] ml-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{m.pct}%</span>
                        <span className="text-[11px] leading-[1.15] text-[#55554F] ml-auto" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(m.cost)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost by agent */}
              <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>Cost by agent</span>
                <div className="mt-[10px]">
                  {data.agentPerformance.slice(0, 5).map((a, i) => {
                    const maxSpend = Math.max(...data.agentPerformance.map((x) => x.spend), 1);
                    return (
                      <div
                        key={a.id}
                        className="flex items-center h-[34px] transition-colors"
                        style={{ borderBottom: i < Math.min(data.agentPerformance.length, 5) - 1 ? '1px solid #EEEDE9' : 'none', backgroundColor: hoveredSkill === i ? '#FAFAF8' : 'transparent' }}
                        onMouseEnter={() => setHoveredSkill(i)}
                        onMouseLeave={() => setHoveredSkill(null)}
                      >
                        <span className="text-[11px] leading-[1.15] text-[#B8B8B0] w-[14px] shrink-0" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>#{i + 1}</span>
                        <span className="text-[13px] leading-[1.15] text-[#111110] ml-[20px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{a.label}</span>
                        <div className="ml-auto flex items-center gap-[12px]">
                          <div className="w-[80px] h-[6px] rounded-[3px] bg-[#EEEDEA] overflow-hidden hidden sm:block">
                            <div className="h-full rounded-[3px]" style={{ width: `${(a.spend / maxSpend) * 100}%`, backgroundColor: 'rgba(37,99,235,0.62)', border: '1px solid #2563EB' }} />
                          </div>
                          <span className="text-[12px] leading-[1.15] text-[#111110] text-right w-[50px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(a.spend)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Request activity + Daily budget ──────────────────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[3px] mt-[3px]">
            {/* Request activity */}
            <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
              <div className="flex items-center justify-between mb-[12px]">
                <span className="text-[11px] leading-[1.3] text-[#8F8F87] uppercase font-semibold" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.064em' }}>
                  Request activity · 24 hours
                </span>
                <div className="flex items-center gap-[3px]">
                  <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#22C55E', opacity: 0.48 }} />
                  <span className="text-[11px] leading-[1.3] text-[#55554F]" style={{ fontFamily: 'DM Sans, sans-serif' }}> Live</span>
                </div>
              </div>
              <div className="relative" style={{ height: 189 }}>
                <svg className="w-full h-full" viewBox="0 0 707 189" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(13,148,136,0.2)" />
                      <stop offset="100%" stopColor="rgba(13,148,136,0)" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const heights = data.activityByHour.length > 0 ? data.activityByHour : new Array(24).fill(0);
                    const maxH = Math.max(...heights, 1);
                    const normalized = heights.map((h) => (h / maxH) * 100);
                    // Double resolution: interpolate to 48 points
                    const points48 = normalized.flatMap((v, i) => i < normalized.length - 1 ? [v, (v + normalized[i + 1]) / 2] : [v]);
                    return (
                      <>
                        <path
                          d={`M ${points48.map((h, i) => `${(i / (points48.length - 1)) * 707},${189 - (h / 100) * 170}`).join(' L ')} L 707,189 L 0,189 Z`}
                          fill="url(#activityGrad)"
                        />
                        <polyline
                          points={points48.map((h, i) => `${(i / (points48.length - 1)) * 707},${189 - (h / 100) * 170}`).join(' ')}
                          fill="none" stroke="#0D9488" strokeWidth="1.8"
                        />
                        <circle cx={707} cy={189 - (points48[points48.length - 1] / 100) * 170} r="3.5" fill="#0D9488" stroke="white" strokeWidth="1.8" />
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="flex justify-between mt-[4px]">
                {['12am', '4am', '8am', '12pm', '4pm', '8pm', 'Now'].map((t) => (
                  <span key={t} className="text-[9.5px] leading-[1.15] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Daily budget */}
            <div className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px]">
              <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>Daily budget</span>
              {data.budgetUsage.dailyBudget ? (
                <>
                  <div className="flex justify-center mt-[20px]">
                    <div className="relative" style={{ width: 140, height: 87.5 }}>
                      <svg viewBox="0 0 140 105" className="w-full h-full overflow-visible">
                        {(() => {
                          const pct = Math.min(data.budgetUsage.dailySpend / data.budgetUsage.dailyBudget, 1);
                          const startAngle = Math.PI;
                          const endAngle = startAngle + pct * Math.PI;
                          const r = 52.5;
                          const cx = 70;
                          const cy = 87.5;
                          const x1 = cx + r * Math.cos(startAngle);
                          const y1 = cy + r * Math.sin(startAngle);
                          const x2 = cx + r * Math.cos(endAngle);
                          const y2 = cy + r * Math.sin(endAngle);
                          const largeArc = pct > 0.5 ? 1 : 0;
                          return (
                            <>
                              <path d="M 17.5 87.5 A 52.5 52.5 0 1 1 122.5 87.5" fill="none" stroke="#EEEDEA" strokeWidth="10.5" strokeLinecap="round" />
                              {pct > 0 && <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke="#17803D" strokeWidth="10.5" strokeLinecap="round" />}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                  <div className="text-center mt-[12px]">
                    <span className="text-[28px] leading-[1.3] text-[#111110] font-bold block" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.036em' }}>{fmt(data.budgetUsage.dailySpend)}</span>
                    <span className="text-[11px] leading-[1.3] text-[#111110] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>of {fmt(data.budgetUsage.dailyBudget)} limit</span>
                  </div>
                  <div className="flex items-center justify-center mt-[14px] gap-0">
                    <div className="text-center">
                      <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Remaining</span>
                      <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fmt(Math.max(data.budgetUsage.dailyBudget - data.budgetUsage.dailySpend, 0))}</span>
                    </div>
                    <div className="w-px h-[32px] bg-[#E2E1DC] mx-[16px]" />
                    <div className="text-center">
                      <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Monthly</span>
                      <span className="text-[11px] leading-[1.3] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fmt(data.budgetUsage.monthlySpend)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center mt-[20px]">
                  <span className="text-[12px] text-[#B8B8B0] text-center" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>No daily budget set</span>
                  <Link href="/dashboard/settings" className="text-[12px] text-[#17803D] mt-[8px] hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Set budget →</Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Agent Performance ────────────────────────── */}
          {data.agentPerformance.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[9px] shadow-claw-sm mt-[3px] mb-[7px] overflow-hidden">
              <div className="flex items-center justify-between px-[23px] py-[18px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>Agent performance</span>
                <Link href="/dashboard/agents" className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>+ Add agent</Link>
              </div>
              <div className="hidden sm:grid h-[36px] items-center px-[20px]" style={{ gridTemplateColumns: '1fr 100px 80px 80px 80px 60px', borderBottom: '1px solid #EEEDE9' }}>
                {['Agent', 'Status', 'Spend', 'Saved', 'Requests', 'Loops'].map((h) => (
                  <span key={h} className="text-[10px] leading-[1.15] text-[#B8B8B0] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {data.agentPerformance.map((agent, i) => (
                <div key={agent.id}>
                  <div className="hidden sm:grid h-[44px] items-center px-[20px] hover:bg-[#FAFAF8] transition" style={{ gridTemplateColumns: '1fr 100px 80px 80px 80px 60px', borderBottom: i < data.agentPerformance.length - 1 ? '1px solid #EEEDE9' : 'none' }}>
                    <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.label}</span>
                    <div>
                      <span className="inline-flex items-center gap-[5px] h-[18px] px-[8px] rounded-[20px] text-[10px]" style={{ backgroundColor: agent.active ? '#E2F3EA' : '#EEEDEA', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}>
                        <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: agent.active ? '#22C55E' : '#B8B8B0' }} />
                        <span style={{ color: agent.active ? '#17803D' : '#B8B8B0' }}>{agent.active ? 'Active' : 'Idle'}</span>
                      </span>
                    </div>
                    <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(agent.spend)}</span>
                    <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(agent.saved)}</span>
                    <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.requests}</span>
                    <span className="text-[12.5px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.loops}</span>
                  </div>
                  <div className="sm:hidden px-[16px] py-[12px]" style={{ borderBottom: i < data.agentPerformance.length - 1 ? '1px solid #EEEDE9' : 'none' }}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.label}</span>
                      <span className="inline-flex items-center gap-[4px] h-[18px] px-[8px] rounded-[20px] text-[10px]" style={{ backgroundColor: agent.active ? '#E2F3EA' : '#EEEDEA', color: agent.active ? '#17803D' : '#B8B8B0', fontFamily: 'Aeonik Pro, sans-serif' }}>
                        <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: agent.active ? '#22C55E' : '#B8B8B0' }} />
                        {agent.active ? 'Active' : 'Idle'}
                      </span>
                    </div>
                    <div className="flex items-center gap-[16px] text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      <span>Spend: {fmt(agent.spend)}</span>
                      <span>Saved: {fmt(agent.saved)}</span>
                      <span>Req: {agent.requests}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
