'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

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
            <Link
              href="/auth/login"
              className="text-[12px] sm:text-[13px] leading-[1.15] text-[#17803D] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex px-[7px] pt-[6px] pb-[7px] flex-1 min-h-0 justify-center">
        <div className="w-full max-w-[464px] bg-white border border-[#E2E1DC] rounded-[14px] flex flex-col overflow-y-auto">
          <div className="pt-[48px] sm:pt-[64px] px-[20px] sm:px-[37px] pb-[40px]">
            <h1
              className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center tracking-[-0.027em]"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              Reset your password
            </h1>

            <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#55554F] text-center mt-[10px] sm:mt-[13px]">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {sent ? (
              <div className="mt-[28px] p-4 bg-[#E2F3EA] border border-[#17803D] rounded-lg text-center">
                <p className="text-[14px] text-[#0C5526]">
                  Check your email for a password reset link.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-[28px]">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-[13px]">{error}</p>
                  </div>
                )}

                <div>
                  <label
                    className="block text-[12px] leading-[1.15] text-[#55554F] mb-[6px]"
                    style={{ letterSpacing: '-0.008em' }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    required
                    className="w-full h-[42px] bg-white border border-[#E2E1DC] rounded-lg px-[15px] text-[14px] leading-[1.15] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[43px] bg-[#17803D] text-white rounded-lg text-[15px] leading-[1.15] mt-[20px] hover:bg-[#14702f] transition disabled:opacity-50"
                  style={{ letterSpacing: '-0.013em' }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}

            <div className="mt-[16px] text-center">
              <Link
                href="/auth/login"
                className="text-[13px] leading-[1.15] text-[#17803D] hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
