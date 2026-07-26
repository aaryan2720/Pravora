'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically route to Step 1: Restaurant Type
    router.replace('/onboarding/type');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p>Entering onboarding portal...</p>
    </div>
  );
}
