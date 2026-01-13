'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-brand-black overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-9xl font-bold text-brand-white mb-6 leading-none">
            Products that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-cyan-400">
              ship
            </span>
            <br />
            while others plan.
          </h1>

          <p className="text-xl md:text-2xl text-brand-gray-400 mb-12 max-w-2xl mx-auto">
            We design, build, and launch products in 7 days using Claude Code.
            10x faster than traditional development.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-brand-blue text-brand-white rounded-lg font-semibold text-lg flex items-center gap-2 hover:bg-blue-600 transition"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <button className="px-8 py-4 border-2 border-brand-gray-700 text-brand-white rounded-lg font-semibold text-lg hover:border-brand-gray-500 transition">
              See How We Build
            </button>
          </div>

          <div className="mt-16 text-brand-gray-500 text-sm">
            <p>$115K built in 8 months • 20+ products shipped • 100% on-time delivery</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-brand-gray-700 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-brand-gray-500 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}
