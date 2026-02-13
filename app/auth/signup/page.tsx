'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/constants';
import type { Plan } from '@/lib/supabase/types';

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const intendedPlan = (searchParams.get('plan') as Plan) || null;
  const isPaidPlan = intendedPlan && intendedPlan !== 'starter' && PLANS[intendedPlan];

  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
          ...(intendedPlan ? { intended_plan: intendedPlan } : {}),
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        setError('Too many signup attempts. Please wait a few minutes and try again.');
      } else if (error.message.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else if (data.user && !data.session) {
      // Email confirmation required — redirect to confirmation page
      router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}`);
    } else {
      // Auto-confirmed (e.g. email confirmation disabled) — go to onboarding
      fetch('/api/auth/welcome', { method: 'POST' }).catch(() => {});
      if (isPaidPlan) {
        window.location.href = PLANS[intendedPlan].checkoutUrl!;
      } else {
        router.push('/onboarding');
      }
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    const next = isPaidPlan ? PLANS[intendedPlan].checkoutUrl! : '/onboarding';
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
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
            <span className="text-[12px] sm:text-[13px] leading-[1.15] text-[#8F8F87] hidden sm:inline">
              Already have an account?
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
      <div className="flex px-[7px] pt-[6px] pb-[7px] gap-[8px] flex-1 min-h-0">
        {/* Left panel - Form */}
        <div className="w-full sm:w-[464px] sm:min-w-[464px] bg-white border border-[#E2E1DC] rounded-[14px] flex flex-col overflow-y-auto">
          {/* Heading */}
          <div className="pt-[32px] sm:pt-[44px] px-[20px] sm:px-[37px]">
            <h1
              className="font-serif text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center"
              style={{ letterSpacing: '-0.027em' }}
            >
              Start saving on your
              <br />
              OpenClaw costs
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#55554F] text-center mt-[10px] sm:mt-[13px] px-[20px] sm:px-[54px]">
            Join 2,400+ developers who cut their LLM bills by 70%.
          </p>

          {/* Toggle tabs */}
          <div className="mx-[20px] sm:mx-[37px] mt-[24px] sm:mt-[28px]">
            <div className="bg-[#EEEDEA] rounded-lg h-[39px] flex items-center p-[3px]">
              <div
                className="flex-1 h-[33px] bg-white rounded-[6px] flex items-center justify-center"
                style={{ boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.04)' }}
              >
                <span className="text-[13.5px] leading-[1.15] text-[#111110]">
                  Create account
                </span>
              </div>
              <Link
                href="/auth/login"
                className="flex-1 h-[33px] flex items-center justify-center rounded-[6px]"
              >
                <span className="text-[13.5px] leading-[1.15] text-[#8F8F87]">
                  Sign in
                </span>
              </Link>
            </div>
          </div>

          {/* Social buttons */}
          <div className="mx-[20px] sm:mx-[37px] mt-[20px] sm:mt-[24px] space-y-[10px]">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full h-[44px] bg-white border border-[#E2E1DC] rounded-lg flex items-center justify-center gap-[10px] hover:bg-[#FAFAF9] transition"
            >
              <Image src="/images/auth/google-icon.svg" alt="Google" width={18} height={18} />
              <span className="text-[14px] leading-[1.15] text-black">Continue with Google</span>
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full h-[44px] bg-[#151518] border border-transparent rounded-lg flex items-center justify-center gap-[10px] hover:bg-[#1d1d21] transition"
            >
              <Image src="/images/auth/github-icon.svg" alt="GitHub" width={18} height={18} />
              <span className="text-[14px] leading-[1.15] text-white">Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-[20px] sm:mx-[37px] mt-[20px] sm:mt-[24px] flex items-center">
            <div className="flex-1 h-px bg-[#E2E1DC]" />
            <span
              className="mx-[14px] text-[12px] font-medium uppercase text-[#B8B8B0]"
              style={{ letterSpacing: '0.042em', lineHeight: '1.302' }}
            >
              or
            </span>
            <div className="flex-1 h-px bg-[#E2E1DC]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="mx-[20px] sm:mx-[37px] mt-[20px] sm:mt-[24px]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-[13px]">{error}</p>
              </div>
            )}

            {/* Name fields */}
            <div className="flex gap-[12px]">
              <div className="flex-1">
                <label
                  className="block text-[12px] leading-[1.15] text-[#55554F] mb-[6px]"
                  style={{ letterSpacing: '-0.008em' }}
                >
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full h-[42px] bg-white border border-[#E2E1DC] rounded-lg px-[15px] text-[14px] leading-[1.15] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                />
              </div>
              <div className="flex-1">
                <label
                  className="block text-[12px] leading-[1.15] text-[#55554F] mb-[6px]"
                  style={{ letterSpacing: '-0.008em' }}
                >
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-[42px] bg-white border border-[#E2E1DC] rounded-lg px-[15px] text-[14px] leading-[1.15] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mt-[16px]">
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

            {/* Password */}
            <div className="mt-[16px]">
              <label
                className="block text-[12px] font-semibold leading-[1.302] text-[#55554F] mb-[6px]"
                style={{ letterSpacing: '-0.008em' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  className="w-full h-[42px] bg-white border border-[#E2E1DC] rounded-lg px-[15px] pr-[42px] text-[14px] leading-[1.15] text-[#111110] placeholder:text-[#B8B8B0] outline-none focus:border-[#17803D] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[15px] top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="/images/auth/eye-icon.svg"
                    alt="Toggle password visibility"
                    width={18}
                    height={18}
                    className={showPassword ? 'opacity-100' : 'opacity-50'}
                  />
                </button>
              </div>

              {/* Password strength bars */}
              <div className="flex gap-[4px] mt-[8px]">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="flex-1 h-[3px] rounded-[2px] transition-colors"
                    style={{
                      backgroundColor:
                        password && passwordStrength >= level
                          ? passwordStrength <= 1
                            ? '#EF4444'
                            : passwordStrength <= 2
                            ? '#EAB308'
                            : passwordStrength <= 3
                            ? '#17803D99'
                            : '#17803D'
                          : '#EEEDEA',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[43px] bg-[#17803D] text-white rounded-lg text-[15px] leading-[1.15] mt-[20px] hover:bg-[#14702f] transition disabled:opacity-50"
              style={{ letterSpacing: '-0.013em' }}
            >
              {loading ? 'Creating account...' : 'Create account \u2192'}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-[16px] pb-[20px] text-center">
            <span className="text-[13px] leading-[1.15] text-[#8F8F87]">
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/login"
              className="text-[13px] leading-[1.15] text-[#17803D] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Right panel - Decorative (hidden on mobile) */}
        <div className="hidden sm:flex flex-1 bg-white border border-[#E2E1DC] rounded-[14px] relative overflow-hidden flex-col">
          {/* Main visual */}
          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/images/auth/signup-visual.png"
              alt="ClawProxy visualization"
              width={455}
              height={392}
              className="object-contain max-w-[90%]"
              priority
            />
          </div>

          {/* Social proof at bottom */}
          <div className="shrink-0 px-[16px] pb-[20px] flex items-center gap-[17px]">
            <div className="flex -space-x-[17px] shrink-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <Image
                  key={i}
                  src={`/images/auth/avatar-${i}.png`}
                  alt={`Developer ${i}`}
                  width={50}
                  height={50}
                  className="rounded-full border-[4px] border-white"
                />
              ))}
            </div>
            <span className="text-[12.5px] leading-[1.15] text-black">
              2,400+ developers already saving &middot; Avg $247/mo saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
