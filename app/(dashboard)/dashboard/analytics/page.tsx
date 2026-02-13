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

type TimeRange = 'month' | 'last' | '90d';

interface AnalyticsData {
  totalSaved: number;
  totalSpend: number;
  requestCount: number;
  loopsKilled: number;
  modelDistribution: Array<{ name: string; pct: number; cost: number; requests: number }>;
  dailyCostData: Array<{ day: string; actual: number; without: number }>;
  agentPerformance: Array<{ id: string; label: string; spend: number; saved: number; requests: number; loops: number; active: boolean }>;
}

const MODEL_COLORS: Record<string, { barColor: string; borderColor: string; dotColor: string; textColor: string }> = {
  'google/gemini-2.0-flash-lite-001': { barColor: 'rgba(23,128,61,0.25)', borderColor: '#000000', dotColor: '#6EE7B7', textColor: '#000000' },
  'anthropic/claude-haiku-4-5': { barColor: 'rgba(147,197,253,0.53)', borderColor: '#4793E9', dotColor: '#93C5FD', textColor: 'rgba(0,0,0,0.7)' },
  'anthropic/claude-3.5-haiku': { barColor: 'rgba(147,197,253,0.53)', borderColor: '#4793E9', dotColor: '#93C5FD', textColor: 'rgba(0,0,0,0.7)' },
  'anthropic/claude-sonnet-4-5': { barColor: 'rgba(252,211,77,0.42)', borderColor: '#EB9327', dotColor: '#FCD34D', textColor: 'rgba(0,0,0,0.7)' },
  'anthropic/claude-opus-4-6': { barColor: 'rgba(249,168,212,0.59)', borderColor: '#EF69B2', dotColor: '#F9A8D4', textColor: '#111110' },
  'openai/gpt-4o': { barColor: 'rgba(167,139,250,0.4)', borderColor: '#7C3AED', dotColor: '#A78BFA', textColor: 'rgba(0,0,0,0.7)' },
  'openai/gpt-4o-mini': { barColor: 'rgba(110,231,183,0.4)', borderColor: '#059669', dotColor: '#6EE7B7', textColor: 'rgba(0,0,0,0.7)' },
};
const DEFAULT_COLOR = { barColor: '#EEEDEA', borderColor: '#B8B8B0', dotColor: '#B8B8B0', textColor: '#111110' };
function getColor(m: string) { return MODEL_COLORS[m] ?? DEFAULT_COLOR; }
function getName(m: string) { return m.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? m; }
function fmt(n: number) { return n < 1 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`; }

export default function AnalyticsPage() {
  const { canExportCsv, isPaid } = usePlan();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('all');

  const apiUrl = `/api/analytics/overview?range=${timeRange}&agent=${selectedAgent}`;
  const { data, loading } = useAnalytics<AnalyticsData>(apiUrl, [timeRange, selectedAgent]);

  const timeRangeOptions = isPaid
    ? [
        { key: 'month' as const, label: 'This month' },
        { key: 'last' as const, label: 'Last month' },
        { key: '90d' as const, label: 'Last 90 days' },
      ]
    : [{ key: 'month' as const, label: 'This month' }];

  const isEmpty = !loading && data && data.requestCount === 0;
  const avgCostPerRequest = data && data.requestCount > 0 ? data.totalSpend / data.requestCount : 0;
  const directCost = data ? data.totalSpend + data.totalSaved : 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-[12px] px-[4px] sm:px-0">
        <div className="pt-[16px]">
          <h1 className="text-[26px] leading-[1.08] text-[#111110]" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}>
            Analytics
          </h1>
          <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-[8px] mt-[12px] sm:mt-[7px]">
          {timeRangeOptions.map((item) => (
            <button key={item.key} onClick={() => setTimeRange(item.key)} className="h-[30px] rounded-[6px] flex items-center justify-center cursor-pointer transition-all" style={{ padding: '0 15px', backgroundColor: timeRange === item.key ? '#111110' : '#FFFFFF', border: timeRange === item.key ? '1px solid #111110' : '1px solid #E2E1DC', fontFamily: 'Arial, sans-serif' }}>
              <span className="text-[12px] leading-[1.15]" style={{ color: timeRange === item.key ? '#FFFFFF' : '#55554F' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Agent filter bar */}
      {isPaid && data && data.agentPerformance.length > 0 && (
        <motion.div variants={fadeUp} className="flex items-center gap-[8px] mb-[16px] overflow-x-auto pb-[4px] px-[4px] sm:px-0">
          {[{ id: 'all', label: 'All agents', dotColor: '#22C55E' }, ...data.agentPerformance.map(a => ({ id: a.id, label: a.label, dotColor: a.active ? '#22C55E' : '#B8B8B0' }))].map((a) => (
            <button key={a.id} onClick={() => setSelectedAgent(a.id)} className="shrink-0 h-[30px] px-[14px] rounded-[20px] flex items-center gap-[7px] cursor-pointer transition-all text-[12px] leading-[1.15]" style={{ backgroundColor: selectedAgent === a.id ? 'rgba(34,197,94,0.08)' : 'transparent', border: selectedAgent === a.id ? '1px solid #0C5526' : '1px solid #E2E1DC', color: selectedAgent === a.id ? '#111110' : '#8F8F87', fontFamily: 'Aeonik Pro, sans-serif' }}>
              <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: a.dotColor }} />
              {a.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm mb-[7px]">
          <EmptyState icon="/images/dashboard/analytics-01.svg" title="No analytics data yet" description="Send some requests through the proxy to see analytics here." />
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-[3px]">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-[3px]"><ChartSkeleton height={200} /></motion.div>
          <motion.div variants={fadeUp} className="mt-[3px]"><ChartSkeleton height={200} /></motion.div>
          <motion.div variants={fadeUp} className="mt-[3px] mb-[7px]"><TableSkeleton rows={5} /></motion.div>
        </>
      )}

      {data && !isEmpty && !loading && (
        <>
          {/* Stat cards */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-[3px]">
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/money-04.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Total savings</span>
                <span className="text-[30px] leading-[1] text-[#17803D] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{fmt(data.totalSaved)}</span>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/analytics-01.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Total spend</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{fmt(data.totalSpend)}</span>
                <div className="flex items-center gap-[6px] mt-[8px]">
                  <span className="text-[11.5px] leading-[1.15] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>would be {fmt(directCost)}</span>
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/zap.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Requests</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{data.requestCount.toLocaleString()}</span>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm relative overflow-hidden" style={{ height: 135 }}>
              <Image src="/images/dashboard/analytics-01.svg" alt="" width={36} height={36} className="absolute right-[21px] top-[17px]" />
              <div className="px-[21px] pt-[27px]">
                <span className="text-[12px] leading-[1.15] text-[#8F8F87] block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.008em' }}>Avg cost/request</span>
                <span className="text-[30px] leading-[1] text-[#111110] block mt-[18px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '-0.04em' }}>{fmt(avgCostPerRequest)}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Model distribution */}
          {data.modelDistribution.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] mt-[3px]">
              <div className="flex items-center justify-between mb-[14px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>Model distribution</span>
              </div>
              <div className="flex h-[42px] rounded-[1px] overflow-hidden">
                {data.modelDistribution.map((m, i) => {
                  const c = getColor(m.name);
                  return (
                    <div key={m.name} className="flex items-center justify-center" style={{ width: `${m.pct}%`, backgroundColor: c.barColor, borderRight: i < data.modelDistribution.length - 1 ? `1px solid ${c.borderColor}` : 'none' }}>
                      {m.pct >= 15 && <span className={`text-[11.5px] leading-[1.15]`} style={{ fontFamily: 'Aeonik Pro, sans-serif', color: c.textColor }}>{getName(m.name)} {m.pct}%</span>}
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-[8px] mt-[14px]">
                {data.modelDistribution.map((m) => {
                  const c = getColor(m.name);
                  return (
                    <div key={m.name} className="bg-[#FAFAF8] border border-[#EEEDE9] rounded-[8px] p-[14px]">
                      <div className="flex items-center gap-[8px] mb-[10px]">
                        <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: c.dotColor }} />
                        <span className="text-[13px] leading-[1.15] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{getName(m.name)}</span>
                      </div>
                      <div className="flex justify-between">
                        <div><span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Requests</span><span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{m.requests.toLocaleString()}</span></div>
                        <div><span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Cost</span><span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fmt(m.cost)}</span></div>
                        <div><span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>Share</span><span className="text-[10px] text-[#8F8F87] block" style={{ fontFamily: 'DM Sans, sans-serif' }}>{m.pct}%</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Daily cost chart */}
          {data.dailyCostData.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] mt-[3px]">
              <div className="flex items-center justify-between mb-[14px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>Daily cost</span>
                {canExportCsv ? (
                  <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Download report &rarr;</span>
                ) : (
                  <Link href="/dashboard/upgrade?plan=pro" className="flex items-center gap-[4px] text-[11.5px] leading-[1.15] text-[#8F8F87] hover:text-[#55554F] transition" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Pro
                  </Link>
                )}
              </div>
              <div className="relative" style={{ height: 200 }}>
                <svg className="w-full h-full" viewBox="0 0 900 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="withoutGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(208,207,202,0.12)" /><stop offset="100%" stopColor="rgba(208,207,202,0)" /></linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(23,128,61,0.12)" /><stop offset="100%" stopColor="rgba(23,128,61,0)" /></linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={i * 66} x2="900" y2={i * 66} stroke="#EEEDE9" strokeWidth="0.89" />)}
                  {(() => {
                    const maxVal = Math.max(...data.dailyCostData.map(d => Math.max(d.without, d.actual)), 1);
                    return (
                      <>
                        <path d={`M ${data.dailyCostData.map((d, i) => `${(i / (data.dailyCostData.length - 1)) * 900},${200 - (d.without / maxVal) * 180}`).join(' L ')} L 900,200 L 0,200 Z`} fill="url(#withoutGrad)" />
                        <polyline points={data.dailyCostData.map((d, i) => `${(i / (data.dailyCostData.length - 1)) * 900},${200 - (d.without / maxVal) * 180}`).join(' ')} fill="none" stroke="#D0CFCA" strokeWidth="1" strokeDasharray="3.56 2.67" />
                        <path d={`M ${data.dailyCostData.map((d, i) => `${(i / (data.dailyCostData.length - 1)) * 900},${200 - (d.actual / maxVal) * 180}`).join(' L ')} L 900,200 L 0,200 Z`} fill="url(#actualGrad)" />
                        <polyline points={data.dailyCostData.map((d, i) => `${(i / (data.dailyCostData.length - 1)) * 900},${200 - (d.actual / maxVal) * 180}`).join(' ')} fill="none" stroke="#17803D" strokeWidth="1.78" />
                        {data.dailyCostData.map((d, i) => <circle key={i} cx={(i / (data.dailyCostData.length - 1)) * 900} cy={200 - (d.actual / maxVal) * 180} r="3.5" fill="#17803D" stroke="white" strokeWidth="1.8" />)}
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="flex justify-between mt-[4px]">
                {data.dailyCostData.map((d) => <span key={d.day} className="text-[9px] text-[#B8B8B0]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{d.day}</span>)}
              </div>
              <div className="flex items-center gap-[16px] mt-[10px]">
                <div className="flex items-center gap-[6px]"><div className="w-[10px] h-[3px] rounded-[2px] bg-[#17803D]" /><span className="text-[12px] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Actual cost</span></div>
                <div className="flex items-center gap-[6px]"><div className="w-[10px] h-[3px] rounded-[2px] bg-[#D0CFCA]" /><span className="text-[12px] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Without ClawProxy (est)</span></div>
              </div>
            </motion.div>
          )}

          {/* Agent cost table */}
          {data.agentPerformance.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] mt-[3px] mb-[7px]">
              <div className="flex items-center justify-between mb-[14px]">
                <span className="text-[11px] leading-[1.15] text-[#8F8F87] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.064em' }}>Agents ranked by cost</span>
                {canExportCsv && <span className="text-[11.5px] leading-[1.15] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Export &rarr;</span>}
              </div>
              <div className="hidden sm:grid items-center h-[32px]" style={{ gridTemplateColumns: '30px 1fr 100px 80px 80px 40px', borderBottom: '1px solid #EEEDE9' }}>
                {['#', 'Agent', 'Requests', 'Cost', 'Saved', ''].map((h) => <span key={h} className="text-[10px] leading-[1.15] text-[#B8B8B0] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.06em' }}>{h}</span>)}
              </div>
              {data.agentPerformance.map((a, i) => {
                const maxSpend = Math.max(...data.agentPerformance.map(x => x.spend), 1);
                return (
                  <div key={a.id} className="hidden sm:grid items-center h-[44px] transition-colors" style={{ gridTemplateColumns: '30px 1fr 100px 80px 80px 40px', borderBottom: i < data.agentPerformance.length - 1 ? '1px solid #EEEDE9' : 'none', backgroundColor: hoveredSkill === i ? '#FAFAF8' : 'transparent' }} onMouseEnter={() => setHoveredSkill(i)} onMouseLeave={() => setHoveredSkill(null)}>
                    <span className="text-[11px] text-[#B8B8B0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{i + 1}</span>
                    <div className="flex items-center gap-[12px]">
                      <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{a.label}</span>
                      <div className="w-[50px] h-[6px] rounded-[3px] bg-[#EEEDEA] overflow-hidden">
                        <div className="h-full rounded-[3px]" style={{ width: `${(a.spend / maxSpend) * 100}%`, backgroundColor: 'rgba(37,99,235,0.62)', border: '1px solid #2563EB' }} />
                      </div>
                    </div>
                    <span className="text-[12px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{a.requests.toLocaleString()}</span>
                    <span className="text-[12px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(a.spend)}</span>
                    <span className="text-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: a.saved > 0 ? '#17803D' : '#111110' }}>{a.saved > 0 ? `+${fmt(a.saved)}` : fmt(a.saved)}</span>
                    <span />
                  </div>
                );
              })}
              {data.agentPerformance.map((a, i) => (
                <div key={`m-${a.id}`} className="sm:hidden py-[10px]" style={{ borderBottom: '1px solid #EEEDE9' }}>
                  <div className="flex items-center justify-between mb-[4px]">
                    <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>#{i + 1} {a.label}</span>
                  </div>
                  <div className="flex items-center gap-[12px] text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    <span>{fmt(a.spend)}</span>
                    <span>{a.requests} req</span>
                    <span style={{ color: a.saved > 0 ? '#17803D' : '#8F8F87' }}>{a.saved > 0 ? `+${fmt(a.saved)}` : '—'}</span>
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
