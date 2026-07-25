'use client';
import Link from 'next/link';
import { CheckCircle2, Sparkles, ArrowRight, Rocket } from 'lucide-react';

const summary = [
  { label: 'Restaurant Type', value: 'Casual Dining', icon: '🍽️' },
  { label: 'Service Model', value: 'Hybrid (QR + Staff)', icon: '⚡' },
  { label: 'Location', value: 'Bengaluru, Karnataka', icon: '📍' },
  { label: 'Tables', value: '16 tables · 64 seats', icon: '🪑' },
  { label: 'Menu', value: '4 categories configured', icon: '📋' },
  { label: 'Billing', value: 'Pay-at-table · 18% GST', icon: '💳' },
  { label: 'Reservations', value: 'Enabled · 30-min slots', icon: '📅' },
  { label: 'Membership', value: 'Enabled · 3 tiers', icon: '⭐' },
  { label: 'AI Features', value: 'Gemini enabled · 5 features', icon: '🤖' },
];

const aiRecommendations = [
  'Enable peak-hour price boosts on weekends for beverages',
  'Create a "Lunch Special" category for 12pm–3pm availability',
  'Set up a waiting list for Friday and Saturday evenings',
  'Enable low-stock alerts for high-turnover items',
];

export default function ReviewPage() {
  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 11 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Review and launch 🚀
        </h2>
        <p className="text-slate-400">Everything looks great. Review your setup and launch your restaurant workspace.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        {summary.map(s => (
          <div key={s.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-sm font-semibold text-slate-200">{s.value}</p>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400 ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="mb-7 p-5 rounded-2xl bg-violet-500/8 border border-violet-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-300">Gemini AI Recommendations</p>
        </div>
        <div className="space-y-2">
          {aiRecommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
              {r}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">You can apply these suggestions any time from your dashboard.</p>
      </div>

      {/* Launch */}
      <Link href="/dashboard">
        <button className="w-full py-4 rounded-2xl font-bold text-lg text-slate-900 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
          <Rocket size={22} />
          Launch My Restaurant Workspace
          <ArrowRight size={20} />
        </button>
      </Link>
      <p className="text-center text-xs text-slate-600 mt-4">Your workspace is ready. Everything can be edited from your Settings page.</p>
    </div>
  );
}
