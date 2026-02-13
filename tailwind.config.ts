import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
          blue: '#0066FF',
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        },
        claw: {
          bg: '#F0EFED',
          white: '#FFFFFF',
          border: '#E2E1DC',
          green: '#17803D',
          text: {
            primary: '#111110',
            secondary: '#55554F',
            muted: '#8F8F87',
            placeholder: '#B8B8B0',
          },
          input: {
            bg: '#EEEDEA',
          },
          github: '#151518',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
        mono: ['"PP Mondwest"', 'monospace'],
        body: ['"Aeonik Pro"', '"DM Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'claw-sm': '0px 1px 2px 0px rgba(0, 0, 0, 0.04)',
        'claw-md': '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
