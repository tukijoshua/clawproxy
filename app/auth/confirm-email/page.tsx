'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ConfirmEmailInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resent, setResent] = useState(false);

  return (
    <div className="h-screen bg-[#F0EFED] flex flex-col overflow-hidden">
      {/* Top navbar */}
      <div className="px-[7px] pt-[7px] shrink-0">
        <div className="bg-white border border-[#E2E1DC] rounded-[14px] h-[52px] sm:h-[59px] flex items-center justify-between px-[16px] sm:px-[25px]">
          <span
            className="text-[20px] sm:text-[23.6px] tracking-[-0.027em] text-black leading-[1.15]"
            style={{ fontFamily: 'PP Mondwest, serif' }}
          >
            ClawProxy
          </span>
          <div className="flex items-center gap-[5px]">
            <span className="text-[12px] sm:text-[13px] leading-[1.15] text-[#8F8F87] hidden sm:inline">
              Already confirmed?
            </span>
            <Link
              href="/auth/login"
              className="text-[12px] sm:text-[13px] leading-[1.15] text-[#17803D] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-[16px]">
        <div className="bg-white border border-[#E2E1DC] rounded-[14px] w-full max-w-[480px] px-[28px] sm:px-[40px] py-[40px] sm:py-[52px] text-center">
          {/* Email icon */}
          <div className="w-[64px] h-[64px] mx-auto mb-[24px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F5EC' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#17803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="M22 7l-10 6L2 7" />
            </svg>
          </div>

          <h1
            className="text-[24px] sm:text-[28px] leading-[1.15] text-[#111110] mb-[12px]"
            style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.027em' }}
          >
            Check your email
          </h1>

          <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[#55554F] mb-[8px]">
            We sent a confirmation link to
          </p>

          {email && (
            <p className="text-[15px] sm:text-[16px] leading-[1.4] text-[#111110] font-medium mb-[24px]">
              {email}
            </p>
          )}

          <div className="bg-[#FAFAF8] border border-[#E2E1DC] rounded-[10px] px-[20px] py-[16px] mb-[24px] text-left">
            <p className="text-[13px] leading-[1.6] text-[#55554F] mb-[12px]">
              <strong className="text-[#111110]">Next steps:</strong>
            </p>
            <ol className="text-[13px] leading-[1.8] text-[#55554F] pl-[16px] m-0 space-y-[4px]">
              <li>Open the email from <strong className="text-[#111110]">ClawProxy</strong></li>
              <li>Click the <strong className="text-[#111110]">Confirm your email</strong> button</li>
              <li>You&apos;ll be redirected to complete your setup</li>
            </ol>
          </div>

          <div className="flex flex-col items-center gap-[12px]">
            <p className="text-[12px] leading-[1.5] text-[#8F8F87]">
              Didn&apos;t receive the email? Check your spam folder, or
            </p>
            <button
              onClick={() => setResent(true)}
              disabled={resent}
              className="text-[13px] leading-[1.15] text-[#17803D] hover:underline disabled:text-[#8F8F87] disabled:no-underline transition"
            >
              {resent ? 'Email resent! Check your inbox.' : 'Resend confirmation email'}
            </button>
          </div>

          <div className="mt-[28px] pt-[20px] border-t border-[#E2E1DC]">
            <p className="text-[12px] leading-[1.5] text-[#8F8F87]">
              Wrong email?{' '}
              <Link href="/auth/signup" className="text-[#17803D] hover:underline">
                Sign up again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailInner />
    </Suspense>
  );
}
