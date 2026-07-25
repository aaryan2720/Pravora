'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChefHat, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui';

const steps = [
  { key: 'type', label: 'Restaurant Type', path: '/onboarding/type' },
  { key: 'service-model', label: 'Service Model', path: '/onboarding/service-model' },
  { key: 'profile', label: 'Business Profile', path: '/onboarding/profile' },
  { key: 'capacity', label: 'Capacity', path: '/onboarding/capacity' },
  { key: 'menu', label: 'Menu Setup', path: '/onboarding/menu' },
  { key: 'billing', label: 'Billing', path: '/onboarding/billing' },
  { key: 'reservations', label: 'Reservations', path: '/onboarding/reservations' },
  { key: 'membership', label: 'Membership', path: '/onboarding/membership' },
  { key: 'ai', label: 'AI Setup', path: '/onboarding/ai' },
  { key: 'tables', label: 'Tables & QR', path: '/onboarding/tables' },
  { key: 'review', label: 'Review', path: '/onboarding/review' },
];

export default function OnboardingLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentIdx = steps.findIndex(s => pathname.endsWith(s.key));
  const current = steps[currentIdx];
  const progress = ((currentIdx + 1) / steps.length) * 100;

  const goNext = () => {
    if (currentIdx < steps.length - 1) router.push(steps[currentIdx + 1].path);
    else router.push('/dashboard');
  };
  const goPrev = () => {
    if (currentIdx > 0) router.push(steps[currentIdx - 1].path);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 h-16 flex items-center gap-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <ChefHat size={14} className="text-slate-900" />
          </div>
          <span className="font-bold text-base text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>ServeLoop</span>
        </Link>
        <div className="flex-1 mx-6">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500">Step {currentIdx + 1} of {steps.length}</span>
            <span className="text-xs text-amber-400 font-medium">{current?.label}</span>
          </div>
        </div>
        <Link href="/dashboard">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all" title="Skip setup">
            <X size={18} />
          </button>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Step sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-slate-800 bg-slate-900/50 py-6 px-4 flex-shrink-0">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-4 px-2">Setup Steps</p>
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => router.push(s.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 text-left transition-all ${
                i === currentIdx
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : i < currentIdx
                  ? 'text-emerald-400 hover:bg-slate-800'
                  : 'text-slate-600 cursor-default'
              }`}
            >
              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${
                i < currentIdx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                i === currentIdx ? 'bg-amber-500 text-slate-900' :
                'bg-slate-800 text-slate-600'
              }`}>
                {i < currentIdx ? '✓' : i + 1}
              </span>
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            {children}
          </div>
        </main>

        {/* AI Panel — desktop */}
        <aside className="hidden xl:flex flex-col w-72 border-l border-slate-800 bg-slate-900/30 p-6 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles size={14} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-slate-300">Gemini AI Guide</span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="rounded-xl bg-violet-500/8 border border-violet-500/15 p-4 text-sm text-slate-400 leading-relaxed">
              <p className="font-medium text-slate-300 mb-1.5">Tip for this step</p>
              <p>Tell us your restaurant type accurately — it determines your default workflow configuration. You can always change it later from Settings.</p>
            </div>
            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4 text-sm text-slate-500 leading-relaxed">
              <p className="font-medium text-slate-400 mb-1.5">Gemini will analyze</p>
              <ul className="space-y-1 text-xs">
                <li>• Best service model for your type</li>
                <li>• Recommended menu structure</li>
                <li>• Optimal table configuration</li>
                <li>• AI features to enable</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer navigation */}
      <footer className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" onClick={goPrev} disabled={currentIdx === 0} className="gap-2">
          <ChevronLeft size={16} />
          Back
        </Button>
        <span className="text-xs text-slate-600 hidden sm:block">
          {steps.length - currentIdx - 1} steps remaining
        </span>
        <Button variant="primary" onClick={goNext} className="gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          {currentIdx === steps.length - 1 ? 'Launch Restaurant' : 'Continue'}
          <ChevronRight size={16} />
        </Button>
      </footer>
    </div>
  );
}
