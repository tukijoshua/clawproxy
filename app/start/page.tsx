'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    project: '',
    name: '',
    email: '',
    company: '',
    service: '',
    timeline: '',
    budget: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    console.log('Form submitted:', formData);
    // TODO: API call to submit inquiry
    alert('Thank you! We will be in touch soon.');
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    i <= step
                      ? 'bg-brand-blue text-brand-white'
                      : 'bg-brand-gray-800 text-brand-gray-500'
                  }`}
                >
                  {i < step ? <Check className="w-6 h-6" /> : i}
                </div>
                {i < 4 && (
                  <div
                    className={`h-1 w-full mx-2 ${
                      i < step ? 'bg-brand-blue' : 'bg-brand-gray-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-brand-gray-400 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Form content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-brand-gray-900 rounded-2xl p-8"
          >
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-brand-white mb-4">
                  What are you building?
                </h2>
                <p className="text-brand-gray-400 mb-6">
                  Tell us about your project. Don't worry about details yet.
                </p>
                <textarea
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  placeholder="Example: A SaaS platform for freelancers to manage invoices..."
                  className="w-full h-40 bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2 border-brand-gray-700 focus:border-brand-blue outline-none resize-none"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-brand-white mb-4">
                  Let's get to know you
                </h2>
                <p className="text-brand-gray-400 mb-6">
                  Basic information so we can reach out.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="w-full bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2 border-brand-gray-700 focus:border-brand-blue outline-none"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Your email"
                    className="w-full bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2 border-brand-gray-700 focus:border-brand-blue outline-none"
                  />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Company (optional)"
                    className="w-full bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2 border-brand-gray-700 focus:border-brand-blue outline-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold text-brand-white mb-4">
                  What service do you need?
                </h2>
                <p className="text-brand-gray-400 mb-6">
                  Choose the option that fits your needs.
                </p>
                <div className="space-y-3">
                  {[
                    { value: 'rapid', label: 'Rapid Prototype ($5-8K, 3-5 days)' },
                    { value: 'full', label: 'Full Product Build ($12-25K, 7-14 days)' },
                    { value: 'ai', label: 'AI Integration ($8-15K, 5-7 days)' },
                    { value: 'design', label: 'Design Sprint ($3-5K, 2-3 days)' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setFormData({ ...formData, service: option.value })
                      }
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        formData.service === option.value
                          ? 'border-brand-blue bg-brand-blue/10'
                          : 'border-brand-gray-700 hover:border-brand-gray-600'
                      }`}
                    >
                      <p className="text-brand-white font-semibold">
                        {option.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-3xl font-bold text-brand-white mb-4">
                  Timeline & Budget
                </h2>
                <p className="text-brand-gray-400 mb-6">
                  When do you need this, and what's your budget?
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-brand-white font-semibold mb-2">
                      Timeline
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) =>
                        setFormData({ ...formData, timeline: e.target.value })
                      }
                      className="w-full bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2 border-brand-gray-700 focus:border-brand-blue outline-none"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP</option>
                      <option value="1-2weeks">1-2 weeks</option>
                      <option value="1month">1 month</option>
                      <option value="exploring">Just exploring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-brand-white font-semibold mb-2">
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      className="w-full bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2 border-brand-gray-700 focus:border-brand-blue outline-none"
                    >
                      <option value="">Select budget</option>
                      <option value="5-8k">$5,000 - $8,000</option>
                      <option value="8-15k">$8,000 - $15,000</option>
                      <option value="15-25k">$15,000 - $25,000</option>
                      <option value="25k+">$25,000+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-brand-gray-400 hover:text-brand-white transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              <div className="ml-auto">
                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Alternative CTA */}
        <div className="mt-8 text-center">
          <p className="text-brand-gray-400">
            Prefer to talk first?{' '}
            <a
              href="https://calendly.com/your-link"
              className="text-brand-blue hover:underline"
            >
              Book a 15-min call
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
