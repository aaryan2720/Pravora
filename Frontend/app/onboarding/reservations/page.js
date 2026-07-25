'use client';
import { useState } from 'react';
export default function ReservationsPage() {
  const [s, setS] = useState({ reservations: true, queue: true, onlineRes: true, maxParty: 10, advanceDays: 30, slotMinutes: 30 });
  const T = ({ label, desc, k }) => (
    <label className="flex items-center justify-between py-3 border-b border-slate-800 cursor-pointer">
      <div><p className="text-sm font-medium text-slate-200">{label}</p><p className="text-xs text-slate-600">{desc}</p></div>
      <div onClick={() => setS(prev => ({...prev, [k]: !prev[k]}))}>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${s[k] ? 'bg-amber-500' : 'bg-slate-700'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s[k] ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  );
  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 7 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Reservations and queue</h2>
        <p className="text-slate-400">Reservations are included in version one. Configure how you want to handle walk-ins and bookings.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
        <T label="Accept Table Reservations" desc="Guests can book a table in advance" k="reservations" />
        <T label="Queue Management" desc="Manage walk-in waiting lists" k="queue" />
        <T label="Online Reservations" desc="Guests can reserve via your restaurant page" k="onlineRes" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['maxParty', 'Max Party Size', 1, 30], ['advanceDays', 'Book Up To (days)', 1, 90], ['slotMinutes', 'Slot Duration (min)', 15, 120]].map(([k, label, min, max]) => (
          <div key={k}>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">{label}</label>
            <input className="input-base" type="number" min={min} max={max} value={s[k]} onChange={e => setS(prev => ({...prev, [k]: +e.target.value}))} />
          </div>
        ))}
      </div>
    </div>
  );
}
