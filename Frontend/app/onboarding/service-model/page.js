'use client';
import { useState } from 'react';
import { UserCheck, Blend, QrCode, ChevronRight } from 'lucide-react';

const models = [
  {
    id: 'assisted',
    icon: UserCheck,
    label: 'Staff-Assisted Service',
    subtitle: 'Traditional full table service',
    description: 'Waiters take orders, handle the experience end-to-end. QR is used for menu browsing only.',
    bestFor: 'Premium dining, fine dining, upscale casual',
    features: ['Staff takes orders', 'QR for menu browsing', 'Kitchen routes via staff', 'Bill closed by waiter'],
    color: 'violet',
  },
  {
    id: 'hybrid',
    icon: Blend,
    label: 'Hybrid Service',
    subtitle: 'Self-order + staff delivery',
    description: 'Guests order via QR, staff delivers and handles bill. Best of both worlds.',
    bestFor: 'Casual dining, cafés, modern bistros',
    features: ['Guests order via QR', 'Staff delivers orders', 'Live order tracking', 'Pay-at-table or counter'],
    color: 'amber',
    recommended: true,
  },
  {
    id: 'self_service',
    icon: QrCode,
    label: 'Fully Self-Service',
    subtitle: 'End-to-end guest control',
    description: 'Guests scan, order, and pay entirely via QR. Minimal staff intervention needed.',
    bestFor: 'Quick service, food courts, cafeterias',
    features: ['Full QR ordering', 'Auto kitchen routing', 'Digital payment', 'Staff on standby'],
    color: 'jade',
  },
];

const colorMap = {
  violet: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa', ring: 'ring-violet-500/40' },
  amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24', ring: 'ring-amber-500/40' },
  jade: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#34d399', ring: 'ring-emerald-500/40' },
};

export default function ServiceModelPage() {
  const [selected, setSelected] = useState('hybrid');

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 2 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          How do you want to serve guests?
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Your service model defines how orders flow from guests to kitchen to delivery. 
          This shapes your QR setup, staff dashboard, and customer experience.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {models.map(m => {
          const c = colorMap[m.color];
          const isSelected = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected ? `ring-2 ${c.ring}` : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
              style={isSelected ? { background: c.bg, borderColor: c.border } : {}}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <m.icon size={22} style={{ color: c.text }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.label}</h3>
                    {m.recommended && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900">RECOMMENDED</span>
                    )}
                    {isSelected && <span className="ml-auto text-xs font-bold" style={{ color: c.text }}>Selected ✓</span>}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{m.subtitle}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{m.description}</p>
                  <p className="text-xs mb-3" style={{ color: c.text }}>Best for: {m.bestFor}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.features.map(f => (
                      <span key={f} className="px-2 py-1 rounded-lg text-xs bg-slate-800/80 border border-slate-700 text-slate-400">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
