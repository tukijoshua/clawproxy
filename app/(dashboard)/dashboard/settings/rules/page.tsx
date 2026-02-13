'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePlan } from '@/lib/user-context';
import type { RoutingRule } from '@/lib/supabase/types';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const RULE_TYPES = [
  { value: 'model_override', label: 'Model Override' },
  { value: 'skill_pin', label: 'Skill Pin' },
  { value: 'cost_cap', label: 'Cost Cap' },
  { value: 'rate_limit', label: 'Rate Limit' },
];

function UpgradeGate({ feature, requiredPlan }: { feature: string; requiredPlan: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="pt-[16px] px-[4px] sm:px-0">
        <h1
          className="text-[26px] leading-[1.08] text-[#111110]"
          style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
        >
          Rules
        </h1>
        <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
          Custom routing rules for your agents
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="mt-[24px] bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm flex flex-col items-center justify-center py-[80px] px-[24px] text-center"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8B8B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h2 className="text-[20px] leading-[1.15] text-[#111110] mt-[20px]" style={{ fontFamily: 'PP Mondwest, serif' }}>
          {feature}
        </h2>
        <p className="text-[14px] leading-[1.5] text-[#8F8F87] mt-[8px] max-w-[400px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
          Upgrade to the {requiredPlan} plan to create custom routing rules that control how your requests are routed to models.
        </p>
        <Link
          href={`/dashboard/upgrade?plan=${requiredPlan}`}
          className="mt-[20px] inline-flex items-center justify-center h-[40px] px-[28px] rounded-[6px] bg-[#17803D] text-white text-[14px] hover:bg-[#14702f] transition"
          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} →
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function RulesPage() {
  const { isPaid, maxRules, plan } = usePlan();
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('model_override');
  const [formConditions, setFormConditions] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formPriority, setFormPriority] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchRules = useCallback(async () => {
    const res = await fetch('/api/rules');
    if (res.ok) {
      const data = await res.json();
      setRules(data.rules || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isPaid) fetchRules();
    else setLoading(false);
  }, [isPaid, fetchRules]);

  if (!isPaid) {
    return <UpgradeGate feature="Custom routing rules" requiredPlan="pro" />;
  }

  const handleCreate = async () => {
    setSaving(true);
    setError('');

    let conditions = {};
    if (formConditions.trim()) {
      try {
        conditions = JSON.parse(formConditions);
      } catch {
        setError('Conditions must be valid JSON');
        setSaving(false);
        return;
      }
    }

    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        rule_type: formType,
        conditions,
        action_value: formAction,
        priority: formPriority,
      }),
    });

    if (res.ok) {
      setShowModal(false);
      setFormName('');
      setFormType('model_override');
      setFormConditions('');
      setFormAction('');
      setFormPriority(0);
      fetchRules();
    } else {
      const data = await res.json();
      setError(data.message || data.error || 'Failed to create rule');
    }
    setSaving(false);
  };

  const handleToggle = async (rule: RoutingRule) => {
    await fetch(`/api/rules/${rule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    fetchRules();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    fetchRules();
  };

  const ruleCountLabel = maxRules === Infinity
    ? `${rules.length} rules`
    : `${rules.length} of ${maxRules} rules`;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-[16px] px-[4px] sm:px-0">
        <div className="pt-[16px]">
          <h1
            className="text-[26px] leading-[1.08] text-[#111110]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
          >
            Rules
          </h1>
          <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Custom routing rules · {ruleCountLabel}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-[12px] sm:mt-[7px] h-[34px] px-[18px] rounded-[6px] bg-[#17803D] text-white text-[13px] hover:bg-[#14702f] transition cursor-pointer"
          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          + New rule
        </button>
      </motion.div>

      {/* Rules list */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm overflow-hidden">
        {/* Table header */}
        <div
          className="hidden sm:grid h-[36px] items-center px-[20px]"
          style={{
            gridTemplateColumns: '1fr 120px 1fr 70px 60px 50px',
            borderBottom: '1px solid #EEEDE9',
          }}
        >
          {['Name', 'Type', 'Conditions', 'Priority', 'Active', ''].map((h) => (
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
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[40px]">
            <span className="text-[13px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>No rules yet</span>
            <button
              onClick={() => setShowModal(true)}
              className="mt-[8px] text-[13px] text-[#17803D] hover:underline cursor-pointer"
              style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
            >
              Create your first rule →
            </button>
          </div>
        ) : (
          rules.map((rule, i) => (
            <div key={rule.id}>
              {/* Desktop row */}
              <div
                className="hidden sm:grid h-[48px] items-center px-[20px] hover:bg-[#FAFAF8] transition"
                style={{
                  gridTemplateColumns: '1fr 120px 1fr 70px 60px 50px',
                  borderBottom: i < rules.length - 1 ? '1px solid #EEEDE9' : 'none',
                }}
              >
                <span className="text-[13px] text-[#111110] truncate pr-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {rule.name}
                </span>
                <span
                  className="inline-flex items-center h-[20px] px-[8px] rounded-[4px] text-[10px] uppercase w-fit"
                  style={{
                    backgroundColor: '#F0EFED',
                    color: '#55554F',
                    fontFamily: 'Aeonik Pro, sans-serif',
                    letterSpacing: '0.03em',
                  }}
                >
                  {rule.rule_type.replace('_', ' ')}
                </span>
                <span className="text-[12px] text-[#8F8F87] truncate pr-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {Object.keys(rule.conditions).length > 0 ? JSON.stringify(rule.conditions) : '—'}
                </span>
                <span className="text-[12px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  {rule.priority}
                </span>
                <button
                  onClick={() => handleToggle(rule)}
                  className="w-[36px] h-[20px] rounded-full transition-colors cursor-pointer"
                  style={{ backgroundColor: rule.is_active ? '#17803D' : '#D4D3CE' }}
                >
                  <div
                    className="w-[16px] h-[16px] rounded-full bg-white transition-transform"
                    style={{ transform: rule.is_active ? 'translateX(18px)' : 'translateX(2px)' }}
                  />
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="text-[12px] text-[#B8B8B0] hover:text-[#D93025] transition cursor-pointer"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  Delete
                </button>
              </div>

              {/* Mobile row */}
              <div
                className="sm:hidden px-[16px] py-[12px]"
                style={{ borderBottom: i < rules.length - 1 ? '1px solid #EEEDE9' : 'none' }}
              >
                <div className="flex items-center justify-between mb-[6px]">
                  <span className="text-[13px] text-[#111110]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{rule.name}</span>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => handleToggle(rule)}
                      className="w-[36px] h-[20px] rounded-full transition-colors cursor-pointer"
                      style={{ backgroundColor: rule.is_active ? '#17803D' : '#D4D3CE' }}
                    >
                      <div
                        className="w-[16px] h-[16px] rounded-full bg-white transition-transform"
                        style={{ transform: rule.is_active ? 'translateX(18px)' : 'translateX(2px)' }}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-[11px] text-[#B8B8B0] hover:text-[#D93025] transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-[8px] text-[11px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  <span className="px-[6px] py-[2px] rounded-[3px] bg-[#F0EFED] text-[10px] uppercase">{rule.rule_type.replace('_', ' ')}</span>
                  <span>Priority: {rule.priority}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* New Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-[16px]">
          <div className="bg-white rounded-[14px] border border-[#E2E1DC] w-full max-w-[480px] p-[28px]">
            <h2
              className="text-[20px] leading-[1.15] text-[#111110] mb-[20px]"
              style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
            >
              New Rule
            </h2>

            {error && (
              <div className="mb-[16px] p-[12px] bg-red-50 border border-red-200 rounded-[8px]">
                <p className="text-red-600 text-[13px]">{error}</p>
              </div>
            )}

            <div className="space-y-[14px]">
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pin code review to Sonnet"
                  className="w-full h-[40px] bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] text-[14px] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-[40px] bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] text-[14px] text-[#111110] outline-none focus:border-[#17803D] transition"
                >
                  {RULE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Conditions (JSON)</label>
                <textarea
                  value={formConditions}
                  onChange={(e) => setFormConditions(e.target.value)}
                  placeholder='{"skill": "code_review"}'
                  rows={3}
                  className="w-full bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] py-[10px] text-[13px] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition font-mono"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Action Value</label>
                <input
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  placeholder="e.g. sonnet-4.5, flash-lite"
                  className="w-full h-[40px] bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] text-[14px] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#55554F] mb-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Priority</label>
                <input
                  type="number"
                  value={formPriority}
                  onChange={(e) => setFormPriority(Number(e.target.value))}
                  className="w-full h-[40px] bg-white border border-[#E2E1DC] rounded-[8px] px-[14px] text-[14px] text-[#111110] outline-none focus:border-[#17803D] transition"
                />
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
                disabled={saving || !formName || !formAction}
                className="h-[38px] px-[20px] rounded-[6px] bg-[#17803D] text-white text-[13px] hover:bg-[#14702f] transition disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                {saving ? 'Creating...' : 'Create rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
