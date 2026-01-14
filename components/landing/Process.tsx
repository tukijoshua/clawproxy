'use client';

import { motion } from 'framer-motion';
import { Phone, Palette, Code2, Rocket } from 'lucide-react';

export function Process() {
  const steps = [
    {
      icon: Phone,
      day: 'Day 1',
      title: 'Discovery Call',
      description: '15-30 minutes. We learn about your vision, your goals, what you need. No pitch, just real conversation.',
      details: [
        'Understand your requirements',
        'Clarify scope and features',
        'Align on timeline and budget'
      ]
    },
    {
      icon: Palette,
      day: 'Days 2-3',
      title: 'Design',
      description: 'We create the complete UI/UX in Figma. You review, we iterate until it\'s perfect.',
      details: [
        'Full UI design in Figma',
        'Fast iteration cycles',
        'You approve before we build'
      ]
    },
    {
      icon: Code2,
      day: 'Days 4-8',
      title: 'Build',
      description: 'We develop using Claude Code. Daily updates with screenshots and staging links.',
      details: [
        'AI-powered development',
        'Daily progress updates',
        'You see it as we build'
      ]
    },
    {
      icon: Rocket,
      day: 'Days 9-10',
      title: 'Polish & Launch',
      description: 'Final touches. Testing. Deployment. You\'re live. We provide 30 days of support.',
      details: [
        'Final testing and polish',
        'Deploy to production',
        '30 days of support included'
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-32 bg-brand-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-brand-black mb-6">
            How it works
          </h2>
          <p className="text-xl text-brand-gray-600 max-w-2xl mx-auto">
            From first call to launch in 7-10 days. Here's exactly what happens.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-brand-gray-300 -z-10" />
              )}

              <div className="bg-brand-white rounded-2xl p-6 h-full border-2 border-brand-gray-200 hover:border-brand-blue transition-colors">
                <div className="w-16 h-16 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
                  <step.icon className="w-8 h-8 text-brand-blue" />
                </div>

                <div className="mb-3">
                  <span className="text-sm font-semibold text-brand-blue">{step.day}</span>
                  <h3 className="text-2xl font-bold text-brand-black mt-1">{step.title}</h3>
                </div>

                <p className="text-brand-gray-600 mb-4">
                  {step.description}
                </p>

                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-gray-600">
                      <span className="text-brand-blue mt-1">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-xl text-brand-gray-700">
            That's it.
            <br />
            <span className="text-brand-black font-semibold">
              While other agencies are still in discovery, you're already live.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
