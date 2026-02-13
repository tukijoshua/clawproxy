'use client'

import Image from 'next/image'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-[24px]">
      {icon && (
        <Image src={icon} alt="" width={48} height={48} className="opacity-40 mb-[16px]" />
      )}
      <h3
        className="text-[18px] leading-[1.2] text-[#111110] text-center"
        style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>
      <p
        className="text-[13px] leading-[1.5] text-[#8F8F87] text-center mt-[8px] max-w-[320px]"
        style={{ fontFamily: 'Aeonik Pro, sans-serif' }}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-[20px] h-[37px] px-[20px] rounded-[6px] text-[13px] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
          style={{ backgroundColor: '#17803D', fontFamily: 'Aeonik Pro, sans-serif' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
