'use client';
import { useState } from 'react';
import { Grid3x3, Users, Zap, ChefHat, BarChart3 } from 'lucide-react';

export default function CapacityPage() {
  const [form, setForm] = useState({ tables: 16, seatsPerTable: 4, peakPerHour: 60, dailyFootfall: 200, staffPerShift: 8, kitchenStations: 3, dineInPct: 70, takeawayPct: 20, reservePct: 10 });
  const total = form.tables * form.seatsPerTable;

  const Field = ({ label, icon: Icon, value, onChange, min = 1, max = 500, helper }) => (
    <div>
      <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5 block">
        {Icon && <Icon size={14} className="text-amber-400" />}
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
          className="flex-1 accent-amber-500 cursor-pointer" />
        <input type="number" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
          className="input-base w-20 text-center py-1.5 text-sm" />
      </div>
      {helper && <p className="text-xs text-slate-600 mt-0.5">{helper}</p>}
    </div>
  );

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 4 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Restaurant size and capacity
        </h2>
        <p className="text-slate-400 leading-relaxed">
          This helps ServeLoop size your table map, optimize queue estimates, and configure the operations dashboard.
        </p>
      </div>

      {/* Live preview */}
      <div className="mb-7 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-wrap gap-6">
        <div className="text-center">
          <p className="text-2xl font-black text-amber-400">{form.tables}</p>
          <p className="text-xs text-slate-500">Tables</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-400">{total}</p>
          <p className="text-xs text-slate-500">Total Seats</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-sky-400">{form.staffPerShift}</p>
          <p className="text-xs text-slate-500">Staff / Shift</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-violet-400">{form.kitchenStations}</p>
          <p className="text-xs text-slate-500">Kitchen Stations</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Field label="Number of Tables" icon={Grid3x3} value={form.tables} min={1} max={200}
          onChange={v => setForm({...form, tables: v})} helper="Dine-in tables only, not including bar or waiting area" />
        <Field label="Average Seats per Table" icon={Users} value={form.seatsPerTable} min={1} max={20}
          onChange={v => setForm({...form, seatsPerTable: v})} />
        <Field label="Peak Visitors per Hour" icon={Zap} value={form.peakPerHour} min={1} max={500}
          onChange={v => setForm({...form, peakPerHour: v})} helper="At your busiest" />
        <Field label="Average Daily Footfall" icon={BarChart3} value={form.dailyFootfall} min={1} max={2000}
          onChange={v => setForm({...form, dailyFootfall: v})} />
        <Field label="Staff Members per Shift" icon={Users} value={form.staffPerShift} min={1} max={100}
          onChange={v => setForm({...form, staffPerShift: v})} />
        <Field label="Kitchen Stations" icon={ChefHat} value={form.kitchenStations} min={1} max={20}
          onChange={v => setForm({...form, kitchenStations: v})} helper="Separate cooking areas or lines" />

        {/* Dine-in mix */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">Service Mix</label>
          <div className="grid grid-cols-3 gap-3">
            {[['dineInPct', 'Dine-In', 'amber'], ['takeawayPct', 'Takeaway', 'sky'], ['reservePct', 'Reservations', 'violet']].map(([key, label, color]) => (
              <div key={key} className="text-center">
                <div className={`text-2xl font-black mb-1 ${color === 'amber' ? 'text-amber-400' : color === 'sky' ? 'text-sky-400' : 'text-violet-400'}`}>
                  {form[key]}%
                </div>
                <p className="text-xs text-slate-500 mb-2">{label}</p>
                <input type="range" min={0} max={100} value={form[key]}
                  onChange={e => setForm({...form, [key]: +e.target.value})}
                  className={`w-full ${color === 'amber' ? 'accent-amber-500' : color === 'sky' ? 'accent-sky-500' : 'accent-violet-500'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
