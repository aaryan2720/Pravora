'use client';
import { useState } from 'react';
import { Clock, Users, Phone, ChevronRight, Bell } from 'lucide-react';
import { mockQueue } from '@/lib/mockData';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function QueuePage() {
  const [queue, setQueue] = useState(mockQueue);
  const [form, setForm] = useState({ guestName: '', partySize: 2, phone: '' });

  const callNext = () => {
    if (queue.length === 0) return;
    const next = queue[0];
    setQueue(prev => prev.slice(1));
    toast.success(`Calling ${next.token} — ${next.guestName}`);
  };

  const addToQueue = () => {
    if (!form.guestName) return;
    const entry = {
      id: `q_${Date.now()}`,
      token: `Q0${queue.length + 1 + mockQueue.length}`,
      guestName: form.guestName,
      partySize: form.partySize,
      phone: form.phone,
      waitSince: new Date(),
      estimatedWait: (queue.length + 1) * 15,
    };
    setQueue(prev => [...prev, entry]);
    setForm({ guestName: '', partySize: 2, phone: '' });
    toast.success(`Added to queue — ${entry.token}`);
  };

  const removeFromQueue = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id));
    toast.success('Removed from queue');
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-2xl font-black text-amber-400">{queue.length}</p>
          <p className="text-xs text-slate-500">In Queue</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-2xl font-black text-sky-400">{queue.length > 0 ? queue[0].estimatedWait : 0}m</p>
          <p className="text-xs text-slate-500">Next Wait</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-2xl font-black text-emerald-400">{queue.reduce((s, q) => s + q.partySize, 0)}</p>
          <p className="text-xs text-slate-500">Total Guests</p>
        </div>
      </div>

      {/* Call next */}
      {queue.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-amber-400 font-semibold mb-1">NEXT IN QUEUE</p>
            <p className="text-xl font-black text-white">{queue[0].token} — {queue[0].guestName}</p>
            <p className="text-sm text-slate-400">{queue[0].partySize} guests · waiting {Math.floor((Date.now() - queue[0].waitSince) / 60000)}m</p>
          </div>
          <Button variant="primary" size="md" onClick={callNext} className="flex-shrink-0">
            <Bell size={15} />
            Call Now
          </Button>
        </div>
      )}

      {/* Queue list */}
      <div className="space-y-3 mb-6">
        {queue.map((q, i) => (
          <div key={q.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0">
              {q.token}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200">{q.guestName}</p>
              <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Users size={11} /> {q.partySize}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> ~{q.estimatedWait}m wait</span>
                {q.phone && <span className="flex items-center gap-1"><Phone size={11} /> {q.phone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">#{i + 1}</span>
              <button onClick={() => removeFromQueue(q.id)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-all">
                Remove
              </button>
            </div>
          </div>
        ))}
        {queue.length === 0 && (
          <div className="text-center py-12 text-slate-600">Queue is empty</div>
        )}
      </div>

      {/* Add to queue */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <p className="text-sm font-bold text-slate-300 mb-4">Add to Queue</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input className="input-base" placeholder="Guest name" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} />
          <input type="number" className="input-base" min={1} max={20} placeholder="Party size" value={form.partySize} onChange={e => setForm({...form, partySize: +e.target.value})} />
          <input className="input-base" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <Button variant="primary" size="sm" onClick={addToQueue}>Add to Queue</Button>
      </div>
    </div>
  );
}
