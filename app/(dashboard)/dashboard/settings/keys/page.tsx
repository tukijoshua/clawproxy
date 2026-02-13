'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

interface KeyInfo {
  id: string;
  key_prefix: string;
  label: string;
  scope: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

const SCOPES = [
  { value: 'full', label: 'Full Access' },
  { value: 'proxy_only', label: 'Proxy Only' },
  { value: 'read_only', label: 'Read Only' },
];

const SCOPE_COLORS: Record<string, { bg: string; text: string }> = {
  full: { bg: '#E2F3EA', text: '#17803D' },
  proxy_only: { bg: '#EFF6FF', text: '#2563EB' },
  read_only: { bg: '#F0EFED', text: '#55554F' },
};

export default function KeysPage() {
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLabel, setFormLabel] = useState('');
  const [formScope, setFormScope] = useState('full');
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [error, setError] = useState('');

  const fetchKeys = useCallback(async () => {
    const res = await fetch('/api/keys');
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    setCreating(true);
    setError('');

    const res = await fetch('/api/keys/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: formLabel || 'Default Agent', scope: formScope }),
    });

    if (res.ok) {
      const data = await res.json();
      setRevealedKey(data.key);
      setShowModal(false);
      setFormLabel('');
      setFormScope('full');
      fetchKeys();
    } else {
      const data = await res.json();
      setError(data.message || data.error || 'Failed to create key');
    }
    setCreating(false);
  };

  const handleCopy = async () => {
    if (revealedKey) {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggle = async (key: KeyInfo) => {
    await fetch(`/api/keys/${key.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !key.is_active }),
    });
    fetchKeys();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    fetchKeys();
  };

  const handleEditSave = async (id: string) => {
    await fetch(`/api/keys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: editLabel }),
    });
    setEditingId(null);
    fetchKeys();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-[16px] px-[4px] sm:px-0">
        <div className="pt-[16px]">
          <h1
            className="text-[26px] leading-[1.08] text-[#111110]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
          >
            API Keys
          </h1>
          <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Manage your ClawProxy API keys
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-[12px] sm:mt-[7px] h-[34px] px-[18px] rounded-[6px] bg-[#17803D] text-white text-[13px] hover:bg-[#14702f] transition cursor-pointer"
          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          + Create key
        </button>
      </motion.div>

      {/* One-time key reveal banner */}
      {revealedKey && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-[12px] bg-[#FFFBEB] border border-[#F59E0B] rounded-[10px] px-[20px] py-[16px]"
        >
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-[13px] font-semibold text-[#92400E]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              Your new API key — copy it now, it won&apos;t be shown again
            </span>
            <button
              onClick={() => setRevealedKey(null)}
              className="text-[12px] text-[#92400E] hover:underline cursor-pointer"
              style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
            >
              Dismiss
            </button>
          </div>
          <div className="flex items-center gap-[10px]">
            <code
              className="flex-1 bg-white border border-[#E2E1DC] rounded-[6px] px-[14px] py-[10px] text-[13px] text-[#111110] break-all"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {revealedKey}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 h-[38px] px-[16px] rounded-[6px] border border-[#E2E1DC] text-[13px] text-[#55554F] hover:bg-[#FAFAF8] transition cursor-pointer"
              style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Keys list */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm overflow-hidden">
        {/* Table header */}
        <div
          className="hidden sm:grid h-[36px] items-center px-[20px]"
          style={{
            gridTemplateColumns: '140px 1fr 100px 80px 100px 100px 80px',
            borderBottom: '1px solid #EEEDE9',
          }}
        >
          {['Key', 'Label', 'Scope', 'Status', 'Last Used', 'Created', ''].map((h) => (
            <span
              key={h}
              className="text-[10px] leading-[1.15] text-[#B8B8B0] uppercase"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.06em' }}
            >
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[40px]">
            <span className="text-[13px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Loading...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[40px]">
            <span className="text-[13px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>No API keys yet</span>
            <button
              onClick={() => setShowModal(true)}
              className="mt-[8px] text-[13px] text-[#17803D] hover:underline cursor-pointer"
              style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
            >
              Create your first key →
            </button>
          </div>
        ) : (
          keys.map((key, i) => (
            <div key={key.id}>
              {/* Desktop row */}
              <div
                className="hidden sm:grid h-[48px] items-center px-[20px] hover:bg-[#FAFAF8] transition"
                style={{
                  gridTemplateColumns: '140px 1fr 100px 80px 100px 100px 80px',
                  borderBottom: i < keys.length - 1 ? '1px solid #EEEDE9' : 'none',
                }}
              >
                <span className="text-[12px] text-[#8F8F87]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {key.key_prefix}••••••
                </span>
                {editingId === key.id ? (
                  <div className="flex items-center gap-[4px]">
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave(key.id)}
                      className="h-[28px] border border-[#E2E1DC] rounded-[4px] px-[8px] text-[13px] text-[#111110] outline-none focus:border-[#17803D]"
                      autoFocus
                    />
                    <button onClick={() => handleEditSave(key.id)} className="text-[11px] text-[#17803D] hover:underline cursor-pointer">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-[11px] text-[#8F8F87] hover:underline cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <span
                    className="text-[13px] text-[#111110] cursor-pointer hover:underline"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                    onClick={() => { setEditingId(key.id); setEditLabel(key.label); }}
                  >
                    {key.label}
                  </span>
                )}
                <span
                  className="inline-flex items-center h-[20px] px-[8px] rounded-[4px] text-[10px] uppercase w-fit"
                  style={{
                    backgroundColor: (SCOPE_COLORS[key.scope] || SCOPE_COLORS.full).bg,
                    color: (SCOPE_COLORS[key.scope] || SCOPE_COLORS.full).text,
                    fontFamily: 'Aeonik Pro, sans-serif',
                    letterSpacing: '0.03em',
                  }}
                >
                  {key.scope.replace('_', ' ')}
                </span>
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: 'Aeonik Pro, sans-serif',
                    color: key.is_active ? '#17803D' : '#D93025',
                  }}
                >
                  {key.is_active ? 'Active' : 'Revoked'}
                </span>
                <span className="text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                </span>
                <span className="text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {formatDate(key.created_at)}
                </span>
                <div className="flex items-center gap-[6px]">
                  <button
                    onClick={() => handleToggle(key)}
                    className="text-[11px] hover:underline cursor-pointer"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif', color: key.is_active ? '#D93025' : '#17803D' }}
                  >
                    {key.is_active ? 'Revoke' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="text-[11px] text-[#B8B8B0] hover:text-[#D93025] transition cursor-pointer"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Mobile row */}
              <div
                className="sm:hidden px-[16px] py-[12px]"
                style={{ borderBottom: i < keys.length - 1 ? '1px solid #EEEDE9' : 'none' }}
              >
                <div className="flex items-center justify-between mb-[4px]">
                  <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{key.label}</span>
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif', color: key.is_active ? '#17803D' : '#D93025' }}
                  >
                    {key.is_active ? 'Active' : 'Revoked'}
                  </span>
                </div>
                <div className="flex items-center gap-[8px] text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>{key.key_prefix}••••</code>
                  <span className="px-[6px] py-[2px] rounded-[3px] text-[10px] uppercase" style={{ backgroundColor: (SCOPE_COLORS[key.scope] || SCOPE_COLORS.full).bg, color: (SCOPE_COLORS[key.scope] || SCOPE_COLORS.full).text }}>
                    {key.scope.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-[12px] mt-[6px]">
                  <button
                    onClick={() => handleToggle(key)}
                    className="text-[11px] hover:underline cursor-pointer"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif', color: key.is_active ? '#D93025' : '#17803D' }}
                  >
                    {key.is_active ? 'Revoke' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="text-[11px] text-[#B8B8B0] hover:text-[#D93025] transition cursor-pointer"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Create Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-[16px]">
          <div className="bg-white rounded-[14px] border border-[#E2E1DC] w-full max-w-[420px] p-[28px]">
            <h2
              className="text-[20px] leading-[1.15] text-[#111110] mb-[20px]"
              style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
            >
              Create API Key
            </h2>

            {error && (
              <div className="mb-[16px] p-[12px] bg-red-50 border border-red-200 rounded-[8px]">
                <p className="text-red-600 text-[13px]">{error}</p>
              </div>
            )}

            <div className="space-y-[14px]">
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Label</label>
                <input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Main Dev Agent"
                  className="w-full h-[40px] bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] text-[14px] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Scope</label>
                <select
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                  className="w-full h-[40px] bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] text-[14px] text-[#111110] outline-none focus:border-[#17803D] transition"
                >
                  {SCOPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-[10px] mt-[24px]">
              <button
                onClick={() => { setShowModal(false); setError(''); }}
                className="h-[38px] px-[20px] rounded-[6px] border border-[#E2E1DC] text-[13px] text-[#55554F] hover:bg-[#FAFAF8] transition cursor-pointer"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="h-[38px] px-[20px] rounded-[6px] bg-[#17803D] text-white text-[13px] hover:bg-[#14702f] transition disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                {creating ? 'Creating...' : 'Create key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
