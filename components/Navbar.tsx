'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    // Dashboard nav
    return (
      <nav className="sticky top-0 z-50 bg-brand-white border-b border-brand-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg" />
              <span className="text-xl font-bold text-brand-black">Kreos</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-brand-gray-600 hover:text-brand-black transition"
              >
                Projects
              </Link>
              <Link
                href="/start"
                className="px-4 py-2 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
              >
                New Project
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-black/90 backdrop-blur-lg border-b border-brand-gray-800'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg" />
              <span className="text-xl font-bold text-brand-white">Kreos</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#problem"
                className="text-brand-gray-400 hover:text-brand-white transition"
              >
                How It Works
              </a>
              <a
                href="#services"
                className="text-brand-gray-400 hover:text-brand-white transition"
              >
                Services
              </a>
              <a
                href="#portfolio"
                className="text-brand-gray-400 hover:text-brand-white transition"
              >
                Portfolio
              </a>
              <a
                href="#faq"
                className="text-brand-gray-400 hover:text-brand-white transition"
              >
                FAQ
              </a>

              <Link
                href="/auth/login"
                className="text-brand-gray-400 hover:text-brand-white transition"
              >
                Sign in
              </Link>
              <Link href="/start">
                <button className="px-6 py-2 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-brand-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 z-40 bg-brand-black md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <a
                href="#problem"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-brand-white hover:text-brand-blue transition"
              >
                How It Works
              </a>
              <a
                href="#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-brand-white hover:text-brand-blue transition"
              >
                Services
              </a>
              <a
                href="#portfolio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-brand-white hover:text-brand-blue transition"
              >
                Portfolio
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-brand-white hover:text-brand-blue transition"
              >
                FAQ
              </a>

              <div className="flex flex-col gap-4 mt-4">
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="px-8 py-4 border-2 border-brand-white text-brand-white rounded-lg font-semibold text-lg w-full">
                    Sign in
                  </button>
                </Link>
                <Link href="/start" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="px-8 py-4 bg-brand-blue text-brand-white rounded-lg font-semibold text-lg w-full flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
