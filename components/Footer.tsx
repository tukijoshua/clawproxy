import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-blue rounded-lg" />
              <span className="text-xl font-bold text-brand-white">Kreos</span>
            </div>
            <p className="text-brand-gray-400 text-sm">
              AI-powered product development. Ship 10x faster.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-brand-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  Rapid Prototype
                </a>
              </li>
              <li>
                <a href="#services" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  Full Product Build
                </a>
              </li>
              <li>
                <a href="#services" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  AI Integration
                </a>
              </li>
              <li>
                <a href="#services" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  Design Sprint
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-brand-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#portfolio" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#faq" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-brand-white font-semibold mb-4">Get Started</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/start" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  Start a Project
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-brand-gray-400 hover:text-brand-white transition text-sm">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-brand-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-gray-500 text-sm">
            © 2026 Kreos.agency. All rights reserved.
          </p>
          <p className="text-brand-gray-500 text-sm">
            Built with Claude Code
          </p>
        </div>
      </div>
    </footer>
  );
}
