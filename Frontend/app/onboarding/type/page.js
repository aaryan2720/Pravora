'use client';
import { useState, useEffect } from 'react';
import { Coffee, Utensils, ShoppingBag, Star } from 'lucide-react';

const types = [
  {
    id: 'cafe',
    icon: Coffee,
    label: 'Café',
    description: 'Coffee-forward casual space with light bites and a relaxed vibe.',
    examples: 'Specialty coffee, brunch spots, coworking cafés',
    color: 'amber',
  },
  {
    id: 'quick_service',
    icon: ShoppingBag,
    label: 'Quick Service',
    description: 'Fast-paced counter service. High volume, short dine-in or takeaway.',
    examples: 'Fast food, food courts, kiosks',
    color: 'sky',
  },
  {
    id: 'casual_dining',
    icon: Utensils,
    label: 'Casual Dining',
    description: 'Full-service sit-down restaurant with a complete menu and table service.',
    examples: 'Family restaurants, neighbourhood bistros, themed diners',
    color: 'jade',
  },
  {
    id: 'premium_dining',
    icon: Star,
    label: 'Premium Dining',
    description: 'Fine dining or upscale experience with curated menus and high-touch service.',
    examples: 'Fine dining, tasting menus, hotel restaurants',
    color: 'violet',
  },
];

const colorMap = {
  amber: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', icon: 'text-amber-400', ring: 'ring-amber-500/40' },
  sky: { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#38bdf8', icon: 'text-sky-400', ring: 'ring-sky-500/40' },
  jade: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399', icon: 'text-emerald-400', ring: 'ring-emerald-500/40' },
  violet: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa', icon: 'text-violet-400', ring: 'ring-violet-500/40' },
};

export default function RestaurantTypePage() {
  const [selected, setSelected] = useState('casual_dining');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_type', selected);
    }
  }, [selected]);

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 1 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          What type of restaurant is this?
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Your restaurant type sets the default workflow — service style, menu structure, and ordering flow. 
          You can fine-tune everything in the next steps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map(t => {
          const c = colorMap[t.color];
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? `ring-2 ${c.ring}`
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
              style={isSelected ? { background: c.bg, borderColor: c.border } : {}}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <t.icon size={20} style={{ color: c.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.label}</h3>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                        style={{ background: c.text, color: '#0f172a' }}>✓</div>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-2">{t.description}</p>
                  <p className="text-xs" style={{ color: c.text }}>e.g. {t.examples}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700 animate-fadeIn">
          <p className="text-sm text-slate-400">
            <span className="text-slate-200 font-medium">Selected: </span>
            {types.find(t => t.id === selected)?.label} — 
            Pravora will recommend the best onboarding path for this type.
          </p>
        </div>
      )}
    </div>
  );
}
