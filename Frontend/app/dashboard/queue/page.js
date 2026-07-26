'use client';
import { useState, useEffect } from 'react';
import { Clock, Users, Phone, Bell, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function QueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ guestName: '', partySize: 2, phone: '' });

  const fetchQueue = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.queue.list();
      if (res.success) {
        setQueue(res.entries || []);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(true);
    // Poll queue entries every 5 seconds
    const interval = setInterval(() => {
      fetchQueue(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const callNext = () => {
    if (queue.length === 0) return;
    const next = queue[0];
    toast.success(`📢 Calling Guest ${next.token} — ${next.guestName}!`);
  };

  const addToQueue = async (e) => {
    if (e) e.preventDefault();
    if (!form.guestName) return;
    try {
      const res = await api.queue.join({
        guestName: form.guestName,
        guestPhone: form.phone || undefined,
        partySize: Number(form.partySize)
      });
      if (res.success) {
        toast.success(`Added ${res.entry.guestName} to queue! Token: ${res.entry.token}`);
        setForm({ guestName: '', partySize: 2, phone: '' });
        fetchQueue(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add guest to queue.');
    }
  };

  const seatGuest = async (id) => {
    try {
      const res = await api.queue.seat(id);
      if (res.success) {
        toast.success('Guest marked as seated! 🍽️');
        fetchQueue(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to seat guest.');
    }
  };

  const removeFromQueue = async (id) => {
    try {
      const res = await api.queue.leave(id);
      if (res.success) {
        toast.success('Removed guest from queue');
        fetchQueue(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove guest.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading queue board...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-400">{queue.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">In Queue</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-sky-400">{queue.length > 0 ? queue[0].estimatedWait : 0}m</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Est. Next Wait</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-400">{queue.reduce((s, q) => s + q.partySize, 0)}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Total Guests</p>
        </div>
      </div>

      {/* Call next */}
      {queue.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">NEXT IN QUEUE</p>
            <p className="text-xl font-black text-white">{queue[0].token} — {queue[0].guestName}</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {queue[0].partySize} guests · waiting {Math.max(0, Math.floor((Date.now() - new Date(queue[0].joinedAt)) / 60000))}m
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={callNext} className="gap-1.5 border-amber-500/20 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10">
              <Bell size={13} />
              Call
            </Button>
            <Button variant="primary" size="sm" onClick={() => seatGuest(queue[0]._id)} className="gap-1.5">
              <CheckCircle size={13} />
              Seat
            </Button>
          </div>
        </div>
      )}

      {/* Queue list */}
      <div className="space-y-3 mb-6">
        {queue.map((q, i) => {
          const waitMins = Math.max(0, Math.floor((Date.now() - new Date(q.joinedAt)) / 60000));
          return (
            <div key={q._id || q.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0">
                {q.token}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-200">{q.guestName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><Users size={12} /> {q.partySize} guests</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> waited {waitMins}m (est. {q.estimatedWait}m)</span>
                  {q.guestPhone && <span className="flex items-center gap-1"><Phone size={12} /> {q.guestPhone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">#{i + 1}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => seatGuest(q._id)} className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-all font-semibold cursor-pointer">
                    Seat
                  </button>
                  <button onClick={() => removeFromQueue(q._id)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition-all font-semibold cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {queue.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No guests in the waiting queue currently.
          </div>
        )}
      </div>

      {/* Add to queue */}
      <form onSubmit={addToQueue} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <p className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider text-[11px]">Add Guest to Queue</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Guest Name *</label>
            <input required className="input-base text-sm" placeholder="e.g. John Doe" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Party Size *</label>
            <input type="number" required className="input-base text-sm" min={1} max={30} value={form.partySize} onChange={e => setForm({...form, partySize: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number (optional)</label>
            <input className="input-base text-sm" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
        </div>
        <Button type="submit" variant="primary" size="sm">Add to Queue</Button>
      </form>
    </div>
  );
}
