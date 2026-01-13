import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { Services } from '@/components/landing/Services';
import { FAQ } from '@/components/landing/FAQ';

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Solution />
      <Services />
      {/* Portfolio section coming soon */}
      <section id="portfolio" className="py-32 bg-brand-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-brand-white mb-6">Portfolio Coming Soon</h2>
          <p className="text-xl text-brand-gray-400">We're adding our case studies and project showcases.</p>
        </div>
      </section>
      <FAQ />
    </main>
  );
}
