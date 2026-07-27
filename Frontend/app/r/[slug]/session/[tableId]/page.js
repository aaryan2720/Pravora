'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChefHat, Plus, Bell, CheckCircle, Clock } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

const statusLabels = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10' },
  preparing: { label: 'Preparing', color: 'text-sky-400 bg-sky-500/10' },
  ready: { label: 'Ready', color: 'text-emerald-400 bg-emerald-500/10' },
  served: { label: 'Served', color: 'text-violet-400 bg-violet-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400 bg-rose-500/10' },
};

export default function TableSessionPage({ params }) {
  const { activeRestaurant, activeSession, setActiveSession } = useApp();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || '';

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [requestingHelp, setRequestingHelp] = useState(false);
  const [requestingWater, setRequestingWater] = useState(false);
  const [loading, setLoading] = useState(true);

  // Poll table session to sync status updates in real time
  const syncSession = async (showLoading = false) => {
    const sessionId = activeSession?._id;
    if (!sessionId) return;
    
    if (showLoading) setLoading(true);
    try {
      const res = await api.sessions.get(sessionId);
      if (res.success) {
        setSession(res.session);
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to sync session progress:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    syncSession(true);
    const interval = setInterval(() => {
      syncSession(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const callWaiter = async () => {
    setRequestingHelp(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('🛎️ Waiter notified! Someone will assist you shortly.');
    setRequestingHelp(false);
  };

  const requestWater = async () => {
    setRequestingWater(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('🥤 Water request sent! Coming right up.');
    setRequestingWater(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Connecting to kitchen timeline...</p>
      </div>
    );
  }

  // Compute live billing total
  const billTotal = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.subtotal || o.total || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 pb-20 animate-fadeIn">
      {/* Sticky header */}
      <header className="px-4 py-3 border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">{activeRestaurant?.name || 'Restaurant'}</h1>
            <p className="text-[10px] text-slate-500">Active paired session</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
          <span className="status-dot live" />
          Active Session
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        {/* Help actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="md" onClick={callWaiter} disabled={requestingHelp} className="flex-1 py-3 text-[10px] cursor-pointer">
            <Bell size={12} className="text-amber-400 mr-1.5" />
            Call Waiter
          </Button>
          <Button variant="secondary" size="md" onClick={requestWater} disabled={requestingWater} className="flex-1 py-3 text-[10px] cursor-pointer">
            <span className="mr-1.5">🥤</span>
            Water
          </Button>
          <Link href={`/r/${slug}/help`} className="flex-1">
            <Button variant="secondary" size="md" className="w-full py-3 text-[10px] cursor-pointer">
              <span className="mr-1.5">🛎️</span>
              Care Desk
            </Button>
          </Link>
        </div>

        {/* Order history */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={12} /> Live Kitchen Timeline
          </h2>

          {orders.length > 0 ? (
            orders.map((ord, idx) => (
              <Card key={ord._id || ord.id} className="p-4 border-slate-800 bg-slate-900/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 font-semibold">Order #{idx + 1}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusLabels[ord.status]?.color || 'text-amber-400'}`}>
                    {statusLabels[ord.status]?.label || 'Pending'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {ord.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{item.qty}× {item.name}</span>
                      <span className="text-slate-500 text-xs font-semibold">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-slate-600 text-sm">You haven't ordered anything yet. Let's add items from menu!</div>
          )}
        </div>

        {/* Add more button */}
        <Link href={`/r/${slug}/menu`} className="block">
          <Button variant="secondary" size="lg" className="w-full gap-2 border-dashed border-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer">
            <Plus size={16} /> Add More Items
          </Button>
        </Link>
      </main>

      {/* Sticky billing button footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/95 border-t border-slate-900 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link href={`/r/${slug}/table/${tableId}/bill`} className="flex-1">
            <button className="w-full py-4 rounded-2xl font-bold text-slate-900 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <CheckCircle size={16} /> Request Bill (₹{billTotal.toLocaleString()})
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
