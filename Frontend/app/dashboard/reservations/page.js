'use client';
import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Users, Phone, CheckCircle, X, Loader2 } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25' },
  seated: { label: 'Seated', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/25' },
  no_show: { label: 'No Show', color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700/50' },
};

export default function ReservationsPage() {
  const { activeRestaurant } = useApp();
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ 
    guestName: '', 
    guestPhone: '', 
    date: '', 
    time: '', 
    partySize: 2, 
    notes: '' 
  });

  const fetchReservations = async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const res = await api.reservations.list();
      if (res.success) {
        setReservations(res.reservations || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reservations database.');
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(true);

    let interval = null;
    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (typeof document !== 'undefined' && !document.hidden) {
            fetchReservations(false);
          }
        }, 5000); // 5s interval for reservations
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchReservations(false);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.reservations.updateStatus(id, status);
      if (res.success) {
        setReservations(prev => prev.map(r => (r._id || r.id) === id ? { ...r, status } : r));
        toast.success(`Reservation marked as ${statusConfig[status]?.label || status}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  const addReservation = async (e) => {
    e.preventDefault();
    if (!form.guestName.trim() || !form.guestPhone.trim() || !form.date || !form.time) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!activeRestaurant?._id) return;

    try {
      const res = await api.reservations.create({
        ...form,
        restaurantId: activeRestaurant._id,
        partySize: Number(form.partySize)
      });
      if (res.success) {
        toast.success('Reservation successfully booked!');
        setShowForm(false);
        setForm({ guestName: '', guestPhone: '', date: '', time: '', partySize: 2, notes: '' });
        fetchReservations(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to book reservation.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
        <p className="text-sm">Retrieving active reservations...</p>
      </div>
    );
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div className="max-w-[900px] mx-auto animate-fadeIn pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'seated'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all ${filter === f ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-350 hover:border-slate-700'}`}>
              {f} {f !== 'all' && `(${reservations.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)} className="cursor-pointer">
          + New Reservation
        </Button>
      </div>

      {/* New reservation form */}
      {showForm && (
        <Card className="p-5 mb-5 bg-slate-900 border-slate-800 animate-fadeInUp">
          <h3 className="text-sm font-bold text-white mb-4 font-outfit" style={{ fontFamily: 'Outfit, sans-serif' }}>New Booking</h3>
          <form onSubmit={addReservation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Guest Name *</label>
                <input className="input-base" required value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} placeholder="Guest name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Phone Number *</label>
                <input className="input-base" required value={form.guestPhone} onChange={e => setForm({...form, guestPhone: e.target.value})} placeholder="+91 ..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Date *</label>
                <input type="date" className="input-base" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Time *</label>
                <input type="time" className="input-base" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Party Size *</label>
                <input type="number" min={1} max={50} className="input-base" required value={form.partySize} onChange={e => setForm({...form, partySize: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Notes</label>
                <input className="input-base" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Special requests, allergies..." />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-800/40">
              <Button type="submit" variant="primary" size="sm" className="cursor-pointer">Add Reservation</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer text-slate-400 hover:text-white">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reservations list */}
      <div className="space-y-3">
        {filtered.map(res => {
          const s = statusConfig[res.status || 'pending'] || statusConfig.pending;
          const resId = res._id || res.id;
          return (
            <div key={resId} className={`p-4 rounded-2xl border transition-all ${s.bg} animate-fadeInUp`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="text-base font-bold text-white leading-none">{res.guestName}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-current ${s.color} bg-slate-900/50`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">#{resId.slice(-4)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Users size={12} /> {res.partySize} guests</span>
                    <span className="flex items-center gap-1.5"><CalendarDays size={12} /> {res.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {res.time}</span>
                    {res.guestPhone && <span className="flex items-center gap-1.5"><Phone size={12} /> {res.guestPhone}</span>}
                  </div>
                  {res.notes && <p className="text-xs text-amber-400/80 mt-2 bg-amber-500/5 px-2.5 py-1.5 rounded-xl border border-amber-500/10 w-fit leading-relaxed">📝 {res.notes}</p>}
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {res.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(resId, 'confirmed')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer">
                        <CheckCircle size={13} /> Confirm
                      </button>
                      <button onClick={() => updateStatus(resId, 'cancelled')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-semibold hover:bg-rose-500/20 transition-all cursor-pointer">
                        <X size={13} /> Decline
                      </button>
                    </>
                  )}
                  {res.status === 'confirmed' && (
                    <button onClick={() => updateStatus(resId, 'seated')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-all cursor-pointer">
                      <Users size={13} /> Seat Guests
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl text-slate-650 text-sm">
          No bookings found matching this selection.
        </div>
      )}
    </div>
  );
}
