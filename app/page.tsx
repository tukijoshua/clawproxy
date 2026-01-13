import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { Services } from '@/components/landing/Services';

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Solution />
      <Services />
    </main>
  );
}
