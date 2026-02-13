'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

const invoices = [
  { date: 'Feb 1, 2026', plan: 'Pro', planBg: '#DCEEE3', planBorder: '#17803D', planText: '#0D5428', amount: '$29.00', status: 'paid', statusBg: '#DCEEE3', statusBorder: '#17803D', statusText: '#0D5428', download: 'PDF' },
  { date: 'Jan 1, 2026', plan: 'Pro', planBg: '#DCEEE3', planBorder: '#17803D', planText: '#0D5428', amount: '$29.00', status: 'paid', statusBg: '#DCEEE3', statusBorder: '#17803D', statusText: '#0D5428', download: 'PDF' },
  { date: 'Dec 1, 2025', plan: 'Starter', planBg: '#FFF8E7', planBorder: '#B8860B', planText: '#B8860B', amount: 'Free', status: 'free', statusBg: '#FFF8E7', statusBorder: '#B8860B', statusText: '#B8860B', download: '—' },
];

export default function BillingPage() {
  const router = useRouter();
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="pt-[16px] mb-[16px] px-[4px] sm:px-0">
        <h1
          className="text-[26px] leading-[1.08] text-[#111110]"
          style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
        >
          Billing
        </h1>
      </motion.div>

      {/* ── Current Plan ────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
        <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
          Current plan
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-[8px]">
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[28px] leading-[1.15] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>Pro</span>
              <span
                className="inline-flex items-center h-[17px] px-[10px] rounded-[2px] text-[10px] text-[#0D5428] uppercase"
                style={{ backgroundColor: 'rgba(8,156,61,0.2)', border: '1px solid #0C5526', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.07em' }}
              >
                Pro
              </span>
            </div>
            <span className="text-[13px] leading-[1.15] text-[#5C5C58] block mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              $29/month · Renews Mar 1, 2026
            </span>
          </div>
          <div className="flex gap-[8px] mt-[12px] sm:mt-0">
            <button
              onClick={() => router.push('/dashboard/upgrade?plan=team')}
              className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
              style={{ backgroundColor: '#7C3AED', fontFamily: 'Aeonik Pro, sans-serif' }}
            >
              Upgrade to Team
            </button>
            <button
              className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-[#141413] flex items-center justify-center cursor-pointer hover:opacity-90 transition"
              style={{ backgroundColor: '#F0EFEB', border: '1px solid #E4E3DE', fontFamily: 'Aeonik Pro, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Payment Method + This Period ─────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-[3px] mt-[3px]">
        {/* Payment Method */}
        <div className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            Payment method
          </span>
          <div className="flex items-center gap-[12px] mt-[10px]">
            <div
              className="h-[28px] px-[10px] flex items-center justify-center rounded-[6px] text-[12px] text-white"
              style={{ backgroundColor: '#18181B', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.083em' }}
            >
              VISA
            </div>
            <div>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                •••• •••• •••• 4242
              </span>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                Expires 12/2028
              </span>
            </div>
          </div>
        </div>

        {/* This Period */}
        <div className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            This period
          </span>
          <div className="flex items-start gap-[40px] mt-[10px]">
            <div>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Requests</span>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>8,421 (unlimited)</span>
            </div>
            <div>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Spend</span>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>$18.40</span>
            </div>
            <div>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Saved</span>
              <span className="text-[13px] leading-[1.3] text-[#141413] block" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>$52.30</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Invoices ────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] mt-[3px] mb-[7px] overflow-hidden">
        <div className="px-[17px] py-[15px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            Invoices
          </span>
        </div>

        {/* Table header */}
        <div
          className="hidden sm:grid h-[36px] items-center px-[16px]"
          style={{
            gridTemplateColumns: '140px 100px 1fr 100px 60px',
            backgroundColor: '#F0EFEB',
            borderBottom: '1px solid #E4E3DE',
          }}
        >
          {['Date', 'Plan', '', 'Amount', 'Status'].map((h, i) => (
            <span
              key={i}
              className="text-[10px] leading-[1.15] text-black uppercase"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {invoices.map((inv, i) => (
          <div key={i}>
            {/* Desktop row */}
            <div
              className="hidden sm:grid h-[41px] items-center px-[16px] hover:bg-[#FAFAF8] transition"
              style={{
                gridTemplateColumns: '140px 100px 1fr 100px 60px',
                borderBottom: i < invoices.length - 1 ? '1px solid #E4E3DE' : 'none',
              }}
            >
              <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{inv.date}</span>
              <span
                className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px] w-fit"
                style={{ backgroundColor: inv.planBg, border: `1px solid ${inv.planBorder}`, color: inv.planText, fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}
              >
                {inv.plan}
              </span>
              <span />
              <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{inv.amount}</span>
              <div className="flex items-center gap-[12px]">
                <span
                  className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px] w-fit"
                  style={{ backgroundColor: inv.statusBg, border: `1px solid ${inv.statusBorder}`, color: inv.statusText, fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.03em' }}
                >
                  {inv.status}
                </span>
                {inv.download === 'PDF' ? (
                  <span className="text-[12px] text-[#2563EB] cursor-pointer hover:underline" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>PDF</span>
                ) : (
                  <span className="text-[13px] text-[#141413]" style={{ fontFamily: 'DM Sans, sans-serif' }}>—</span>
                )}
              </div>
            </div>

            {/* Mobile row */}
            <div className="sm:hidden px-[16px] py-[12px]" style={{ borderBottom: i < invoices.length - 1 ? '1px solid #E4E3DE' : 'none' }}>
              <div className="flex items-center justify-between mb-[6px]">
                <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{inv.date}</span>
                <span
                  className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px]"
                  style={{ backgroundColor: inv.statusBg, border: `1px solid ${inv.statusBorder}`, color: inv.statusText, fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  {inv.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <span
                    className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px]"
                    style={{ backgroundColor: inv.planBg, border: `1px solid ${inv.planBorder}`, color: inv.planText, fontFamily: 'Aeonik Pro, sans-serif' }}
                  >
                    {inv.plan}
                  </span>
                  <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{inv.amount}</span>
                </div>
                {inv.download === 'PDF' && (
                  <span className="text-[12px] text-[#2563EB] cursor-pointer" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>PDF</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
