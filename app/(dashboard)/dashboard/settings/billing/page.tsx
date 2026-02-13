'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

interface BillingStatus {
  plan: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  renewalEnd: string | null;
  updatePaymentUrl: string | null;
  paymentFailed: boolean;
  upgradeUrls: { pro: string; team: string };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  cardBrand: string | null;
  cardLast4: string | null;
}

const CANCEL_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using it enough' },
  { value: 'switching', label: 'Switching to another tool' },
  { value: 'missing_feature', label: 'Missing a feature I need' },
  { value: 'other', label: 'Other reason' },
];

export default function BillingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setBilling(data); });

    fetch('/api/billing/invoices')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.invoices) setInvoices(data.invoices); });
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    await fetch('/api/billing/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: cancelReason }),
    });
    setBilling((prev) => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
    setShowCancelModal(false);
    setCancelling(false);
  };

  const handleResume = async () => {
    setResuming(true);
    await fetch('/api/billing/resume', { method: 'POST' });
    setBilling((prev) => prev ? { ...prev, cancelAtPeriodEnd: false } : prev);
    setResuming(false);
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const planLabel = billing?.plan ? billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1) : 'Starter';
  const planPrice = billing?.plan === 'pro' ? '$29' : billing?.plan === 'team' ? '$79' : '$0';

  if (!billing) {
    return (
      <div className="pt-[16px] px-[4px] sm:px-0">
        <div className="h-[200px] bg-white border border-[#E4E3DE] rounded-[10px] animate-pulse" />
      </div>
    );
  }

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

      {/* Payment failed banner */}
      {billing.paymentFailed && (
        <motion.div variants={fadeUp} className="mb-[3px] px-[21px] py-[14px] bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-[13px] text-red-700" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            Your last payment failed. Please update your payment method to keep your {planLabel} plan.
          </p>
          {billing.updatePaymentUrl && (
            <a href={billing.updatePaymentUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-red-700 underline mt-[4px] inline-block">
              Update payment method →
            </a>
          )}
        </motion.div>
      )}

      {/* Current Plan */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px]">
        <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
          Current plan
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-[8px]">
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[28px] leading-[1.15] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{planLabel}</span>
              <span
                className="inline-flex items-center h-[17px] px-[10px] rounded-[2px] text-[10px] text-[#0D5428] uppercase"
                style={{ backgroundColor: 'rgba(8,156,61,0.2)', border: '1px solid #0C5526', fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.07em' }}
              >
                {planLabel}
              </span>
            </div>
            <span className="text-[13px] leading-[1.15] text-[#5C5C58] block mt-[4px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              {planPrice}/month
              {billing.renewalEnd && !billing.cancelAtPeriodEnd && ` · Renews ${formatDate(billing.renewalEnd)}`}
              {billing.cancelAtPeriodEnd && ` · Cancels ${formatDate(billing.renewalEnd)}`}
            </span>
          </div>

          <div className="flex gap-[8px] mt-[12px] sm:mt-0">
            {billing.plan === 'starter' && (
              <>
                <button
                  onClick={() => router.push('/dashboard/upgrade?plan=pro')}
                  className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                  style={{ backgroundColor: '#157A3E', fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => router.push('/dashboard/upgrade?plan=team')}
                  className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                  style={{ backgroundColor: '#7C3AED', fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  Upgrade to Team
                </button>
              </>
            )}
            {billing.plan === 'pro' && (
              <button
                onClick={() => router.push('/dashboard/upgrade?plan=team')}
                className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                style={{ backgroundColor: '#7C3AED', fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                Upgrade to Team
              </button>
            )}
            {billing.plan !== 'starter' && !billing.cancelAtPeriodEnd && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-[#141413] flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                style={{ backgroundColor: '#F0EFEB', border: '1px solid #E4E3DE', fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                Cancel
              </button>
            )}
            {billing.cancelAtPeriodEnd && (
              <button
                onClick={handleResume}
                disabled={resuming}
                className="h-[32px] px-[18px] rounded-[8px] text-[12px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: '#157A3E', fontFamily: 'Aeonik Pro, sans-serif' }}
              >
                {resuming ? 'Resuming...' : 'Keep my plan'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Payment Method */}
      {billing.plan !== 'starter' && billing.updatePaymentUrl && (
        <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] px-[21px] py-[21px] mt-[3px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase block" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            Payment method
          </span>
          <a
            href={billing.updatePaymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#2563EB] hover:underline mt-[10px] inline-block"
            style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
          >
            Update payment method →
          </a>
        </motion.div>
      )}

      {/* Invoices */}
      <motion.div variants={fadeUp} className="bg-white border border-[#E4E3DE] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] mt-[3px] mb-[7px] overflow-hidden">
        <div className="px-[17px] py-[15px]">
          <span className="text-[12px] leading-[1.15] text-[#9C9C96] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.067em' }}>
            Payment History
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="px-[17px] pb-[20px]">
            <p className="text-[13px] text-[#9C9C96]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
              {billing.plan === 'starter' ? 'No payments yet. Upgrade to see payment history.' : 'No payment history available.'}
            </p>
          </div>
        ) : (
          <>
            <div
              className="hidden sm:grid h-[36px] items-center px-[16px]"
              style={{ gridTemplateColumns: '140px 100px 1fr 100px', backgroundColor: '#F0EFEB', borderBottom: '1px solid #E4E3DE' }}
            >
              {['Date', 'Amount', '', 'Status'].map((h, i) => (
                <span key={i} className="text-[10px] leading-[1.15] text-black uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>
                  {h}
                </span>
              ))}
            </div>

            {invoices.map((inv, i) => (
              <div key={inv.id}>
                <div
                  className="hidden sm:grid h-[41px] items-center px-[16px] hover:bg-[#FAFAF8] transition"
                  style={{ gridTemplateColumns: '140px 100px 1fr 100px', borderBottom: i < invoices.length - 1 ? '1px solid #E4E3DE' : 'none' }}
                >
                  <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{formatDate(inv.date)}</span>
                  <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    ${((inv.amount || 0) / 100).toFixed(2)}
                  </span>
                  <span className="text-[12px] text-[#9C9C96]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                    {inv.cardBrand && inv.cardLast4 ? `${inv.cardBrand} •••• ${inv.cardLast4}` : ''}
                  </span>
                  <span
                    className="inline-flex items-center h-[17px] px-[8px] rounded-[2px] text-[10px] w-fit"
                    style={{
                      backgroundColor: inv.status === 'succeeded' ? '#DCEEE3' : '#FFF8E7',
                      border: `1px solid ${inv.status === 'succeeded' ? '#17803D' : '#B8860B'}`,
                      color: inv.status === 'succeeded' ? '#0D5428' : '#B8860B',
                      fontFamily: 'Aeonik Pro, sans-serif',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {inv.status === 'succeeded' ? 'paid' : inv.status}
                  </span>
                </div>

                {/* Mobile row */}
                <div className="sm:hidden px-[16px] py-[12px]" style={{ borderBottom: i < invoices.length - 1 ? '1px solid #E4E3DE' : 'none' }}>
                  <div className="flex items-center justify-between mb-[4px]">
                    <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>{formatDate(inv.date)}</span>
                    <span className="text-[12px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      ${((inv.amount || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </motion.div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-[16px]"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[14px] w-full max-w-[440px] p-[32px]"
              style={{ border: '1px solid #E2E1DC' }}
            >
              <h2
                className="text-[22px] leading-[1.15] text-[#111110]"
                style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.023em' }}
              >
                Cancel {planLabel} plan?
              </h2>
              <p className="text-[13px] leading-[1.5] text-[#5C5C58] mt-[8px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                You&apos;ll keep access until {formatDate(billing.renewalEnd)}. After that, you&apos;ll be downgraded to Starter (free).
              </p>

              <div className="mt-[20px] space-y-[8px]">
                <p className="text-[12px] text-[#9C9C96] uppercase" style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.05em' }}>
                  Why are you cancelling?
                </p>
                {CANCEL_REASONS.map((r) => (
                  <label key={r.value} className="flex items-center gap-[10px] cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      onChange={() => setCancelReason(r.value)}
                      className="accent-[#17803D]"
                    />
                    <span className="text-[13px] text-[#141413]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                      {r.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-[8px] mt-[24px]">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-[40px] rounded-[8px] text-[13px] text-[#141413] cursor-pointer hover:opacity-90 transition"
                  style={{ backgroundColor: '#F0EFEB', border: '1px solid #E4E3DE', fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  Keep my plan
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 h-[40px] rounded-[8px] text-[13px] text-white cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                  style={{ backgroundColor: '#DC2626', fontFamily: 'Aeonik Pro, sans-serif' }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
