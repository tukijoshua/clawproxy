'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function Problem() {
  const problems = [
    'Design phase: 2-3 weeks',
    'Development: 6-8 weeks',
    'Revisions: 2-4 weeks',
    'Total: 12+ weeks'
  ];

  return (
    <section className="py-32 bg-brand-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Problem side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-5xl font-bold text-brand-black">
              Why Traditional Agencies Are Too Slow
            </h2>

            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div key={index} className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-xl text-brand-gray-700">{problem}</p>
                </div>
              ))}
            </div>

            <p className="text-lg text-brand-gray-600 pt-6">
              By the time you launch, your competitors already shipped.
              The market moved. You're playing catch-up.
            </p>

            <p className="text-2xl font-semibold text-brand-black pt-4">
              There's a better way.
            </p>
          </motion.div>

          {/* Visual representation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-brand-gray-100 rounded-2xl p-8 space-y-4">
              <div className="h-12 bg-brand-gray-300 rounded animate-pulse" />
              <div className="h-12 bg-brand-gray-300 rounded animate-pulse delay-100" />
              <div className="h-12 bg-brand-gray-300 rounded animate-pulse delay-200" />
              <div className="h-12 bg-brand-gray-300 rounded animate-pulse delay-300" />

              <div className="pt-4 text-center">
                <p className="text-6xl font-bold text-brand-gray-400">12+</p>
                <p className="text-xl text-brand-gray-500">weeks waiting</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
