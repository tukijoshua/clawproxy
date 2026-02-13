'use client';

import Link from 'next/link';

export default function AuthCodeErrorPage() {
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
        </div>
      </div>

      {/* Main content */}
      <div className="flex px-[7px] pt-[6px] pb-[7px] flex-1 min-h-0 justify-center items-center">
        <div className="w-full max-w-[464px] bg-white border border-[#E2E1DC] rounded-[14px] p-[32px] sm:p-[48px] text-center">
          <h1
            className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] tracking-[-0.027em]"
            style={{ fontFamily: 'PP Mondwest, serif' }}
          >
            Authentication error
          </h1>

          <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#55554F] mt-[12px]">
            Something went wrong during sign-in. The link may have expired or
            already been used. Please try again.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full h-[43px] bg-[#17803D] text-white rounded-lg text-[15px] leading-[1.15] mt-[24px] hover:bg-[#14702f] transition"
            style={{ letterSpacing: '-0.013em' }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
