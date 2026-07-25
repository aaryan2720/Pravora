'use client';
import { useState } from 'react';
import { CalendarDays, Clock, Users, Phone, CheckCircle, X, AlertCircle } from 'lucide-react';
import { mockReservations } from '@/lib/mockData';
import { Card, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25' },
  seated: { label: 'Seated', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/25' },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(mockReservations);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guestName: '', phone: '', date: '', time: '', partySize: 2, notes: '' });

  const updateStatus = (id, status) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Reservation ${status}`);
  };

  const addReservation = () => {
    const newRes = { id: `res_${Date.now()}`, ...form, status: 'pending', createdAt: new Date() };
    setReservations(prev => [newRes, ...prev]);
    setShowForm(false);
    setForm({ guestName: '', phone: '', date: '', time: '', partySize: 2, notes: '' });
    toast.success('Reservation added!');
  };

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'seated'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}>
              {f} {f !== 'all' && `(${reservations.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>+ New Reservation</Button>
      </div>

      {/* New reservation form */}
      {showForm && (
        <Card className="p-5 mb-5 bg-slate-900">
          <h3 className="text-base font-bold text-white mb-4">New Reservation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="text-sm text-slate-300 mb-1 block">Guest Name</label><input className="input-base" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} placeholder="Guest name" /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Phone</label><input className="input-base" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Date</label><input type="date" className="input-base" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Time</label><input type="time" className="input-base" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Party Size</label><input type="number" min={1} max={20} className="input-base" value={form.partySize} onChange={e => setForm({...form, partySize: +e.target.value})} /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Notes</label><input className="input-base" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Special requests..." /></div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={addReservation}>Add Reservation</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Reservations list */}
      <div className="space-y-3">
        {filtered.map(res => {
          const s = statusConfig[res.status] || statusConfig.pending;
          return (
            <div key={res.id} className={`p-4 rounded-2xl border ${s.bg}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="text-base font-bold text-white">{res.guestName}</h4>
                    <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                    <span className="text-xs text-slate-600">#{res.id.slice(-3)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Users size={13} /> {res.partySize} guests</span>
                    <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {res.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {res.time}</span>
                    {res.phone && <span className="flex items-center gap-1.5"><Phone size={13} /> {res.phone}</span>}
                  </div>
                  {res.notes && <p className="text-xs text-amber-400/80 mt-1.5 bg-amber-500/8 px-2 py-1 rounded-lg border border-amber-500/15 w-fit">📝 {res.notes}</p>}
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {res.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(res.id, 'confirmed')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-all">
                        <CheckCircle size={13} /> Confirm
                      </button>
                      <button onClick={() => updateStatus(res.id, 'cancelled')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-semibold hover:bg-rose-500/20 transition-all">
                        <X size={13} /> Decline
                      </button>
                    </>
                  )}
                  {res.status === 'confirmed' && (
                    <button onClick={() => updateStatus(res.id, 'seated')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-all">
                      <Users size={13} /> Seat Guests
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
