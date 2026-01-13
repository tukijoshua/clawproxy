import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { Services } from '@/components/landing/Services';

export default function Home() {
  return (
    <main>
      <Hero />
      <div id="how-it-works">
        <Problem />
        <Solution />
      </div>
      <div id="services">
        <Services />
      </div>
      {/* Portfolio and FAQ sections coming soon */}
      <div id="portfolio" className="py-32 bg-brand-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-brand-white mb-6">Portfolio Coming Soon</h2>
          <p className="text-xl text-brand-gray-400">We're adding our case studies and project showcases.</p>
        </div>
      </div>
      <div id="faq" className="py-32 bg-brand-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-brand-black mb-6">FAQ Coming Soon</h2>
          <p className="text-xl text-brand-gray-600">Common questions and answers will be added here.</p>
        </div>
      </div>
    </main>
  );
}
