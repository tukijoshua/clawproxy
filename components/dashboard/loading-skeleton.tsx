'use client'

export function StatCardSkeleton() {
  return (
    <div
      className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm overflow-hidden animate-pulse"
      style={{ height: 135 }}
    >
      <div className="px-[21px] pt-[27px]">
        <div className="h-[12px] w-[80px] bg-[#EEEDEA] rounded-[3px]" />
        <div className="h-[28px] w-[100px] bg-[#EEEDEA] rounded-[3px] mt-[18px]" />
        <div className="h-[12px] w-[120px] bg-[#EEEDEA] rounded-[3px] mt-[10px]" />
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="bg-white border border-[#E2E1DC] rounded-[12px] shadow-claw-sm px-[23px] py-[21px] animate-pulse"
    >
      <div className="h-[11px] w-[160px] bg-[#EEEDEA] rounded-[3px] mb-[14px]" />
      <div className="bg-[#EEEDEA] rounded-[6px]" style={{ height }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-[#E2E1DC] rounded-[9px] shadow-claw-sm overflow-hidden animate-pulse">
      <div className="px-[23px] py-[18px]">
        <div className="h-[11px] w-[140px] bg-[#EEEDEA] rounded-[3px]" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-[44px] px-[20px] flex items-center gap-[20px]"
          style={{ borderTop: '1px solid #EEEDE9' }}
        >
          <div className="h-[12px] flex-1 bg-[#EEEDEA] rounded-[3px]" />
          <div className="h-[12px] w-[60px] bg-[#EEEDEA] rounded-[3px]" />
          <div className="h-[12px] w-[60px] bg-[#EEEDEA] rounded-[3px]" />
        </div>
      ))}
    </div>
  )
}
