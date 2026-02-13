'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingLayout from '../components/OnboardingLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface SetupOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
  tagBg: string;
  tagBorder: string;
  tagColor: string;
  collapsedHeight: number;
}

const TECH_OPTIONS: SetupOption[] = [
  {
    id: 'one-command',
    icon: '/images/onboarding/icon-command.svg',
    title: 'One-command setup',
    description: 'Paste one command in terminal. Auto-finds and patches your config.',
    tag: 'Fastest',
    tagBg: '#E2F3EA',
    tagBorder: '#17803D',
    tagColor: '#0C5526',
    collapsedHeight: 93,
  },
  {
    id: 'manual',
    icon: '/images/onboarding/icon-quill-write.svg',
    title: 'Edit config manually',
    description: 'We show you exactly which lines to add. Full control.',
    tag: '2 min',
    tagBg: '#EEF2FF',
    tagBorder: '#2563EB',
    tagColor: '#2563EB',
    collapsedHeight: 84,
  },
  {
    id: 'docker',
    icon: '/images/onboarding/icon-docker.svg',
    title: 'Docker / Environment variables',
    description: 'Set two env vars in your docker-compose or .env file.',
    tag: 'Docker',
    tagBg: '#F5F0FF',
    tagBorder: '#7C3AED',
    tagColor: '#7C3AED',
    collapsedHeight: 84,
  },
];

const NON_TECH_OPTIONS: SetupOption[] = [
  {
    id: 'video',
    icon: '/images/onboarding/icon-computer-video.svg',
    title: 'Watch the step-by-step video',
    description:
      'I recorded a 4-minute video showing exactly how I set it up from scratch. Follow along at your own pace.',
    tag: 'Recommended',
    tagBg: '#E2F3EA',
    tagBorder: '#0C5526',
    tagColor: '#0C5526',
    collapsedHeight: 112,
  },
  {
    id: 'upload',
    icon: '/images/onboarding/icon-cloud.svg',
    title: 'Upload your config file',
    description:
      'Upload your openclaw.json — we add ClawProxy settings and give it back. Download, replace, done.',
    tag: 'No terminal',
    tagBg: '#F5F0FF',
    tagBorder: '#7C3AED',
    tagColor: '#7C3AED',
    collapsedHeight: 95,
  },
  {
    id: 'copy-paste',
    icon: '/images/onboarding/icon-note.svg',
    title: 'Copy-paste a command',
    description:
      'Copy one command, paste it in Terminal or PowerShell. Works on Mac, Windows, Linux.',
    tag: '30 seconds',
    tagBg: '#FDF6E3',
    tagBorder: '#B8860B',
    tagColor: '#B8860B',
    collapsedHeight: 95,
  },
];

/* ── Copy button ── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-[10px] right-[10px] cursor-pointer"
    >
      <Image
        src="/images/onboarding/icon-copy.svg"
        alt="Copy"
        width={19}
        height={19}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      {copied && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-[28px] right-0 text-[12px] text-[#17803D] bg-[#E2F3EA] px-[8px] py-[4px] rounded-[4px] whitespace-nowrap"
        >
          Copied!
        </motion.span>
      )}
    </motion.button>
  );
}

/* ── Technical expanded content ── */

function OneCommandExpanded() {
  return (
    <div className="flex flex-col gap-[12px] px-[12px] sm:px-[14px] pb-[14px]">
      <div className="w-full relative" style={{ backgroundColor: '#383838', borderRadius: '5px' }}>
        <div className="px-[14px] sm:px-[20px] py-[14px] sm:py-[18px] overflow-x-auto">
          <pre
            className="text-[11.5px] sm:text-[12.5px] leading-[1.7] whitespace-pre"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E4E4E7' }}
          >
            curl -sL https://clawproxy.com/setup | bash
          </pre>
        </div>
        <CopyBtn text="curl -sL https://clawproxy.com/setup | bash" />
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EEEDE9', borderRadius: '6px' }}
      >
        <div className="p-[16px] sm:p-[21px]">
          {[
            'Open Terminal (Mac: ⌘+Space → "Terminal" / Linux: Ctrl+Alt+T)',
            'Paste the command above and press Enter',
            "When prompted, paste your API key (you'll get it next)",
            'The script finds your OpenClaw config, backs it up, and patches it',
            'Restart your OpenClaw agent: openclaw restart',
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start"
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#6B6B6A' }}
            >
              <span className="min-w-[20px] shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManualConfigExpanded() {
  return (
    <div className="flex flex-col gap-[12px] px-[12px] sm:px-[15px] pb-[15px]">
      <div className="w-full relative" style={{ backgroundColor: '#383838', borderRadius: '5px' }}>
        <div className="px-[14px] sm:px-[20px] py-[14px] sm:py-[18px] overflow-x-auto">
          <pre
            className="text-[11.5px] sm:text-[12.5px] leading-[1.7] whitespace-pre"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <span style={{ color: '#E4E4E7' }}>{'// Open ~/.openclaw/openclaw.json and add:'}</span>
            {'\n'}
            <span style={{ color: '#6EE7B7' }}>{'"apiBaseUrl": "https://api.clawproxy.com/v1",'}</span>
            {'\n'}
            <span style={{ color: '#6EE7B7' }}>{'"customHeaders": {'}</span>
            {'\n'}
            <span style={{ color: '#6EE7B7' }}>{'  "x-clawproxy-key": "YOUR_API_KEY"'}</span>
            {'\n'}
            <span style={{ color: '#6EE7B7' }}>{'}'}</span>
          </pre>
        </div>
        <CopyBtn
          text={`"apiBaseUrl": "https://api.clawproxy.com/v1",\n"customHeaders": {\n  "x-clawproxy-key": "YOUR_API_KEY"\n}`}
        />
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EEEDE9', borderRadius: '10px' }}
      >
        <div className="p-[16px] sm:p-[21px]">
          {[
            'Open your OpenClaw config: ~/.openclaw/openclaw.json',
            'Add the apiBaseUrl line (or change it if it already exists)',
            'Add the customHeaders block with your API key',
            'Save the file',
            'Restart: openclaw restart',
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start"
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#55554F' }}
            >
              <span className="min-w-[20px] shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DockerExpanded() {
  return (
    <div className="flex flex-col gap-[12px] px-[12px] sm:px-[17px] pb-[17px]">
      <div className="w-full relative" style={{ backgroundColor: '#383838', borderRadius: '7px' }}>
        <div className="px-[14px] sm:px-[20px] py-[14px] sm:py-[18px] overflow-x-auto">
          <pre
            className="text-[11.5px] sm:text-[12.5px] leading-[1.7] whitespace-pre"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <span style={{ color: '#E4E4E7' }}>{'# Add to your docker-compose.yml or .env:'}</span>
            {'\n'}
            <span style={{ color: '#6EE7B7' }}>OPENCLAW_API_BASE_URL=https://api.clawproxy.com/v1</span>
            {'\n'}
            <span style={{ color: '#6EE7B7' }}>OPENCLAW_CUSTOM_HEADERS=x-clawproxy-key:YOUR_API_KEY</span>
          </pre>
        </div>
        <CopyBtn text="OPENCLAW_API_BASE_URL=https://api.clawproxy.com/v1&#10;OPENCLAW_CUSTOM_HEADERS=x-clawproxy-key:YOUR_API_KEY" />
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EEEDE9', borderRadius: '7px' }}
      >
        <div className="p-[16px] sm:p-[21px]">
          {[
            'Open your docker-compose.yml or .env file',
            'Add the two environment variables shown above',
            'Replace YOUR_API_KEY with your actual key (coming next)',
            'Run: docker compose restart',
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start"
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#55554F' }}
            >
              <span className="min-w-[20px] shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Non-technical expanded content ── */

function VideoExpanded() {
  return (
    <div className="flex flex-col gap-[14px] sm:gap-[16px] px-[12px] sm:px-[20px] pb-[16px] sm:pb-[20px]">
      {/* Instruction list */}
      <div
        className="w-full"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EEEDE9', borderRadius: '10px' }}
      >
        <div className="p-[16px] sm:p-[21px]">
          {[
            'Watch the full video below — I walk through every single click',
            'Pause at each step and do it on your machine',
            'The video covers finding your config file, making the change, and verifying it works',
            'Total time: about 4 minutes following along',
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start"
              style={{ fontFamily: 'Aeonik Pro, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#55554F' }}
            >
              <span className="min-w-[20px] shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Video embed */}
      <div className="w-full rounded-[10px] overflow-hidden" style={{ border: '2px solid #E2E1DC' }}>
        <div
          className="w-full flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: '#383838', aspectRatio: '16/9' }}
        >
          <div
            className="w-[52px] sm:w-[64px] h-[52px] sm:h-[64px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0px 4px 20px rgba(0,0,0,0.3)' }}
          >
            <div
              className="ml-[3px] sm:ml-[4px]"
              style={{
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '13px solid #383838',
              }}
            />
          </div>
        </div>
        <div className="p-[12px] sm:p-[16px] flex items-start gap-[10px] sm:gap-[12px] bg-white">
          <div className="w-[28px] sm:w-[32px] h-[28px] sm:h-[32px] rounded-[6px] sm:rounded-[8px] shrink-0" style={{ backgroundColor: '#151518' }} />
          <div>
            <p className="text-[13px] sm:text-[14px] leading-[1.15] text-[#111110]">
              How to set up ClawProxy (step by step)
            </p>
            <p className="text-[11px] sm:text-[12px] leading-[1.15] text-[#8F8F87] mt-[4px]">
              @tukifromkl · Every click shown, no steps skipped
            </p>
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <div
        className="w-full min-h-[52px] sm:min-h-[60px] rounded-[8px] flex items-center px-[14px] sm:px-[17px] gap-[12px] sm:gap-[17px] py-[12px] sm:py-0"
        style={{ backgroundColor: '#F6FFFA', border: '1px solid #B8DBCA' }}
      >
        <Image src="/images/onboarding/icon-idea.svg" alt="" width={25} height={25} className="shrink-0" />
        <span className="text-[12px] sm:text-[13px] leading-[1.4] text-[#0C5526]">
          Tip: Open the video on your phone so you can follow along on your computer screen.
        </span>
      </div>
    </div>
  );
}

function UploadExpanded() {
  return (
    <div className="flex flex-col gap-[14px] sm:gap-[16px] px-[12px] sm:px-[20px] pb-[16px] sm:pb-[20px]">
      <div
        className="w-full"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EEEDE9', borderRadius: '10px' }}
      >
        <div className="p-[16px] sm:p-[21px]">
          {[
            'Your config file is usually at: ~/.openclaw/openclaw.json',
            'On Mac: Finder → Go → Go to Folder → ~/.openclaw',
            'On Windows: File Explorer → %USERPROFILE%\\.openclaw',
            'Upload below — we add ClawProxy settings and return it',
            'Download patched file, replace old one, restart OpenClaw',
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start"
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#55554F' }}
            >
              <span className="min-w-[20px] shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload dropzone */}
      <div
        className="w-full h-[150px] sm:h-[173px] rounded-[10px] flex flex-col items-center justify-center gap-[12px] cursor-pointer"
        style={{ backgroundColor: '#FFFFFF', border: '2px dashed #E2E1DC' }}
      >
        <Image src="/images/onboarding/icon-file-empty.svg" alt="" width={36} height={36} className="sm:w-[40px] sm:h-[40px]" />
        <span className="text-[13px] sm:text-[14px] leading-[1.15] text-[#111110]">Click to upload openclaw.json</span>
      </div>
    </div>
  );
}

function CopyPasteExpanded() {
  return (
    <div className="flex flex-col gap-[12px] px-[12px] sm:px-[20px] pb-[16px] sm:pb-[20px]">
      <div className="w-full relative" style={{ backgroundColor: '#383838', borderRadius: '7px' }}>
        <div className="px-[14px] sm:px-[20px] py-[14px] sm:py-[18px] overflow-x-auto">
          <pre
            className="text-[11.5px] sm:text-[12.5px] leading-[1.7] whitespace-pre"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <span style={{ color: '#E4E4E7' }}>curl -sL https://clawproxy.com/setup | bash</span>
            {'\n'}
            <span style={{ color: '#ADADAD' }}>{'# Windows? Use PowerShell instead:'}</span>
            {'\n'}
            <span style={{ color: '#ADADAD' }}>irm https://clawproxy.com/setup.ps1 | iex</span>
          </pre>
        </div>
        <CopyBtn text="curl -sL https://clawproxy.com/setup | bash" />
      </div>

      <div
        className="w-full"
        style={{ backgroundColor: '#FAFAF8', border: '1px solid #EEEDE9', borderRadius: '7px' }}
      >
        <div className="p-[16px] sm:p-[21px]">
          {[
            { text: 'Mac/Linux: Open Terminal (Cmd+Space → "Terminal")', bold: true },
            { text: 'Windows: Right-click Start → PowerShell', bold: true },
            { text: 'Copy the right command for your system', bold: false },
            { text: 'Paste it and press Enter', bold: false },
            { text: 'Enter your API key when asked (next screen)', bold: false },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                lineHeight: '1.7',
                fontWeight: item.bold ? 600 : 400,
                color: item.bold ? '#111110' : '#55554F',
              }}
            >
              <span className="min-w-[20px] shrink-0">{i + 1}.</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Expanded content switch ── */
function ExpandedContent({ id }: { id: string }) {
  switch (id) {
    case 'one-command':
      return <OneCommandExpanded />;
    case 'manual':
      return <ManualConfigExpanded />;
    case 'docker':
      return <DockerExpanded />;
    case 'video':
      return <VideoExpanded />;
    case 'upload':
      return <UploadExpanded />;
    case 'copy-paste':
      return <CopyPasteExpanded />;
    default:
      return null;
  }
}

/* ── Main page ── */
export default function SetupPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [role, setRole] = useState<'technical' | 'non-technical'>('technical');
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('onboarding') || '{}');
      if (stored.role) setRole(stored.role);
    } catch {
      /* ignore */
    }
  }, []);

  const options = role === 'technical' ? TECH_OPTIONS : NON_TECH_OPTIONS;

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem(
      'onboarding',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('onboarding') || '{}'),
        setupMethod: selected,
        step: 5,
      }),
    );
    router.push('/onboarding/api-key');
  };

  return (
    <OnboardingLayout currentStep={4}>
      <div className="pt-[40px] sm:pt-[69px] pb-[40px] sm:pb-[60px] flex flex-col items-center px-[16px] sm:px-0">
        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[335px] flex flex-col items-center gap-[10px]"
        >
          <h1
            className="text-[26px] sm:text-[30px] leading-[1.15] text-[#111110] text-center w-full tracking-[-0.027em]"
            style={{ fontFamily: 'PP Mondwest, serif' }}
          >
            Choose your setup method
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] text-[#55554F] text-center w-full">
            Pick what&apos;s easiest for you. They all do the same thing.
          </p>
        </motion.div>

        {/* Option cards */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[523px] mt-[32px] sm:mt-[40px] flex flex-col gap-[10px]"
        >
          {options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <div
                key={option.id}
                className="w-full rounded-[10px] overflow-hidden cursor-pointer"
                style={{
                  border: isSelected ? '2px solid #17803D' : '2px solid #E2E1DC',
                  backgroundColor: isSelected ? '#E2F3EA' : 'white',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                }}
                onClick={() => setSelected(isSelected ? null : option.id)}
              >
                {/* Card header */}
                <div className="flex items-start gap-[12px] p-[16px] sm:py-[18px] sm:px-[28px]">
                  <div className="shrink-0 mt-[2px]">
                    <Image src={option.icon} alt="" width={25} height={25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] sm:text-[14.5px] leading-[1.15] text-[#111110] block">
                      {option.title}
                    </span>
                    <span
                      className="text-[12px] sm:text-[12.5px] leading-[1.4] block mt-[4px]"
                      style={{ color: isSelected ? '#636363' : '#8F8F87' }}
                    >
                      {option.description}
                    </span>
                  </div>
                  <div
                    className="rounded-[2px] flex items-center justify-center shrink-0 mt-[2px]"
                    style={{
                      backgroundColor: option.tagBg,
                      border: `1px solid ${option.tagBorder}`,
                      padding: '3px 9px',
                    }}
                  >
                    <span
                      className="text-[10px] leading-[1.15] uppercase whitespace-nowrap"
                      style={{ color: option.tagColor, letterSpacing: '0.06em' }}
                    >
                      {option.tag}
                    </span>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isSelected && (
                    <motion.div
                      key="expanded"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                      className="overflow-hidden"
                    >
                      <ExpandedContent id={option.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Buttons */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[523px] flex items-center gap-[6px] mt-[24px] sm:mt-[28px]"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="w-[80px] sm:w-[96px] h-[43px] bg-[#F0EFED] rounded-lg flex items-center justify-center gap-[7px] cursor-pointer shrink-0"
            style={{ transition: 'background-color 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8E7E4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F0EFED')}
          >
            <Image src="/images/onboarding/icon-back-arrow.svg" alt="" width={8} height={8} />
            <span className="text-[15px] leading-[1.15] text-black" style={{ letterSpacing: '-0.013em' }}>
              Back
            </span>
          </motion.button>
          <motion.button
            whileHover={selected ? { scale: 1.01 } : {}}
            whileTap={selected ? { scale: 0.99 } : {}}
            onClick={handleContinue}
            disabled={!selected}
            className="flex-1 h-[43px] rounded-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: !selected ? 'rgba(23, 128, 61, 0.4)' : '#17803D',
              transition: 'background-color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (selected) e.currentTarget.style.backgroundColor = '#14702f';
            }}
            onMouseLeave={(e) => {
              if (selected) e.currentTarget.style.backgroundColor = '#17803D';
            }}
          >
            <span className="text-[13px] sm:text-[14px] leading-[1.15] text-white" style={{ letterSpacing: '-0.007em' }}>
              Continue →
            </span>
          </motion.button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
