'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Receipt, QrCode, CheckCircle2 } from 'lucide-react';

export default function BillingSetupPage() {
  const [settings, setSettings] = useState({ payAtTable: true, qrPayment: false, cashPayment: true, taxIncluded: false, taxRate: 18, serviceCharge: 5, receiptEmail: true, exitScreen: true });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_billing', JSON.stringify(settings));
    }
  }, [settings]);
  const Toggle = ({ label, desc, k }) => (
    <label className="flex items-center justify-between py-3 border-b border-slate-800 cursor-pointer">
      <div><p className="text-sm font-medium text-slate-200">{label}</p><p className="text-xs text-slate-600">{desc}</p></div>
      <div onClick={() => setSettings(s => ({...s, [k]: !s[k]}))}>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${settings[k] ? 'bg-amber-500' : 'bg-slate-700'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[k] ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  );
  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 6 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Billing and payment setup</h2>
        <p className="text-slate-400">How does your restaurant handle payments? Set up your default billing flow.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[{ icon: CreditCard, label: 'Pay at Table', desc: 'Guests pay from their seat', k: 'payAtTable', color: 'amber' }, { icon: QrCode, label: 'QR Payment', desc: 'Scan to pay via UPI', k: 'qrPayment', color: 'jade' }, { icon: Receipt, label: 'Cash Payment', desc: 'Traditional cash billing', k: 'cashPayment', color: 'sky' }].map(p => (
          <button key={p.k} onClick={() => setSettings(s => ({...s, [p.k]: !s[p.k]}))}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${settings[p.k] ? 'border-amber-500/40 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
            <p.icon size={24} className={`mx-auto mb-2 ${settings[p.k] ? 'text-amber-400' : 'text-slate-500'}`} />
            <p className="text-sm font-semibold text-slate-200">{p.label}</p>
            <p className="text-xs text-slate-500">{p.desc}</p>
            {settings[p.k] && <CheckCircle2 size={14} className="text-amber-400 mx-auto mt-2" />}
          </button>
        ))}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">GST / Tax Rate (%)</label>
            <input className="input-base" type="number" min={0} max={30} value={settings.taxRate} onChange={e => setSettings(s => ({...s, taxRate: +e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Service Charge (%)</label>
            <input className="input-base" type="number" min={0} max={20} value={settings.serviceCharge} onChange={e => setSettings(s => ({...s, serviceCharge: +e.target.value}))} />
          </div>
        </div>
        <Toggle label="Prices include tax" desc="Menu prices already include GST" k="taxIncluded" />
        <Toggle label="Email receipt after payment" desc="Send digital receipt to guest" k="receiptEmail" />
        <Toggle label="Exit confirmation screen" desc="Show a polished paid-and-leaving screen" k="exitScreen" />
      </div>
      <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-500">
        <strong className="text-slate-300">Note:</strong> Split payment is not available in version one. All payment gateway integrations are configured post-setup.
      </div>
    </div>
  );
}
