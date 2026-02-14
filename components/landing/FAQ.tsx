'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How can you really build in 7 days?",
      answer: "Claude Code. It's an AI development tool that writes, tests, and deploys code. What takes traditional developers 6-8 weeks takes us 3-5 days. We focus on design, user experience, and making sure everything works perfectly. The AI handles the repetitive coding work."
    },
    {
      question: "Is the quality actually good?",
      answer: "Yes. We've built $115K worth of products in 8 months. Every client has launched on time. The difference isn't quality—it's speed. We use the same modern tech stack as top startups (Next.js, React, Tailwind). The products are production-ready, not prototypes."
    },
    {
      question: "Do you just use templates?",
      answer: "No. Every product is custom-designed for your specific needs. We build component libraries as we go, which helps with speed, but nothing is cookie-cutter. Your product looks and works exactly how you need it to."
    },
    {
      question: "What if I need changes after you deliver?",
      answer: "You get 30 days of support included with every Full Product Build. Minor tweaks, bug fixes, and small adjustments are covered. Larger features or scope changes are quoted separately. Most clients don't need major changes because we nail the requirements upfront."
    },
    {
      question: "What tech stack do you use?",
      answer: "Typically: Next.js, React, Tailwind CSS, Supabase or Firebase for backend, Vercel for deployment. But we adapt based on your needs. If you have existing infrastructure, we work with it. Claude Code works with any modern stack."
    },
    {
      question: "Can you work with my existing product?",
      answer: "Yes. That's what our AI Integration service is for. We can add features to existing products, integrate with your APIs, or upgrade parts of your system. We've worked with products built in various stacks."
    },
    {
      question: "What if I don't like the design?",
      answer: "Design is approved before we build anything. Days 2-3 are design phase—we create the complete UI in Figma. You review, we iterate until you're happy. Then we build exactly what you approved. No surprises."
    },
    {
      question: "Do you do ongoing work after launch?",
      answer: "Yes. After the initial 30 days of support, we offer monthly retainers starting at $1,500/month for ongoing updates, new features, and maintenance. Or you can hire us project-by-project for new features."
    },
    {
      question: "Why should I trust you?",
      answer: "Fair question. We're young (20) and new to some people. But we've shipped 20+ products, generated $115K in 8 months, and every client has launched on time. We work in a custom dashboard where you see daily progress. You're not waiting in the dark—you see everything as it happens."
    },
    {
      question: "What industries do you work with?",
      answer: "We've built SaaS platforms, e-commerce tools, AI-powered apps, dashboards, and marketplaces. If it's a web or mobile product, we can build it. We work with funded startups, solo founders, and established companies launching new products."
    },
    {
      question: "Do you sign NDAs?",
      answer: "Yes. If your project requires it, we'll sign an NDA before the discovery call. We take confidentiality seriously."
    },
    {
      question: "How do payments work?",
      answer: "50% upfront to start, 50% on delivery. We use Stripe for secure payment processing. For larger projects ($25K+), we can structure milestone-based payments."
    }
  ];

  return (
    <section id="faq" className="py-32 bg-brand-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-brand-black mb-6">
            Questions?
          </h2>
          <p className="text-xl text-brand-gray-600">
            Everything you need to know about working with us.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="border-2 border-brand-gray-200 rounded-xl overflow-hidden hover:border-brand-blue transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <span className="text-lg font-semibold text-brand-black pr-8">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-brand-gray-600 flex-shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-brand-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
          <p className="text-brand-gray-600 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:hello@clawproxy.ai"
            className="text-brand-blue hover:underline font-semibold text-lg"
          >
            Email us →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
