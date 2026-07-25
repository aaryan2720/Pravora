'use client';
import { useState } from 'react';
import { QrCode, RefreshCw, Download } from 'lucide-react';

export default function TablesSetupPage() {
  const [config, setConfig] = useState({ tableCount: 16, namingScheme: 'T', fixedQR: true, qrOpens: 'menu_and_order' });
  const tables = Array.from({ length: Math.min(config.tableCount, 12) }, (_, i) => `${config.namingScheme}${i + 1}`);
  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 10 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Tables and QR setup</h2>
        <p className="text-slate-400">Each table gets a unique QR code that starts a tracked guest session. You can print and replace them any time.</p>
      </div>
      <div className="flex flex-col gap-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Number of Tables</label>
            <input className="input-base" type="number" min={1} max={500} value={config.tableCount}
              onChange={e => setConfig(c => ({...c, tableCount: +e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Table Name Prefix</label>
            <input className="input-base" placeholder="T" value={config.namingScheme}
              onChange={e => setConfig(c => ({...c, namingScheme: e.target.value}))} />
            <p className="text-xs text-slate-600 mt-1">e.g. "T" → T1, T2, T3</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">When guest scans QR, open:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[['menu_only', 'Menu Only', 'Browse menu without ordering'], ['order_only', 'Order Directly', 'Jump straight to order flow'], ['menu_and_order', 'Menu + Order', 'Browse then order (recommended)']].map(([v, label, desc]) => (
              <button key={v} onClick={() => setConfig(c => ({...c, qrOpens: v}))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${config.qrOpens === v ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                <p className={`text-sm font-semibold ${config.qrOpens === v ? 'text-amber-400' : 'text-slate-300'}`}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                {v === 'menu_and_order' && <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-amber-500 text-slate-900 rounded-full font-bold">RECOMMENDED</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QR preview grid */}
      <div>
        <p className="text-sm font-semibold text-slate-300 mb-3">Table QR Preview</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-3">
          {tables.map(t => (
            <div key={t} className="aspect-square rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center gap-1.5 hover:border-amber-500/40 transition-colors cursor-pointer">
              <QrCode size={22} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-400">{t}</span>
            </div>
          ))}
          {config.tableCount > 12 && (
            <div className="aspect-square rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-600">
              +{config.tableCount - 12} more
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
            <Download size={14} />
            Download all QR codes
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
            <RefreshCw size={14} />
            Regenerate all
          </button>
        </div>
      </div>
    </div>
  );
}
