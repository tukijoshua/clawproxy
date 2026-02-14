'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/lib/user-context';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

type Complexity = 'simple' | 'medium' | 'complex' | 'loop' | 'error' | 'budget';

interface FeedRow {
  id: string;
  time: string;
  complexity: Complexity;
  request: string;
  routeFrom: string;
  routeTo: string;
  tokens: string;
  cost: string;
  saved: string;
  agent?: string;
  errorMessage?: string;
}

interface RequestLog {
  id: string;
  model: string;
  requested_model: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  estimated_direct_cost: number;
  status: string;
  agent_label: string | null;
  error_message: string | null;
  created_at: string;
}

const badgeStyles: Record<Complexity, { bg: string; border: string; text: string }> = {
  simple:  { bg: '#DCEEE3', border: '#17803D', text: '#0D5428' },
  medium:  { bg: '#EBF2FF', border: '#2563EB', text: '#2563EB' },
  complex: { bg: '#FFF8E7', border: '#B8860B', text: '#B8860B' },
  loop:    { bg: '#FDECEA', border: '#DA0A16', text: '#C23A2D' },
  error:   { bg: '#FFF5F5', border: '#E53E3E', text: '#C53030' },
  budget:  { bg: '#FFFBF0', border: '#B8860B', text: '#B8860B' },
};

function getComplexity(log: RequestLog): Complexity {
  if (log.status === 'loop_killed') return 'loop';
  if (log.status === 'error') return 'error';
  if (log.status === 'budget_exceeded') return 'budget';
  if (log.total_tokens > 10000) return 'complex';
  if (log.total_tokens > 2000) return 'medium';
  return 'simple';
}

function getDisplayName(model: string) {
  const parts = model.split('/');
  return parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? model;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return 'now';
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h`;
}

function fmt(n: number) {
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(4)}`;
}

function mapLogToRow(log: RequestLog): FeedRow {
  const complexity = getComplexity(log);
  const saved = log.estimated_direct_cost - log.cost;
  const isFailed = log.status === 'loop_killed' || log.status === 'error' || log.status === 'budget_exceeded';
  const requestLabel = log.status === 'loop_killed'
    ? 'Loop detected'
    : log.status === 'error'
      ? (log.error_message ? truncate(log.error_message, 60) : 'Request failed')
      : log.status === 'budget_exceeded'
        ? 'Budget exceeded'
        : (log.agent_label ?? getDisplayName(log.model));
  return {
    id: log.id,
    time: timeAgo(log.created_at),
    complexity,
    request: requestLabel,
    routeFrom: log.requested_model ? getDisplayName(log.requested_model) : '',
    routeTo: getDisplayName(log.model),
    tokens: isFailed ? '—' : log.total_tokens.toLocaleString(),
    cost: isFailed ? '—' : fmt(log.cost),
    saved: !isFailed && saved > 0 ? `+${fmt(saved)}` : '—',
    agent: log.agent_label ?? undefined,
    errorMessage: log.error_message ?? undefined,
  };
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

export default function LiveFeedPage() {
  const { isPaid } = usePlan();
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('All agents');
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Array<{ name: string; dotColor: string }>>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/requests?limit=50');
      const json = await res.json();
      const logs: RequestLog[] = json.logs ?? [];
      const newRows = logs.map(mapLogToRow);
      setRows(newRows);

      // Extract unique agents
      const uniqueAgents = new Set<string>();
      for (const log of logs) {
        if (log.agent_label) uniqueAgents.add(log.agent_label);
      }
      setAgents([
        { name: 'All agents', dotColor: '#22C55E' },
        ...Array.from(uniqueAgents).map((name) => ({ name, dotColor: '#22C55E' })),
      ]);
    } catch {
      // Silently fail on polling errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredRows = selectedAgent === 'All agents'
    ? rows
    : rows.filter((r) => r.agent === selectedAgent);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-[10px] pt-[16px] mb-[12px] px-[4px] sm:px-0">
        <div
          className="w-[7px] h-[7px] rounded-[3.5px] animate-pulse"
          style={{ backgroundColor: '#10B981' }}
        />
        <h1
          className="text-[26px] leading-[1.08] text-[#111110]"
          style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
        >
          Live request feed
        </h1>
      </motion.div>

      {/* Agent filter bar */}
      {isPaid && agents.length > 1 && (
        <motion.div variants={fadeUp} className="flex items-center gap-[8px] mb-[16px] overflow-x-auto pb-[4px] px-[4px] sm:px-0">
          {agents.map((a) => {
            const isActive = selectedAgent === a.name;
            return (
              <button key={a.name} onClick={() => setSelectedAgent(a.name)} className="shrink-0 h-[30px] px-[14px] rounded-[20px] flex items-center gap-[7px] cursor-pointer transition-all text-[12px] leading-[1.15]" style={{ backgroundColor: isActive ? 'rgba(34,197,94,0.08)' : 'transparent', border: isActive ? '1px solid #0C5526' : '1px solid #E2E1DC', color: isActive ? '#111110' : '#8F8F87', fontFamily: 'Aeonik Pro, sans-serif' }}>
                <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: a.dotColor }} />
                {a.name}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Loading */}
      {loading && <motion.div variants={fadeUp}><TableSkeleton rows={8} /></motion.div>}

      {/* Empty state */}
      {!loading && rows.length === 0 && (
        <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] mb-[7px]">
          <EmptyState
            icon="/images/dashboard/zap.svg"
            title="Waiting for requests..."
            description="Send a request through the proxy endpoint and it will appear here in real time."
          />
        </motion.div>
      )}

      {/* Table */}
      {!loading && filteredRows.length > 0 && (
        <motion.div variants={fadeUp} ref={tableRef} className="bg-white border border-[#E4E3DE] rounded-[10px] overflow-hidden mb-[7px]">
          <div className="hidden sm:grid h-[32px] items-center bg-[#F0EFED]" style={{ gridTemplateColumns: '56px 80px 1fr 120px 200px 76px 76px 76px', borderBottom: '1px solid #E4E3DE' }}>
            {['Time', 'Request', '', 'Agent', 'Route', 'Tokens', 'Cost', 'Saved'].map((h, i) => (
              <span key={i} className="text-[10px] leading-[1.15] text-black uppercase px-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          <div className="max-h-[660px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredRows.map((row, i) => (
                <motion.div key={row.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                  <div className="hidden sm:grid h-[36px] items-center transition-colors" style={{ gridTemplateColumns: '56px 80px 1fr 120px 200px 76px 76px 76px', borderBottom: '1px solid #E4E3DE', backgroundColor: hoveredRow === i ? '#FAFAF8' : 'transparent' }}>
                    <span className="text-[10px] leading-[1.15] text-[#9C9C96] px-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.time}</span>
                    <div className="px-[12px]">
                      <span className="inline-flex items-center h-[17px] px-[9px] rounded-[2px] text-[10px] leading-[1.15]" style={{ backgroundColor: badgeStyles[row.complexity].bg, border: `1px solid ${badgeStyles[row.complexity].border}`, color: badgeStyles[row.complexity].text, fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}>{row.complexity}</span>
                    </div>
                    <span className="text-[12px] leading-[1.15] text-[#141413] px-[12px] truncate" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.request}</span>
                    <span className="text-[11px] leading-[1.15] text-[#8F8F87] px-[12px] truncate" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.agent}</span>
                    <div className="px-[12px] flex items-center gap-[2px]">
                      {row.complexity === 'loop' ? (
                        <span className="inline-flex items-center h-[17px] px-[8px] rounded-[20px] text-[10px] leading-[1.15]" style={{ backgroundColor: '#FDECEA', color: '#C23A2D', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}>blocked</span>
                      ) : row.complexity === 'error' ? (
                        <span className="inline-flex items-center h-[17px] px-[8px] rounded-[20px] text-[10px] leading-[1.15]" style={{ backgroundColor: '#FFF5F5', color: '#C53030', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}>failed</span>
                      ) : row.complexity === 'budget' ? (
                        <span className="inline-flex items-center h-[17px] px-[8px] rounded-[20px] text-[10px] leading-[1.15]" style={{ backgroundColor: '#FFFBF0', color: '#B8860B', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}>over budget</span>
                      ) : (
                        <>
                          {row.routeFrom && <span className="text-[10px] leading-[1.15] text-[#141413] opacity-50" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.routeFrom}</span>}
                          {row.routeFrom && <span className="text-[10px] leading-[1.15] text-[#157A3E] mx-[2px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>→</span>}
                          <span className="text-[10px] leading-[1.15] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.routeTo}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] leading-[1.15] text-[#141413] px-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.tokens}</span>
                    <span className="text-[11px] leading-[1.15] text-[#141413] px-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.cost}</span>
                    <span className="text-[11px] leading-[1.15] px-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: row.saved.startsWith('+') ? '#157A3E' : '#141413' }}>{row.saved}</span>
                  </div>
                  <div className="sm:hidden px-[12px] py-[10px]" style={{ borderBottom: '1px solid #E4E3DE' }}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[10px] text-[#9C9C96]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.time}</span>
                        <span className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px]" style={{ backgroundColor: badgeStyles[row.complexity].bg, border: `1px solid ${badgeStyles[row.complexity].border}`, color: badgeStyles[row.complexity].text, fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}>{row.complexity}</span>
                        {row.agent && <span className="text-[10px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.agent}</span>}
                      </div>
                      <span className="text-[11px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: row.saved.startsWith('+') ? '#157A3E' : '#141413' }}>{row.saved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.request}</span>
                      {row.complexity !== 'loop' && row.complexity !== 'error' && row.complexity !== 'budget' && <span className="text-[10px] text-[#9C9C96]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{row.routeFrom ? `${row.routeFrom} → ` : ''}{row.routeTo}</span>}
                      {row.complexity === 'error' && <span className="text-[10px] text-[#C53030]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>failed</span>}
                      {row.complexity === 'budget' && <span className="text-[10px] text-[#B8860B]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>over budget</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
