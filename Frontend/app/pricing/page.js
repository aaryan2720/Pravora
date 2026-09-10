'use client';
import Link from 'next/link';
import { Check, Sparkles, HelpCircle } from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import { Button, Card } from '@/components/ui';
import { useState } from 'react';

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly'); // monthly | annual

  const tiers = [
    {
      name: 'Lite',
      price: billing === 'monthly' ? '₹1,999' : '₹1,599',
      period: '/mo',
      desc: 'Perfect for small cafes, kiosks, or quick takeaway counters.',
      features: [
        'Up to 8 active table QR sessions',
        'Standard live digital menu',
        'Basic staff dashboard',
        'Standard billing & cash logs',
        'Email receipts & analytics summary'
      ],
      cta: 'Start Free Trial',
      variant: 'secondary',
    },
    {
      name: 'Pro',
      price: billing === 'monthly' ? '₹4,999' : '₹3,999',
      period: '/mo',
      desc: 'Designed for full-service restaurants needing live kitchen sync.',
      features: [
        'Unlimited active table QR sessions',
        'Kanban kitchen orders board',
        'Full table layout & seating state',
        'Loyalty & guest membership program',
        'Reservations & waiting queue dashboard',
        'Basic stock & inventory alerts',
      ],
      cta: 'Go Pro Now',
      variant: 'primary',
      badge: 'Most Popular',
    },
    {
      name: 'Ultra',
      price: billing === 'monthly' ? '₹8,999' : '₹7,199',
      period: '/mo',
      desc: 'Full suite with predictive Gemini AI forecasting & multi-branch support.',
      features: [
        'Everything in Pro plan',
        'Gemini AI peak-hour demand forecasting',
        'Gemini low-stock predictive warnings',
        'AI manager daily operations summaries',
        'Dynamic peak-hour pricing rules',
        'Multi-branch manager dashboard',
        '24/7 Priority support hotline'
      ],
      cta: 'Unlock Ultra',
      variant: 'primary',
      badge: 'AI Enabled',
      glow: true,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-900">
      <PublicNav />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Simple, <span className="gradient-text-amber">transparent pricing</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto mb-8">
            Choose the plan that fits your dining room size. Save 20% with annual billing.
          </p>

          {/* Toggle switcher */}
          <div role="group" aria-label="Billing frequency" className="inline-flex bg-slate-900 border border-slate-700/80 p-1.5 rounded-2xl mx-auto gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              aria-pressed={billing === 'monthly'}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer focus-visible:outline-brand-orange ${
                billing === 'monthly' ? 'bg-brand-orange text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              aria-pressed={billing === 'annual'}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-brand-orange ${
                billing === 'annual' ? 'bg-brand-orange text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-brand-light-orange text-brand-orange'}`}>SAVE 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((t, idx) => {
            const isPrimary = t.variant === 'primary';
            return (
              <div key={idx} className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
                t.glow 
                  ? 'border-violet-500/30 bg-slate-900/60 shadow-[0_0_40px_rgba(139,92,246,0.15)]' 
                  : isPrimary 
                  ? 'border-amber-500/30 bg-slate-900/80 shadow-[0_0_30px_rgba(245,158,11,0.08)]' 
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}>
                {t.badge && (
                  <span className={`absolute top-4 right-6 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.glow ? 'bg-violet-500 text-white' : 'bg-amber-500 text-slate-900'
                  }`}>
                    {t.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.name}</h3>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.price}</span>
                    <span className="text-slate-500 text-sm">{t.period}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{t.desc}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-6 flex-1 mb-8">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">WHAT'S INCLUDED</p>
                  <ul className="space-y-3">
                    {t.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check size={16} className={`flex-shrink-0 mt-0.5 ${t.glow ? 'text-violet-400' : 'text-amber-400'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/auth/signup" className="w-full block">
                  <Button variant={t.glow ? 'glass' : t.variant} size="lg" className={`w-full ${
                    t.glow 
                      ? 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                      : ''
                  }`}>
                    {t.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
