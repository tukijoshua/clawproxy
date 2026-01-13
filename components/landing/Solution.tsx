'use client';

import { motion } from 'framer-motion';
import { Zap, Palette, Target } from 'lucide-react';

export function Solution() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Development',
      description: 'Claude Code builds what takes developers weeks in days'
    },
    {
      icon: Palette,
      title: 'Design-First Approach',
      description: "We're designers who code. Beautiful AND fast."
    },
    {
      icon: Target,
      title: 'Battle-Tested Process',
      description: '20+ products shipped. We know what works.'
    }
  ];

  return (
    <section className="py-32 bg-brand-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-brand-white mb-6">
            How Kreos Ships 10x Faster
          </h2>
          <p className="text-xl text-brand-gray-400 max-w-2xl mx-auto">
            We use Claude Code - an AI-powered development tool that's revolutionizing how products are built.
          </p>
        </motion.div>

        {/* Timeline comparison */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-brand-gray-900 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-brand-white mb-6">Traditional</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-brand-gray-700 pl-4">
                <p className="text-brand-gray-400">Week 1-2</p>
                <p className="text-brand-white">Discovery & Planning</p>
              </div>
              <div className="border-l-4 border-brand-gray-700 pl-4">
                <p className="text-brand-gray-400">Week 3-4</p>
                <p className="text-brand-white">Design</p>
              </div>
              <div className="border-l-4 border-brand-gray-700 pl-4">
                <p className="text-brand-gray-400">Week 5-12</p>
                <p className="text-brand-white">Development</p>
              </div>
              <div className="border-l-4 border-brand-gray-700 pl-4">
                <p className="text-brand-gray-400">Week 13-14</p>
                <p className="text-brand-white">Testing & Revisions</p>
              </div>
              <div className="pt-4 text-center">
                <p className="text-5xl font-bold text-red-400">14 weeks</p>
              </div>
            </div>
          </motion.div>

          {/* Kreos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-blue to-cyan-600 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-brand-white mb-6">Kreos</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-white/30 pl-4">
                <p className="text-white/70">Day 1</p>
                <p className="text-brand-white font-semibold">Discovery Call</p>
              </div>
              <div className="border-l-4 border-white/30 pl-4">
                <p className="text-white/70">Day 2-3</p>
                <p className="text-brand-white font-semibold">Design</p>
              </div>
              <div className="border-l-4 border-white/30 pl-4">
                <p className="text-white/70">Day 4-8</p>
                <p className="text-brand-white font-semibold">Build with Claude Code</p>
              </div>
              <div className="border-l-4 border-white/30 pl-4">
                <p className="text-white/70">Day 9-10</p>
                <p className="text-brand-white font-semibold">Polish & Launch</p>
              </div>
              <div className="pt-4 text-center">
                <p className="text-5xl font-bold text-brand-white">10 days</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-brand-gray-900 rounded-xl p-6"
            >
              <feature.icon className="w-12 h-12 text-brand-blue mb-4" />
              <h3 className="text-xl font-bold text-brand-white mb-2">
                {feature.title}
              </h3>
              <p className="text-brand-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-xl text-brand-gray-400 mt-12"
        >
          Result: Your competitors are still in planning meetings.{' '}
          <span className="text-brand-white font-semibold">You're already live.</span>
        </motion.p>
      </div>
    </section>
  );
}
