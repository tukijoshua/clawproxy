'use client';

import { motion } from 'framer-motion';
import { Check, Rocket, Palette, Bot, Zap } from 'lucide-react';
import Link from 'next/link';

export function Services() {
  const services = [
    {
      icon: Rocket,
      name: 'Rapid Prototype',
      price: '$5–8K',
      timeline: '3-5 days',
      popular: false,
      description: 'Perfect for:',
      points: [
        'Testing an idea before going all-in',
        'Showing investors something real',
        'Validating with actual users'
      ],
      includes: [
        'Core features built and deployed',
        'Clean, modern UI',
        'Live link you can share',
        'Basic analytics setup'
      ]
    },
    {
      icon: Palette,
      name: 'Full Product',
      price: '$12–25K',
      timeline: '7-14 days',
      popular: true,
      description: 'Perfect for:',
      points: [
        'Launching your MVP to market',
        'Shipping version 1.0',
        'Building something real, fast'
      ],
      includes: [
        'Complete product, designed & built',
        'Payment integration (Stripe)',
        'User authentication',
        'Deployed and live',
        '30 days of support & tweaks'
      ]
    },
    {
      icon: Bot,
      name: 'AI Integration',
      price: '$8–15K',
      timeline: '5-7 days',
      popular: false,
      description: 'Perfect for:',
      points: [
        'Adding AI to your existing product',
        'Upgrading with GPT or Claude',
        'Building custom AI features'
      ],
      includes: [
        'AI feature development',
        'API integration & testing',
        'Documentation for your team',
        'Optimization for speed & cost'
      ]
    },
    {
      icon: Zap,
      name: 'Design Sprint',
      price: '$3–5K',
      timeline: '2-3 days',
      popular: false,
      description: 'Perfect for:',
      points: [
        'Dev teams who need design',
        'Redesigning an existing product',
        'Creating a design system'
      ],
      includes: [
        'Complete UI/UX in Figma',
        'Component library',
        'Design system documentation',
        'Developer handoff files'
      ]
    }
  ];

  return (
    <section className="py-32 bg-brand-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-brand-black mb-6">
            How We Work With You
          </h2>
          <p className="text-xl text-brand-gray-600 max-w-2xl mx-auto">
            Choose the service that fits your needs. All projects include our signature speed and quality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-8 ${
                service.popular
                  ? 'bg-brand-black border-2 border-brand-blue'
                  : 'bg-brand-gray-50 border-2 border-transparent'
              } hover:border-brand-blue transition-colors`}
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-blue text-brand-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <service.icon className={`w-12 h-12 mb-4 ${
                service.popular ? 'text-brand-blue' : 'text-brand-gray-700'
              }`} />

              <h3 className={`text-2xl font-bold mb-2 ${
                service.popular ? 'text-brand-white' : 'text-brand-black'
              }`}>
                {service.name}
              </h3>

              <p className={`text-3xl font-bold mb-2 ${
                service.popular ? 'text-brand-white' : 'text-brand-black'
              }`}>
                {service.price}
              </p>

              <p className={`text-sm mb-6 ${
                service.popular ? 'text-brand-gray-400' : 'text-brand-gray-600'
              }`}>
                Timeline: {service.timeline}
              </p>

              <div className="mb-6">
                <p className={`font-semibold mb-3 ${
                  service.popular ? 'text-brand-white' : 'text-brand-black'
                }`}>
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.points.map((point, i) => (
                    <li key={i} className={`text-sm ${
                      service.popular ? 'text-brand-gray-400' : 'text-brand-gray-600'
                    }`}>
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <p className={`font-semibold mb-3 ${
                  service.popular ? 'text-brand-white' : 'text-brand-black'
                }`}>
                  Includes:
                </p>
                <ul className="space-y-2">
                  {service.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 ${
                        service.popular ? 'text-brand-blue' : 'text-green-600'
                      }`} />
                      <span className={`text-sm ${
                        service.popular ? 'text-brand-gray-400' : 'text-brand-gray-600'
                      }`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/start">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    service.popular
                      ? 'bg-brand-blue text-brand-white hover:bg-blue-600'
                      : 'bg-brand-black text-brand-white hover:bg-brand-gray-800'
                  }`}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
