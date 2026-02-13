'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UpgradeGate } from '@/components/upgrade-gate';
import { usePlan } from '@/lib/user-context';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

/* ── Types ───────────────────────────────────────────────────────── */
type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'pending';
}

const initialMembers: Member[] = [
  { id: '1', name: 'You', email: 'you@company.com', role: 'owner', status: 'active' },
  { id: '2', name: 'Sarah K.', email: 'sarah@company.com', role: 'admin', status: 'active' },
  { id: '3', name: 'James L.', email: 'james@company.com', role: 'member', status: 'pending' },
];

const roleStyles: Record<string, { bg: string; border: string; text: string }> = {
  owner: { bg: '#F3EEFF', border: '#7C3AED', text: '#7C3AED' },
  admin: { bg: '#EBF2FF', border: '#2563EB', text: '#2563EB' },
  member: { bg: '#E2F3EA', border: '#0C5526', text: '#0D5428' },
  viewer: { bg: '#FFF8E7', border: '#B8860B', text: '#B8860B' },
};

const assignableRoles: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

/* ── Role dropdown component ─────────────────────────────────────── */
function RoleDropdown({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const rs = roleStyles[role];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-[4px] h-[17px] px-[8px] text-[10px] cursor-pointer transition hover:opacity-80"
        style={{
          backgroundColor: rs.bg,
          border: `1px solid ${rs.border}`,
          borderRadius: '2px',
          color: rs.text,
          fontFamily: 'Aeonik Pro, sans-serif',
          letterSpacing: '0.03em',
        }}
      >
        {role}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[22px] left-0 z-30 bg-white rounded-[6px] py-[4px] min-w-[120px]"
          style={{ border: '1px solid #E2E1DC', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          {assignableRoles.map((r) => (
            <button
              key={r.value}
              onClick={() => { onChange(r.value); setOpen(false); }}
              className="w-full text-left px-[12px] py-[6px] text-[12px] hover:bg-[#F5F5F3] transition cursor-pointer flex items-center gap-[8px]"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', color: role === r.value ? '#111110' : '#5C5C58' }}
            >
              <div
                className="w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: roleStyles[r.value].border, opacity: role === r.value ? 1 : 0.3 }}
              />
              {r.label}
              {role === r.value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#17803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                  <polyline points="9 3 5 9 3 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function MembersPage() {
  const { canInviteMembers } = usePlan();

  if (!canInviteMembers) {
    return (
      <div className="pt-[16px] px-[4px] sm:px-0">
        <UpgradeGate feature="Team members" requiredPlan="team">
          <></>
        </UpgradeGate>
      </div>
    );
  }
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [modalStep, setModalStep] = useState<0 | 1 | 2>(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'viewer'>('admin');
  const [personalMessage, setPersonalMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = async () => {
    setInviteLoading(true);
    setInviteError('');

    try {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: selectedRole,
          personalMessage: personalMessage || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      setModalStep(2);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleClose = () => {
    setModalStep(0);
    setInviteEmail('');
    setSelectedRole('admin');
    setPersonalMessage('');
    setInviteError('');
  };

  const handleChangeRole = (id: string, newRole: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setConfirmRemove(null);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between pt-[16px] mb-[16px] px-[4px] sm:px-0">
        <div>
          <h1
            className="text-[26px] leading-[1.08] text-[#111110]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
          >
            Team members
          </h1>
          <p className="text-[13px] leading-[1.15] text-[#8F8F87] mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Each agent gets its own API key and per-agent tracking.
          </p>
        </div>
        <button
          onClick={() => setModalStep(1)}
          className="h-[37px] px-[17px] rounded-[6px] text-[13px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition mt-[12px] sm:mt-[10px] shrink-0"
          style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          + Invite member
        </button>
      </motion.div>

      {/* Search bar */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-[10px] h-[40px] px-[22px] rounded-[8px] mb-[7px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.64)', border: '1px solid #CBCBCB' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search for members"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-[14px] text-[#000000] outline-none placeholder:text-black/50"
          style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
        />
      </motion.div>

      {/* Members table */}
      <motion.div variants={fadeUp} className="rounded-[3px] overflow-visible" style={{ border: '1px solid #E4E3DE' }}>
        {/* Header row */}
        <div
          className="hidden sm:grid h-[30px] items-center"
          style={{
            gridTemplateColumns: '1fr 1fr 180px 140px 50px',
            backgroundColor: '#F0EFEB',
            borderBottom: '1px solid #E4E3DE',
          }}
        >
          <span className="pl-[16px] text-[10px] uppercase text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>Name</span>
          <span className="text-[10px] uppercase text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>Email</span>
          <span className="text-[10px] uppercase text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>Role</span>
          <span className="text-[10px] uppercase text-black" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>Status</span>
          <span />
        </div>

        {/* Rows */}
        {filteredMembers.map((member, i) => {
          const rs = roleStyles[member.role];
          const isOwner = member.role === 'owner';
          return (
            <div
              key={member.id}
              className="flex flex-col sm:grid sm:h-[41px] sm:items-center px-[16px] py-[10px] sm:py-0 gap-[6px] sm:gap-0 bg-white relative"
              style={{
                gridTemplateColumns: '1fr 1fr 180px 140px 50px',
                borderBottom: i < filteredMembers.length - 1 ? '1px solid #E4E3DE' : 'none',
              }}
            >
              {/* Name */}
              <span className="text-[13px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                {member.name}
              </span>

              {/* Email */}
              <span className="text-[12px] text-[#5C5C58]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                {member.email}
              </span>

              {/* Role badge / dropdown */}
              <div className="flex items-center">
                {isOwner ? (
                  <div
                    className="inline-flex items-center h-[17px] px-[8px] text-[10px]"
                    style={{
                      backgroundColor: rs.bg,
                      border: `1px solid ${rs.border}`,
                      borderRadius: '3px',
                      color: rs.text,
                      fontFamily: 'Aeonik Pro, sans-serif',
                      letterSpacing: '0.03em',
                    }}
                  >
                    owner
                  </div>
                ) : (
                  <RoleDropdown
                    role={member.role}
                    onChange={(newRole) => handleChangeRole(member.id, newRole)}
                  />
                )}
              </div>

              {/* Status */}
              <span
                className="text-[12px]"
                style={{
                  fontFamily: 'Aeonik Pro, sans-serif',
                  color: member.status === 'active' ? '#17803D' : '#B8860B',
                }}
              >
                {member.status === 'active' ? 'Active' : 'Pending'}
              </span>

              {/* Remove icon */}
              <div className="flex items-center justify-center relative">
                {!isOwner && (
                  <>
                    <button
                      onClick={() => setConfirmRemove(confirmRemove === member.id ? null : member.id)}
                      className="w-[14px] h-[14px] flex items-center justify-center text-black/40 hover:text-[#D93025] transition cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                        <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
                      </svg>
                    </button>

                    {/* Confirm remove popover */}
                    {confirmRemove === member.id && (
                      <div
                        className="absolute right-0 top-[20px] z-30 bg-white rounded-[8px] p-[12px] min-w-[200px]"
                        style={{ border: '1px solid #E2E1DC', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      >
                        <p className="text-[12px] text-[#111110] mb-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                          Remove {member.name}?
                        </p>
                        <div className="flex gap-[6px]">
                          <button
                            onClick={() => setConfirmRemove(null)}
                            className="flex-1 h-[28px] rounded-[4px] text-[11px] text-[#8F8F87] cursor-pointer hover:bg-[#F5F5F3] transition"
                            style={{ border: '1px solid #E2E1DC', fontFamily: 'Aeonik Pro, sans-serif' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="flex-1 h-[28px] rounded-[4px] text-[11px] text-white cursor-pointer hover:opacity-90 transition"
                            style={{ backgroundColor: '#D93025', fontFamily: 'Aeonik Pro, sans-serif' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Modal overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {modalStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
            style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="bg-white rounded-[16px] w-full overflow-y-auto"
              style={{ maxWidth: 540, maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* ── Step 1: Invite form ─────────────────────────── */}
            {modalStep === 1 && (
              <div className="px-[28px] py-[24px]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className="text-[24px] leading-[1.08] text-[#111110]"
                      style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.021em' }}
                    >
                      Invite a team member
                    </h2>
                    <p className="text-[13.5px] leading-[1.5] text-[#55554F] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      They&apos;ll get an email with a link to join your ClawProxy team.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-[32px] h-[32px] rounded-[8px] border border-[#E2E1DC] flex items-center justify-center text-[#8F8F87] hover:bg-[#F5F5F3] transition shrink-0 ml-[12px]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>

                {/* Email address */}
                <label className="text-[12px] text-[#55554F] block mt-[24px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-[42px] mt-[4px] px-[15px] rounded-[6px] border border-[#E2E1DC] text-[14px] text-black outline-none focus:border-[#17803D] transition"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  placeholder="teammate@company.com"
                />

                {/* Role */}
                <label className="text-[12px] text-[#55554F] block mt-[20px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  Role
                </label>
                <div className="flex gap-[8px] mt-[6px]">
                  {/* Admin card */}
                  <button
                    onClick={() => setSelectedRole('admin')}
                    className="flex-1 rounded-[8px] py-[22px] px-[17px] flex flex-col items-center text-center cursor-pointer transition"
                    style={{
                      backgroundColor: selectedRole === 'admin' ? '#E2F3EA' : 'transparent',
                      border: `1px solid ${selectedRole === 'admin' ? '#17803D' : '#E2E1DC'}`,
                    }}
                  >
                    {/* Manager/shield icon */}
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v4.5" />
                      <path d="M6 14h16c0-4.5-3.6-8.5-8-8.5S6 9.5 6 14z" />
                      <circle cx="14" cy="19" r="3.5" />
                    </svg>
                    <span className="text-[13px] text-[#111110] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Admin</span>
                    <span className="text-[11px] leading-[1.4] mt-[2px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: selectedRole === 'admin' ? '#747474' : '#8F8F87' }}>
                      Manage members, agents, rules, and billing
                    </span>
                  </button>

                  {/* Member card */}
                  <button
                    onClick={() => setSelectedRole('member')}
                    className="flex-1 rounded-[8px] py-[22px] px-[17px] flex flex-col items-center text-center cursor-pointer transition"
                    style={{
                      backgroundColor: selectedRole === 'member' ? '#E2F3EA' : 'transparent',
                      border: `1px solid ${selectedRole === 'member' ? '#17803D' : '#E2E1DC'}`,
                    }}
                  >
                    {/* People icon */}
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="3.5" />
                      <circle cx="18" cy="8" r="3.5" />
                      <path d="M3 22c0-3.9 3.1-7 7-7 1.8 0 3.4.7 4.6 1.8" />
                      <path d="M18 15c3.9 0 7 3.1 7 7" />
                    </svg>
                    <span className="text-[13px] text-[#111110] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Member</span>
                    <span className="text-[11px] leading-[1.4] mt-[2px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: selectedRole === 'member' ? '#747474' : '#8F8F87' }}>
                      Create agents, view all data, edit own agents
                    </span>
                  </button>

                  {/* Viewer card */}
                  <button
                    onClick={() => setSelectedRole('viewer')}
                    className="flex-1 rounded-[8px] py-[22px] px-[17px] flex flex-col items-center text-center cursor-pointer transition"
                    style={{
                      backgroundColor: selectedRole === 'viewer' ? '#E2F3EA' : 'transparent',
                      border: `1px solid ${selectedRole === 'viewer' ? '#17803D' : '#E2E1DC'}`,
                    }}
                  >
                    {/* Eye icon */}
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 14s4.5-7.5 11.5-7.5S25.5 14 25.5 14s-4.5 7.5-11.5 7.5S2.5 14 2.5 14z" />
                      <circle cx="14" cy="14" r="3.5" />
                    </svg>
                    <span className="text-[13px] text-[#111110] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Viewer</span>
                    <span className="text-[11px] leading-[1.4] mt-[2px]" style={{ fontFamily: 'Aeonik Pro, sans-serif', color: selectedRole === 'viewer' ? '#747474' : '#8F8F87' }}>
                      Read-only access to dashboard and analytics
                    </span>
                  </button>
                </div>

                {/* Personal message */}
                <label className="text-[12px] text-[#55554F] block mt-[20px]" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  Personal message (optional)
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  className="w-full h-[60px] mt-[4px] px-[15px] py-[12px] rounded-[6px] border border-[#E2E1DC] text-[14px] text-black outline-none focus:border-[#17803D] transition resize-none"
                  style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  placeholder="Hey! Join our ClawProxy team to see how much we're saving..."
                />

                {/* Error */}
                {inviteError && (
                  <div className="mt-[16px] p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-[13px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{inviteError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-[8px] mt-[24px]">
                  <button
                    onClick={handleClose}
                    className="h-[37px] px-[12px] rounded-[6px] text-[13px] text-[#8F8F87] cursor-pointer hover:bg-[#F5F5F3] transition"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    disabled={inviteLoading || !inviteEmail}
                    className="h-[37px] px-[20px] rounded-[6px] text-[13px] text-white cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                    style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {inviteLoading ? 'Sending...' : 'Send invite \u2192'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Success ─────────────────────────────── */}
            {modalStep === 2 && (
              <div className="px-[28px] py-[24px] text-center">
                {/* Close button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="w-[32px] h-[32px] rounded-[8px] border border-[#E2E1DC] flex items-center justify-center text-[#8F8F87] hover:bg-[#F5F5F3] transition"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>

                {/* Stars illustration */}
                <div className="flex justify-center mt-[4px]">
                  <svg width="103" height="103" viewBox="0 0 103 103" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="51.5" cy="51.5" r="38.63" />
                    <path d="M51.5 30l5.5 13.5L71 49l-14 5.5L51.5 68l-5.5-13.5L32 49l14-5.5z" />
                    <circle cx="21.46" cy="81.54" r="10.73" />
                    <circle cx="77.25" cy="17.17" r="12.88" />
                  </svg>
                </div>

                {/* Title */}
                <h2
                  className="text-[22px] leading-[1.08] text-[#111110] mt-[16px]"
                  style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.021em' }}
                >
                  Invite sent!
                </h2>

                {/* Subtitle */}
                <p className="text-[14px] text-[#55554F] mt-[6px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                  An invite was sent to {inviteEmail || 'teammate@company.com'} as {selectedRole}.
                </p>

                {/* What happens next */}
                <div
                  className="mt-[28px] rounded-[8px] px-[19px] py-[15px] text-left"
                  style={{ backgroundColor: '#FAFAF8', border: '1px solid #EEEDE9' }}
                >
                  <span className="text-[12px] text-[#8F8F87] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    What happens next
                  </span>
                  <div className="mt-[10px] space-y-[2px]">
                    <p className="text-[13px] leading-[1.7] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      1. They&apos;ll get an email with a join link
                    </p>
                    <p className="text-[13px] leading-[1.7] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      2. If they already have an account, they click &quot;Accept&quot;
                    </p>
                    <p className="text-[13px] leading-[1.7] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      3. If not, they sign up first, then auto-join your team
                    </p>
                    <p className="text-[13px] leading-[1.7] text-[#55554F]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      4. You&apos;ll see their status change from Pending &rarr; Active
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-[8px] mt-[24px]">
                  <button
                    onClick={() => { setModalStep(1); setInviteEmail(''); setPersonalMessage(''); }}
                    className="h-[39px] px-[21px] rounded-[6px] text-[13px] text-[#55554F] cursor-pointer hover:bg-[#F5F5F3] transition"
                    style={{ fontFamily: 'Aeonik Pro, sans-serif', border: '1px solid #E2E1DC' }}
                  >
                    Invite another
                  </button>
                  <button
                    onClick={handleClose}
                    className="h-[39px] px-[20px] rounded-[6px] text-[13px] text-white cursor-pointer hover:opacity-90 transition"
                    style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
