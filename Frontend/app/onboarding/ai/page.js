'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
export default function AIPage() {
  const [s, setS] = useState({ aiEnabled: true, demandForecast: true, menuSuggestions: true, operationalAlerts: true, managerSummaries: true, lowStockAlerts: true, historyData: false });
  const T = ({ label, desc, k }) => (
    <label className="flex items-center justify-between py-3 border-b border-slate-800 cursor-pointer">
      <div><p className="text-sm font-medium text-slate-200">{label}</p><p className="text-xs text-slate-600">{desc}</p></div>
      <div onClick={() => setS(prev => ({...prev, [k]: !prev[k]}))}>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${s[k] ? 'bg-violet-500' : 'bg-slate-700'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s[k] ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  );
  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 9 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>AI and intelligence setup</h2>
        <p className="text-slate-400">Powered by Gemini. AI is optional — your restaurant works fine without it. Enable only what creates real value.</p>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 mb-6">
        <Sparkles size={20} className="text-violet-400 flex-shrink-0" />
        <p className="text-sm text-slate-300">AI assists decisions. It never blocks basic operations — ordering, billing, and table management always work independently.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <T label="Enable Gemini AI" desc="Master switch for all AI features" k="aiEnabled" />
        <T label="Demand Forecasting" desc="Predict peak hours and item demand" k="demandForecast" />
        <T label="Menu Suggestions" desc="AI-suggested items and specials" k="menuSuggestions" />
        <T label="Operational Alerts" desc="Smart alerts for slow tables and delays" k="operationalAlerts" />
        <T label="Manager Daily Summary" desc="AI-generated daily business report" k="managerSummaries" />
        <T label="Low-Stock Predictions" desc="Predict when items will run out" k="lowStockAlerts" />
        <T label="I have historical data" desc="Upload past sales data to improve accuracy" k="historyData" />
      </div>
    </div>
  );
}
