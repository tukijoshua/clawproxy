'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const STEPS = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'How it works' },
  { label: 'Setup' },
  { label: 'API Key' },
  { label: 'Done' },
];

export default function OnboardingLayout({
  currentStep,
  children,
}: {
  currentStep: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F0EFED]">
      {/* Sticky header area */}
      <div className="sticky top-0 z-50 bg-[#F0EFED]">
        {/* Top navbar */}
        <div className="px-[7px] pt-[7px]">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="bg-white border border-[#E2E1DC] rounded-[14px] h-[52px] sm:h-[59px] flex items-center justify-between px-[16px] sm:px-[25px]"
          >
            <span
              className="text-[20px] sm:text-[23.6px] tracking-[-0.027em] text-black leading-[1.15]"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              ClawProxy
            </span>
            <span className="text-[12px] sm:text-[13px] leading-[1.15] text-[#17803D]">
              Step {currentStep} of 6
            </span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="px-[7px] pt-[6px]">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="bg-white border border-[#E2E1DC] rounded-[14px] h-[56px] sm:h-[63px] flex items-center justify-center overflow-x-auto scrollbar-hide"
          >
            <div className="flex items-center px-[12px] sm:px-0">
              {STEPS.map((step, i) => {
                  const stepIndex = i + 1;
                  const isCompleted = stepIndex < currentStep;
                  const isCurrent = stepIndex === currentStep;
                  const isWide = step.label === 'How it works';

                  return (
                    <div key={step.label} className="flex items-center shrink-0">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                          className={`${isWide ? 'w-[116px]' : 'w-[99px]'} h-[38px] rounded-[10px] items-center justify-center hidden sm:flex`}
                          style={{ border: '1px dashed #17803D' }}
                        >
                          <div
                            className={`${isWide ? 'w-[109px]' : 'w-[94px]'} h-[32px] bg-[#17803D] rounded-[9px] flex items-center justify-center gap-[4px]`}
                          >
                            <Image
                              src="/images/onboarding/icon-checkmark-circle.svg"
                              alt=""
                              width={13}
                              height={13}
                            />
                            <span className="text-[12px] leading-[1.15] text-white">
                              {step.label}
                            </span>
                          </div>
                        </motion.div>
                      ) : isCurrent ? (
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                          className={`${isWide ? 'sm:w-[116px] w-[100px]' : 'sm:w-[99px] w-[80px]'} h-[34px] sm:h-[38px] rounded-[10px] flex items-center justify-center`}
                          style={{ border: '1px dashed #17803D' }}
                        >
                          <div
                            className={`${isWide ? 'sm:w-[109px] w-[93px]' : 'sm:w-[94px] w-[73px]'} h-[28px] sm:h-[32px] rounded-[9px] flex items-center justify-center`}
                            style={{ backgroundColor: 'rgba(23, 128, 61, 0.67)' }}
                          >
                            <span className="text-[11px] sm:text-[12px] leading-[1.15] text-white">
                              {step.label}
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <div
                          className={`${isWide ? 'sm:w-[101px] w-[85px]' : 'sm:w-[94px] w-[70px]'} h-[28px] sm:h-[32px] bg-white border border-[#E2E1DC] rounded-[10px] items-center justify-center hidden sm:flex`}
                        >
                          <span className="text-[11px] sm:text-[12px] leading-[1.15] text-[#939393]">
                            {step.label}
                          </span>
                        </div>
                      )}

                      {/* Mobile: show small dots for completed/upcoming, hide dividers */}
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-[8px] h-[8px] rounded-full bg-[#17803D] sm:hidden mx-[3px]"
                        />
                      )}
                      {!isCompleted && !isCurrent && (
                        <div className="w-[8px] h-[8px] rounded-full bg-[#E2E1DC] sm:hidden mx-[3px]" />
                      )}

                      {i < STEPS.length - 1 && (
                        <div className="w-[12px] sm:w-[20px] h-[2px] rounded-[1px] mx-[0.5px] hidden sm:block relative overflow-hidden bg-[#F0EFED]">
                          <motion.div
                            className="absolute inset-0 bg-[#17803D] rounded-[1px]"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isCompleted ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                            style={{ transformOrigin: 'left' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </div>

        {/* Bottom fade for smooth scroll transition */}
        <div className="h-[6px] bg-[#F0EFED]" />
      </div>

      {/* Main content area */}
      <div className="px-[7px] pb-[7px]">
        <div className="bg-white border border-[#E2E1DC] rounded-[14px] min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-160px)] flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
