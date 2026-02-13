'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Inline SVG icons (use currentColor for dynamic tinting) ──────── */
const IconOverview = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.6564 2.375V8.31252M16.6251 5.34376H10.6876" />
    <path d="M10.8383 15.4034C10.6876 15.0397 10.6876 14.5786 10.6876 13.6564C10.6876 12.7342 10.6876 12.2731 10.8383 11.9094C11.0391 11.4244 11.4244 11.0391 11.9094 10.8383C12.2731 10.6876 12.7342 10.6876 13.6564 10.6876C14.5786 10.6876 15.0397 10.6876 15.4034 10.8383C15.8883 11.0391 16.2736 11.4244 16.4745 11.9094C16.6251 12.2731 16.6251 12.7342 16.6251 13.6564C16.6251 14.5786 16.6251 15.0397 16.4745 15.4034C16.2736 15.8883 15.8883 16.2736 15.4034 16.4745C15.0397 16.6251 14.5786 16.6251 13.6564 16.6251C12.7342 16.6251 12.2731 16.6251 11.9094 16.4745C11.4244 16.2736 11.0391 15.8883 10.8383 15.4034Z" />
    <path d="M2.52591 15.4034C2.37525 15.0397 2.37525 14.5786 2.37525 13.6564C2.37525 12.7342 2.37525 12.2731 2.52591 11.9094C2.72679 11.4244 3.11208 11.0391 3.59703 10.8383C3.96075 10.6876 4.42184 10.6876 5.34401 10.6876C6.26619 10.6876 6.72728 10.6876 7.091 10.8383C7.57595 11.0391 7.96127 11.4244 8.16212 11.9094C8.31277 12.2731 8.31277 12.7342 8.31277 13.6564C8.31277 14.5786 8.31277 15.0397 8.16212 15.4034C7.96127 15.8883 7.57595 16.2736 7.091 16.4745C6.72728 16.6251 6.26619 16.6251 5.34401 16.6251C4.42184 16.6251 3.96075 16.6251 3.59703 16.4745C3.11208 16.2736 2.72679 15.8883 2.52591 15.4034Z" />
    <path d="M2.52591 7.09075C2.37525 6.72703 2.37525 6.26594 2.37525 5.34376C2.37525 4.42158 2.37525 3.96049 2.52591 3.59678C2.72679 3.11182 3.11208 2.72653 3.59703 2.52565C3.96075 2.375 4.42184 2.375 5.34401 2.375C6.26619 2.375 6.72728 2.375 7.091 2.52565C7.57595 2.72653 7.96127 3.11182 8.16212 3.59678C8.31277 3.96049 8.31277 4.42158 8.31277 5.34376C8.31277 6.26594 8.31277 6.72703 8.16212 7.09075C7.96127 7.5757 7.57595 7.96102 7.091 8.16187C6.72728 8.31252 6.26619 8.31252 5.34401 8.31252C4.42184 8.31252 3.96075 8.31252 3.59703 8.16187C3.11208 7.96102 2.72679 7.5757 2.52591 7.09075Z" />
  </svg>
);

const IconLiveFeed = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.50001 11.0833C10.3745 11.0833 11.0833 10.3745 11.0833 9.50001C11.0833 8.62555 10.3745 7.91667 9.50001 7.91667C8.62555 7.91667 7.91667 8.62555 7.91667 9.50001C7.91667 10.3745 8.62555 11.0833 9.50001 11.0833Z" />
    <path d="M5.9375 6.33333C5.14583 7.125 4.75 8.31251 4.75 9.50001C4.75 10.6875 5.14583 11.875 5.9375 12.6667" />
    <path d="M3.56251 4.75C2.375 5.9375 1.58333 7.52084 1.58333 9.50002C1.58333 11.4792 2.375 13.0625 3.56251 14.25" />
    <path d="M13.0624 12.6667C13.854 11.875 14.2499 10.6875 14.2499 9.50001C14.2499 8.31251 13.854 7.125 13.0624 6.33333" />
    <path d="M15.4376 14.25C16.6251 13.0625 17.4168 11.4792 17.4168 9.50002C17.4168 7.52084 16.6251 5.9375 15.4376 4.75" />
  </svg>
);

const IconAnalytics = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.54192 13.4583V10.2917" />
    <path d="M9.5 13.4584V5.54167" />
    <path d="M13.4586 13.4584V8.70833" />
    <path d="M1.97904 9.50015C1.97904 5.95479 1.97904 4.18211 3.08044 3.0807C4.18185 1.97929 5.95453 1.97929 9.4999 1.97929C13.0452 1.97929 14.8179 1.97929 15.9194 3.0807C17.0208 4.18211 17.0208 5.95479 17.0208 9.50015C17.0208 13.0455 17.0208 14.8182 15.9194 15.9196C14.8179 17.021 13.0452 17.021 9.4999 17.021C5.95453 17.021 4.18185 17.021 3.08044 15.9196C1.97904 14.8182 1.97904 13.0455 1.97904 9.50015Z" />
  </svg>
);

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
    <path d="M16.8759 5.6535L16.4852 4.97536C16.1896 4.46249 16.0419 4.20606 15.7905 4.1038C15.5391 4.00155 15.2547 4.08224 14.686 4.24361L13.72 4.51571C13.357 4.59944 12.976 4.55194 12.6446 4.38161L12.3778 4.22773C12.0936 4.04565 11.8749 3.7772 11.7538 3.46165L11.4895 2.67205C11.3157 2.14954 11.2287 1.88828 11.0218 1.73884C10.8149 1.58941 10.5401 1.58941 9.99032 1.58941H9.10777C8.55811 1.58941 8.28325 1.58941 8.0763 1.73884C7.8694 1.88828 7.78248 2.14954 7.60866 2.67205L7.34427 3.46165C7.22324 3.7772 7.00458 4.04565 6.72031 4.22773L6.45361 4.38161C6.1221 4.55194 5.74119 4.59944 5.37812 4.51571L4.4121 4.24361C3.84341 4.08224 3.55908 4.00155 3.30766 4.1038C3.05624 4.20606 2.90848 4.46249 2.61295 4.97536L2.2222 5.6535C1.94519 6.13425 1.80668 6.37462 1.83356 6.6305C1.86044 6.88639 2.04586 7.09259 2.41671 7.50501L3.23295 8.41755C3.43245 8.67009 3.57409 9.11026 3.57409 9.50601C3.57409 9.90193 3.4325 10.3419 3.23297 10.5946L2.41671 11.5071C2.04586 11.9196 1.86045 12.1257 1.83356 12.3817C1.80668 12.6375 1.94519 12.8779 2.2222 13.3586L2.61295 14.0367C2.90847 14.5496 3.05624 14.8061 3.30766 14.9083C3.55908 15.0106 3.84342 14.9299 4.41212 14.7685L5.37809 14.4964C5.74122 14.4126 6.1222 14.4602 6.45375 14.6306L6.72041 14.7845C7.00463 14.9666 7.22323 15.2349 7.34425 15.5505L7.60866 16.3402C7.78248 16.8627 7.8694 17.1239 8.0763 17.2734C8.28325 17.4228 8.55811 17.4228 9.10777 17.4228H9.99032C10.5401 17.4228 10.8149 17.4228 11.0218 17.2734C11.2287 17.1239 11.3157 16.8627 11.4895 16.3402L11.7539 15.5505C11.8749 15.2349 12.0935 14.9666 12.3778 14.7845L12.6444 14.6306C12.9759 14.4602 13.3569 14.4126 13.72 14.4964L14.686 14.7685C15.2547 14.9299 15.5391 15.0106 15.7905 14.9083C16.0419 14.8061 16.1896 14.5496 16.4852 14.0367L16.8759 13.3586C17.153 12.8779 17.2914 12.6375 17.2646 12.3817C17.2377 12.1257 17.0523 11.9196 16.6814 11.5071L15.8651 10.5946C15.6656 10.3419 15.524 9.90193 15.524 9.50601C15.524 9.11026 15.6657 8.67009 15.8651 8.41755L16.6814 7.50501C17.0523 7.09259 17.2377 6.88639 17.2646 6.6305C17.2914 6.37462 17.153 6.13425 16.8759 5.6535Z" />
    <path d="M12.2859 9.49988C12.2859 11.0302 11.0453 12.2707 9.51504 12.2707C7.98474 12.2707 6.74422 11.0302 6.74422 9.49988C6.74422 7.96959 7.98474 6.72904 9.51504 6.72904C11.0453 6.72904 12.2859 7.96959 12.2859 9.49988Z" strokeWidth="1.15" />
  </svg>
);

const IconPricing = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.597 11.875C3.33833 11.875 4.74996 13.2866 4.74996 15.028" />
    <path d="M14.25 15.028V14.9552C14.25 13.2541 15.6291 11.875 17.3302 11.875" />
    <path d="M4.74996 3.972C4.74996 5.71333 3.33833 7.12496 1.597 7.12496" />
    <path d="M14.25 3.972C14.25 5.69809 15.6505 7.10022 17.371 7.12464" />
    <path d="M12.6667 3.95833H6.33335C4.09417 3.95833 2.97458 3.95833 2.27896 4.65396C1.58333 5.34958 1.58333 6.46917 1.58333 8.70835V10.2917C1.58333 12.5308 1.58333 13.6504 2.27896 14.3461C2.97458 15.0417 4.09417 15.0417 6.33335 15.0417H12.6667C14.9059 15.0417 16.0254 15.0417 16.7211 14.3461C17.4167 13.6504 17.4167 12.5308 17.4167 10.2917V8.70835C17.4167 6.46917 17.4167 5.34958 16.7211 4.65396C16.0254 3.95833 14.9059 3.95833 12.6667 3.95833Z" />
    <path d="M11.8753 9.50001C11.8753 10.8117 10.812 11.875 9.50026 11.875C8.18854 11.875 7.12525 10.8117 7.12525 9.50001C7.12525 8.18829 8.18854 7.125 9.50026 7.125C10.812 7.125 11.8753 8.18829 11.8753 9.50001Z" />
  </svg>
);

const IconBilling = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
    <path d="M2.6485 12.8233L12.8048 2.66697M14.7499 8.75249L13.0086 10.4938M11.5225 11.9622L10.7477 12.737" />
    <path d="M2.51329 12.7784C1.27335 11.5385 1.27335 9.52814 2.51329 8.28822L8.28822 2.51329C9.52814 1.27335 11.5385 1.27335 12.7784 2.51329L16.4868 6.22166C17.7267 7.46159 17.7267 9.47193 16.4868 10.7118L10.7118 16.4868C9.47193 17.7267 7.46159 17.7267 6.22166 16.4868L2.51329 12.7784Z" strokeWidth="1.15" />
    <path d="M3.16667 17.4167H15.8334" />
  </svg>
);

const IconAgents = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 3.16667V1.58333" />
    <path d="M15.042 17.4169C15.042 14.3563 12.5609 11.8753 9.50027 11.8753C6.43969 11.8753 3.95859 14.3563 3.95859 17.4169" />
    <path d="M7.52096 5.93763H7.52886M11.4714 5.93763H11.4793" strokeWidth="1.53" />
    <path d="M4.35429 5.27779C4.35429 4.78697 4.35429 4.54155 4.40825 4.34021C4.55465 3.79381 4.98144 3.36702 5.52783 3.22062C5.72918 3.16667 5.9746 3.16667 6.46541 3.16667H12.5349C13.0257 3.16667 13.2711 3.16667 13.4724 3.22062C14.0188 3.36702 14.4456 3.79381 14.5921 4.34021C14.646 4.54155 14.646 4.78697 14.646 5.27779C14.646 6.25943 14.646 6.75025 14.5381 7.15294C14.2453 8.2457 13.3917 9.09928 12.2989 9.39212C11.8962 9.50002 11.4054 9.50002 10.4238 9.50002H8.5765C7.59489 9.50002 7.10407 9.50002 6.70137 9.39212C5.60858 9.09928 4.75501 8.2457 4.4622 7.15294C4.35429 6.75025 4.35429 6.25943 4.35429 5.27779Z" />
  </svg>
);

const IconMembers = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.2914 8.7086C10.2914 6.95969 8.87364 5.54192 7.12476 5.54192C5.37585 5.54192 3.95808 6.95969 3.95808 8.7086C3.95808 10.4575 5.37585 11.8753 7.12476 11.8753C8.87364 11.8753 10.2914 10.4575 10.2914 8.7086Z" />
    <path d="M8.73914 5.98347C8.71896 5.83918 8.70859 5.69177 8.70859 5.54193C8.70859 3.79302 10.1264 2.37525 11.8753 2.37525C13.6241 2.37525 15.0419 3.79302 15.0419 5.54193C15.0419 7.29084 13.6241 8.70861 11.8753 8.70861C11.2858 8.70861 10.734 8.54758 10.2614 8.26709" />
    <path d="M11.8753 16.6253C11.8753 14.0019 9.74862 11.8753 7.12527 11.8753C4.50191 11.8753 2.37525 14.0019 2.37525 16.6253" />
    <path d="M16.6253 13.4586C16.6253 10.8352 14.4986 8.70859 11.8753 8.70859" />
  </svg>
);

const iconMap: Record<string, () => JSX.Element> = {
  overview: IconOverview,
  agents: IconAgents,
  'live-feed': IconLiveFeed,
  analytics: IconAnalytics,
  members: IconMembers,
  settings: IconSettings,
  pricing: IconPricing,
  billing: IconBilling,
};

const sidebarMain = [
  { iconKey: 'overview', label: 'Overview', href: '/dashboard' },
  { iconKey: 'agents', label: 'Agents', href: '/dashboard/agents' },
  { iconKey: 'live-feed', label: 'Live Feed', href: '/dashboard/live-feed' },
  { iconKey: 'analytics', label: 'Analytics', href: '/dashboard/analytics' },
  { iconKey: 'members', label: 'Members', href: '/dashboard/members' },
];

const sidebarSettings = [
  { iconKey: 'settings', label: 'Settings', href: '/dashboard/settings' },
  { iconKey: 'pricing', label: 'Pricing', href: '/dashboard/pricing' },
  { iconKey: 'billing', label: 'Billing', href: '/dashboard/billing' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F0EFED]">
      {/* ─── Top navbar (sticky) ────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#F0EFED] px-[7px] pt-[7px] pb-[1px]">
        <div className="bg-white border border-[#E2E1DC] rounded-[14px] h-[59px] flex items-center justify-between px-[25px]">
          <div className="flex items-center gap-[10px]">
            {/* Mobile hamburger */}
            <button
              className="sm:hidden w-[32px] h-[32px] flex items-center justify-center"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <div className="space-y-[5px]">
                <div className="w-[18px] h-[2px] bg-[#111110] rounded" />
                <div className="w-[18px] h-[2px] bg-[#111110] rounded" />
                <div className="w-[14px] h-[2px] bg-[#111110] rounded" />
              </div>
            </button>
            <span
              className="text-[23.6px] tracking-[-0.027em] text-black leading-[1.15]"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              ClawProxy
            </span>
          </div>
          <div
            className="h-[19px] px-[10px] flex items-center justify-center rounded-[26px]"
            style={{ backgroundColor: '#F3EEFF', border: '1px solid #7C3AED' }}
          >
            <span
              className="text-[10px] leading-[1.15] text-[#7C3AED] uppercase"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', letterSpacing: '0.07em' }}
            >
              Team
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main layout ─────────────────────────────────────────── */}
      <div className="flex px-[7px] pt-[5px] pb-[7px] gap-0">

        {/* ─── Mobile sidebar overlay ──────────────────────────── */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 sm:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ─── Sidebar ─────────────────────────────────────────── */}
        <aside
          className={`
            fixed sm:relative z-50 sm:z-auto
            top-0 left-0 h-full sm:h-auto
            w-[284px] min-w-[284px]
            bg-white sm:bg-transparent border border-[#E2E1DC] sm:border-none rounded-[12px] sm:rounded-none shadow-claw-sm sm:shadow-none
            sm:self-start sm:sticky sm:top-[78px]
            transition-transform duration-300
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          `}
        >
          <div className="px-[16px] pt-[16px] pb-[16px]">
            {/* Main Menu */}
            <div
              className="text-[12.2px] leading-[1.33] text-[#959595] mb-[8px] px-[16px]"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              MAIN MENU
            </div>
            <nav className="flex flex-col gap-[2px]">
              {sidebarMain.map((item) => {
                const Icon = iconMap[item.iconKey];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-[10px] px-[16px] py-[10px] rounded-[8px] transition ${
                      isActive(item.href)
                        ? 'text-[#0A7631]'
                        : 'text-[#959595] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <Icon />
                    <span
                      className="text-[14.3px] leading-[1.43]"
                      style={{ fontFamily: 'PP Mondwest, serif' }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Settings */}
            <div
              className="text-[12.2px] leading-[1.33] text-[#959595] mb-[8px] px-[16px] mt-[16px]"
              style={{ fontFamily: 'PP Mondwest, serif' }}
            >
              SETTINGS
            </div>
            <nav className="flex flex-col gap-[2px]">
              {sidebarSettings.map((item) => {
                const Icon = iconMap[item.iconKey];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-[10px] px-[16px] py-[10px] rounded-[8px] transition ${
                      isActive(item.href)
                        ? 'text-[#0A7631]'
                        : 'text-[#959595] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <Icon />
                    <span
                      className="text-[14.3px] leading-[1.43]"
                      style={{ fontFamily: 'PP Mondwest, serif' }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ─── Main content ────────────────────────────────────── */}
        <main className="flex-1 sm:pl-[5px] min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
