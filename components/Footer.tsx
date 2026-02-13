'use client';

import Link from 'next/link';
import { Twitter, Mail, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-blue rounded-lg" />
              <span className="text-2xl font-bold text-brand-white">Kreos</span>
            </div>
            <p className="text-brand-gray-400 mb-6 max-w-sm">
              The #1 studio building products with Claude Code.
              Ship in 7 days, not months.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/kreosagency"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-brand-gray-900 flex items-center justify-center text-brand-gray-400 hover:text-brand-white hover:bg-brand-gray-800 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@kreos.agency"
                className="w-10 h-10 rounded-lg bg-brand-gray-900 flex items-center justify-center text-brand-gray-400 hover:text-brand-white hover:bg-brand-gray-800 transition"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-brand-white font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#services" className="text-brand-gray-400 hover:text-brand-white transition">
                  Rapid Prototype
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-brand-gray-400 hover:text-brand-white transition">
                  Full Product Build
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-brand-gray-400 hover:text-brand-white transition">
                  AI Integration
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-brand-gray-400 hover:text-brand-white transition">
                  Design Sprint
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-brand-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#portfolio" className="text-brand-gray-400 hover:text-brand-white transition">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-brand-gray-400 hover:text-brand-white transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-brand-gray-400 hover:text-brand-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="https://twitter.com/TukiFromKL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gray-400 hover:text-brand-white transition flex items-center gap-1"
                >
                  Founder
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-brand-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-gray-500 text-sm">
            © 2026 Kreos. Built with Claude Code
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-brand-gray-500 hover:text-brand-white transition">
              Privacy
            </Link>
            <Link href="#" className="text-brand-gray-500 hover:text-brand-white transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
