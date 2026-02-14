'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiKeyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/setup');
  }, [router]);

  return null;
}
