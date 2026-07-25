'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChefHat, ShoppingBag, Plus, Bell, Navigation, LogOut, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import { mockSession } from '@/lib/mockData';
import { Button, Card, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

const statusLabels = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10' },
  preparing: { label: 'Preparing', color: 'text-sky-400 bg-sky-500/10' },
  ready: { label: 'Ready', color: 'text-emerald-400 bg-emerald-500/10' },
  served: { label: 'Served', color: 'text-violet-400 bg-violet-500/10' },
};

export default function TableSessionPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || 'tbl_1';

  const [session, setSession] = useState(mockSession);
  const [requestingHelp, setRequestingHelp] = useState(false);
  const [requestingWater, setRequestingWater] = useState(false);

  const callWaiter = async () => {
    setRequestingHelp(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('🛎️ Waiter notified! Someone will assist you shortly.');
    setRequestingHelp(false);
  };

  const requestWater = async () => {
    setRequestingWater(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('🥤 Water request sent! Coming right up.');
    setRequestingWater(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 pb-20">
      {/* Sticky header */}
      <header className="px-4 py-3 border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Spice Garden</h1>
            <p className="text-[10px] text-slate-500">Active session · Table T1</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
          <span className="status-dot live" />
          Active Order
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        {/* Help actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="md" onClick={callWaiter} disabled={requestingHelp} className="flex-1 py-3 text-xs">
            <Bell size={14} className="text-amber-400" />
            Call Waiter
          </Button>
          <Button variant="secondary" size="md" onClick={requestWater} disabled={requestingWater} className="flex-1 py-3 text-xs">
            <span>🥤</span>
            Request Water
          </Button>
        </div>

        {/* Order history */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={12} /> Live Order Progress
          </h2>

          {session.orders.map((ord, idx) => (
            <Card key={ord.id} className="p-4 border-slate-800 bg-slate-900/70">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-semibold">Order #{idx + 1}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusLabels[ord.status].color}`}>
                  {statusLabels[ord.status].label}
                </span>
              </div>
              <div className="space-y-1.5">
                {ord.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{item.qty}× {item.name}</span>
                    <span className="text-slate-500 text-xs font-semibold">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Add more button */}
        <Link href={`/r/${slug}/menu`} className="block">
          <Button variant="secondary" size="lg" className="w-full gap-2 border-dashed border-slate-700 text-slate-400 hover:text-slate-200">
            <Plus size={16} /> Add More Items
          </Button>
        </Link>
      </main>

      {/* Sticky billing button footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/95 border-t border-slate-900 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link href={`/r/${slug}/table/${tableId}/bill`} className="flex-1">
            <button className="w-full py-4 rounded-2xl font-bold text-slate-900 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <CheckCircle size={16} /> Request Bill (₹{session.total.toLocaleString()})
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
