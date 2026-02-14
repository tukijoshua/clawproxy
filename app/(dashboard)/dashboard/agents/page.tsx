'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePlan } from '@/lib/user-context';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

type ConnectionStatus = 'connected' | 'idle' | 'disconnected' | 'revoked';

interface AgentData {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  connectionStatus: ConnectionStatus;
  spend: number;
  saved: number;
  requests: number;
  loops: number;
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; dotColor: string; bgColor: string; textColor: string; borderColor?: string }> = {
  connected: { label: 'Connected', dotColor: '#22C55E', bgColor: '#E2F3EA', textColor: '#17803D', borderColor: '#0C5526' },
  idle: { label: 'Idle', dotColor: '#EAB308', bgColor: '#FFF8E1', textColor: '#92750C' },
  disconnected: { label: 'Disconnected', dotColor: '#EF4444', bgColor: '#FFF5F5', textColor: '#DC2626' },
  revoked: { label: 'Revoked', dotColor: '#B8B8B0', bgColor: '#EEEDEA', textColor: '#B8B8B0' },
};

const agentColors = ['#17803D', '#2563EB', '#7C3AED', '#D97706', '#DC2626', '#0D9488', '#4F46E5', '#EA580C'];

function fmt(n: number) { return n < 1 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`; }

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentsPage() {
  const { maxAgents, agentCount, plan } = usePlan();
  const atLimit = agentCount >= maxAgents;
  const [modalStep, setModalStep] = useState<0 | 1 | 2>(0);
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#17803D');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [creating, setCreating] = useState(false);

  const { data, loading, refetch } = useAnalytics<{ agents: AgentData[] }>('/api/analytics/agents');
  const agents = data?.agents ?? [];

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAgent = useCallback(async () => {
    if (!newAgentName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newAgentName.trim() }),
      });
      const json = await res.json();
      if (json.key) {
        setGeneratedKey(json.key);
        setModalStep(2);
        refetch();
      }
    } finally {
      setCreating(false);
    }
  }, [newAgentName, creating, refetch]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between pt-[16px] mb-[16px] px-[4px] sm:px-0">
        <div>
          <h1 className="text-[26px] leading-[1.08] text-[#111110]" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}>Agents</h1>
          <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Each agent gets its own API key and per-agent tracking.</p>
        </div>
        {atLimit ? (
          <Link href={`/dashboard/upgrade?plan=${plan === 'starter' ? 'pro' : 'team'}`} className="h-[37px] px-[20px] rounded-[6px] text-[13px] text-white flex items-center justify-center hover:opacity-90 transition mt-[12px] sm:mt-[10px] shrink-0 gap-[6px]" style={{ backgroundColor: '#8F8F87', fontFamily: 'Aeonik Pro, sans-serif' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {plan === 'starter' ? 'Upgrade to Pro for up to 3 agents' : 'Upgrade to Team for unlimited agents'}
          </Link>
        ) : (
          <button onClick={() => setModalStep(1)} className="h-[37px] px-[20px] rounded-[6px] text-[13px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition mt-[12px] sm:mt-[10px] shrink-0" style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}>+ Add agent</button>
        )}
      </motion.div>

      {/* Loading */}
      {loading && <motion.div variants={fadeUp}><TableSkeleton rows={4} /></motion.div>}

      {/* Empty state */}
      {!loading && agents.length === 0 && (
        <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm mb-[7px]">
          <EmptyState
            icon="/images/dashboard/robot-01.svg"
            title="Create your first agent"
            description="Each agent gets its own API key for separate tracking and budget controls."
            action={!atLimit ? { label: '+ Add agent', onClick: () => setModalStep(1) } : undefined}
          />
        </motion.div>
      )}

      {/* Agents list */}
      {!loading && agents.length > 0 && (
        <>
          {/* Search bar */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-[10px] h-[40px] px-[22px] rounded-[8px] mb-[7px]" style={{ backgroundColor: 'rgba(255,255,255,0.64)', border: '1px solid #CBCBCB' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="text" placeholder="Search for agents" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-[14px] text-[#000000] outline-none placeholder:text-black/50" style={{ fontFamily: 'Aeonik Pro, sans-serif' }} />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-[3px] mb-[7px]">
            {filteredAgents.map((agent, i) => {
              const color = agentColors[i % agentColors.length];
              const status = STATUS_CONFIG[agent.connectionStatus];
              const idleTimeLabel = agent.connectionStatus === 'idle' && agent.lastUsedAt ? ` · ${timeAgo(agent.lastUsedAt)}` : '';
              const isDisconnected = agent.connectionStatus === 'disconnected';
              return (
                <div key={agent.id} className="bg-white border border-[#E2E1DC] rounded-[12px] px-[25px] py-[21px] flex flex-col sm:flex-row sm:items-center gap-[12px] sm:gap-0">
                  <div className="flex items-center gap-[16px] sm:flex-1 min-w-0">
                    <div className="w-[40px] h-[40px] rounded-[2px] shrink-0" style={{ backgroundColor: `${color}33`, border: `1px solid ${color}` }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[15px] text-[#111110] truncate" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.name}</span>
                        <span className="shrink-0 inline-flex items-center gap-[5px] h-[18px] px-[8px] rounded-[20px] text-[10px]" style={{ backgroundColor: status.bgColor, border: status.borderColor ? `1px solid ${status.borderColor}` : 'none', color: status.textColor, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, letterSpacing: '0.03em' }}>
                          <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: status.dotColor }} />
                          {status.label}{idleTimeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-[6px] mt-[3px]">
                        <span className="text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.keyPrefix}...</span>
                        <span className="text-[12px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>· {timeAgo(agent.lastUsedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-[24px] sm:gap-[32px] shrink-0">
                    {isDisconnected ? (
                      <Link href="/onboarding/setup?reconnect=1" className="h-[32px] px-[16px] rounded-[6px] text-[12px] text-white flex items-center justify-center gap-[6px] hover:opacity-90 transition shrink-0" style={{ backgroundColor: '#DC2626', fontFamily: 'Aeonik Pro, sans-serif' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        Reconfigure
                      </Link>
                    ) : (
                      <>
                        <div className="text-right">
                          <span className="text-[14px] text-[#17803D] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(agent.saved)}</span>
                          <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>saved today</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] text-[#111110] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{fmt(agent.spend)}</span>
                          <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>spent today</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] text-[#111110] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.requests}</span>
                          <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>requests</span>
                        </div>
                        {agent.loops > 0 && (
                          <div className="text-right">
                            <span className="text-[14px] text-[#D93025] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{agent.loops}</span>
                            <span className="text-[10.5px] text-[#B8B8B0] block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>loops killed</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalStep > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-[16px]" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} onClick={() => { setModalStep(0); setNewAgentName(''); setCopied(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const }} className="bg-white rounded-[16px] w-full overflow-y-auto" style={{ maxWidth: 520, maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
              {modalStep === 1 && (
                <div className="px-[28px] py-[24px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[24px] leading-[1.08] text-[#111110]" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.021em' }}>Add an agent</h2>
                      <p className="text-[13.5px] leading-[1.5] text-[#55554F] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Give this agent a name so you can track its costs separately.</p>
                    </div>
                    <button onClick={() => { setModalStep(0); setNewAgentName(''); }} className="w-[32px] h-[32px] rounded-[8px] border border-[#E2E1DC] flex items-center justify-center text-[#8F8F87] hover:bg-[#F5F5F3] transition shrink-0 ml-[12px]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13" /></svg>
                    </button>
                  </div>
                  <label className="text-[12px] text-[#55554F] block mt-[24px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Agent name</label>
                  <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="w-full h-[42px] mt-[4px] px-[15px] rounded-[6px] border border-[#E2E1DC] text-[14px] text-black outline-none focus:border-[#17803D] transition" style={{ fontFamily: 'Aeonik Pro, sans-serif' }} placeholder="" />
                  <span className="text-[11.5px] text-[#B8B8B0] block mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>This is just a label for your dashboard — your agent won&apos;t see it.</span>
                  <label className="text-[12px] text-[#55554F] block mt-[20px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Color</label>
                  <div className="flex gap-[8px] mt-[6px]">
                    {agentColors.map((c) => (
                      <button key={c} onClick={() => setSelectedColor(c)} className="w-[32px] h-[32px] rounded-[5px] flex items-center justify-center transition-all cursor-pointer" style={{ backgroundColor: selectedColor === c ? `${c}4D` : c, border: `2px solid ${selectedColor === c ? c : 'transparent'}`, boxShadow: selectedColor === c ? '0px 0px 0px 2px white' : 'none' }}>
                        {selectedColor === c && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 4 5.5 9.5 3 7" /></svg>}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-[8px] mt-[36px]">
                    <button onClick={() => { setModalStep(0); setNewAgentName(''); }} className="h-[37px] px-[12px] rounded-[6px] text-[13px] text-[#8F8F87] cursor-pointer hover:bg-[#F5F5F3] transition" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Cancel</button>
                    <button onClick={handleCreateAgent} disabled={!newAgentName.trim() || creating} className="h-[37px] px-[20px] rounded-[6px] text-[13px] text-white cursor-pointer hover:opacity-90 transition disabled:opacity-50" style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}>
                      {creating ? 'Creating...' : 'Create agent →'}
                    </button>
                  </div>
                </div>
              )}
              {modalStep === 2 && (
                <div className="px-[28px] py-[24px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[24px] leading-[1.08] text-[#111110]" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.021em' }}>Your agent&apos;s API key</h2>
                      <p className="text-[13.5px] leading-[1.5] text-[#55554F] mt-[8px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Paste this key into this agent&apos;s config.</p>
                    </div>
                    <button onClick={() => { setModalStep(0); setCopied(false); }} className="w-[32px] h-[32px] rounded-[8px] border border-[#E2E1DC] flex items-center justify-center text-[#8F8F87] hover:bg-[#F5F5F3] transition shrink-0 ml-[12px]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13" /></svg>
                    </button>
                  </div>
                  <div className="mt-[16px] rounded-[5px] px-[20px] py-[16px] flex items-start justify-between gap-[12px]" style={{ backgroundColor: '#383838' }}>
                    <span className="text-[13px] leading-[1.32] text-white break-all" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.023em' }}>{generatedKey}</span>
                    <button onClick={handleCopyKey} className="shrink-0 text-white/70 hover:text-white transition mt-[2px]">
                      {copied ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>}
                    </button>
                  </div>
                  <div className="mt-[16px] flex items-center gap-[12px] px-[15px] py-[14px] rounded-[6px]" style={{ backgroundColor: '#FDF6E3', border: '1px solid #E8D5A0' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    <span className="text-[12.5px] leading-[1.15] text-[#B8860B]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Save this now. You won&apos;t see the full key again — only the prefix.</span>
                  </div>
                  <div className="mt-[16px] rounded-[8px] px-[21px] py-[17px]" style={{ backgroundColor: '#FAFAF8', border: '1px solid #EEEDE9' }}>
                    <span className="text-[12px] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.042em' }}>Quick setup</span>
                    <div className="mt-[14px] rounded-[4px] px-[16px] py-[14px]" style={{ backgroundColor: '#383838' }}>
                      <pre className="text-[12px] leading-[1.5] text-white whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
{`OPENAI_API_KEY=${generatedKey}
OPENAI_BASE_URL=${appUrl}/api/proxy/v1`}
                      </pre>
                    </div>
                  </div>
                  <button onClick={() => { setModalStep(0); setCopied(false); setNewAgentName(''); }} className="w-full h-[43px] rounded-[6px] text-[13px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition mt-[20px]" style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}>I&apos;ve saved the key — done</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
