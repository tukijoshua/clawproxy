'use client';

import { motion } from 'framer-motion';
import { Zap, Palette, Target } from 'lucide-react';

export function Solution() {
  const features = [
    {
      icon: Zap,
      title: 'AI does the heavy lifting',
      description: 'Claude Code handles the code. We handle the vision, design, and polish.'
    },
    {
      icon: Palette,
      title: 'Designers who build',
      description: "Most dev shops can't design. Most design shops can't build. We do both."
    },
    {
      icon: Target,
      title: 'Proven process',
      description: '$115K built in 8 months. 20+ products shipped. We know what works.'
    }
  ];

  return (
    <section id="solution" className="py-32 bg-brand-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-brand-white mb-6">
            We found it.
          </h2>
          <p className="text-xl text-brand-gray-400 max-w-2xl mx-auto">
            Claude Code is an AI development tool that writes, tests, and deploys code.
            <br />
            <br />
            What takes traditional developers 8 weeks takes us 5 days.
            <br />
            <br />
            We're designers who learned to build with AI. So your product doesn't just work—it looks incredible.
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

          {/* ClawProxy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-blue to-cyan-600 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-brand-white mb-6">ClawProxy</h3>
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
          While your competitors are in week 3 of "discovery,"
          <br />
          <span className="text-brand-white font-semibold">you're already getting users.</span>
        </motion.p>
      </div>
    </section>
  );
}
