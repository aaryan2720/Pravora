'use client';
import { useState, useEffect } from 'react';
import { Clock, ChevronRight, CheckCircle, AlertCircle, Truck, Users } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const columns = [
  { id: 'pending', label: 'Pending', color: 'amber', headerClass: 'kanban-pending', icon: AlertCircle },
  { id: 'preparing', label: 'Preparing', color: 'sky', headerClass: 'kanban-preparing', icon: Clock },
  { id: 'ready', label: 'Ready', color: 'jade', headerClass: 'kanban-ready', icon: CheckCircle },
  { id: 'served', label: 'Served', color: 'violet', headerClass: 'kanban-served', icon: Truck },
];

const statusColors = {
  pending: 'text-amber-400',
  preparing: 'text-sky-400',
  ready: 'text-emerald-400',
  served: 'text-violet-400',
};

function KanbanCard({ order, onMove, nextStatus }) {
  const mins = Math.floor((Date.now() - new Date(order.placedAt)) / 60000);
  const isDelayed = mins > 25 && order.status !== 'served';
  const orderId = order._id || order.id;
  const subtotalVal = order.subtotal || order.total || 0;
  
  return (
    <div className={`p-4 rounded-xl border ${isDelayed ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-700 bg-slate-800/60'} transition-all hover:border-slate-600`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white">{order.tableLabel}</span>
          <span className="text-xs font-medium text-slate-500 font-mono">#{orderId.slice(-4)}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium tabular-nums ${isDelayed ? 'text-rose-400' : 'text-slate-500'}`}>
          <Clock size={11} />
          {mins >= 0 ? `${mins}m` : '0m'}
        </div>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-400"><span className="tabular-nums font-semibold">{item.qty}×</span> {item.name}</span>
            <span className="text-slate-600 tabular-nums font-medium">₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>
      {order.guestNote && (
        <p className="text-xs text-amber-400/80 bg-amber-500/8 border border-amber-500/15 rounded-lg px-2 py-1.5 mb-3">
          Note: {order.guestNote}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white tabular-nums">₹{subtotalVal.toLocaleString()}</span>
        {nextStatus && (
          <button onClick={() => onMove(orderId, nextStatus)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer">
            {nextStatus === 'preparing' ? 'Start' : nextStatus === 'ready' ? 'Mark Ready' : 'Served'}
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrdersBoardPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Poll orders from backend every 3 seconds for real-time kitchen experience
  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.orders.list();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    let interval = null;
    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (typeof document !== 'undefined' && !document.hidden) {
            fetchOrders(false);
          }
        }, 3000);
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
        fetchOrders(false);
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

  const moveOrder = async (id, newStatus) => {
    try {
      const res = await api.orders.updateStatus(id, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => (o._id === id || o.id === id) ? { ...o, status: newStatus } : o));
        const labels = { preparing: '🔥 Order started', ready: '✅ Order ready', served: '🍽️ Order served' };
        toast.success(labels[newStatus] || 'Updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading active orders board...</p>
      </div>
    );
  }

  const nextStatus = { pending: 'preparing', preparing: 'ready', ready: 'served', served: null };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-slate-500 text-sm">
            {orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length} active · {orders.filter(o => o.status === 'pending').length} need action
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'preparing', 'ready', 'served'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700'}`}>
              {f} {f !== 'all' && `(${orders.filter(o => o.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const colOrders = filtered.filter(o => o.status === col.id);
          const colRevenue = colOrders.reduce((s, o) => s + (o.subtotal || o.total || 0), 0);
          return (
            <div key={col.id} className="flex flex-col">
              <div className={`rounded-t-xl p-3 flex items-center justify-between bg-slate-900 border border-slate-800 border-b-0 ${col.headerClass}`}>
                <div className="flex items-center gap-2">
                  <col.icon size={14} className={`${statusColors[col.id]}`} />
                  <span className="text-sm font-bold text-white">{col.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${statusColors[col.id]}`}>
                  {colOrders.length}
                </span>
              </div>
              <div className="flex-1 bg-slate-900/50 border border-slate-800 border-t-0 rounded-b-xl p-3 space-y-3 min-h-[300px]">
                {colOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-slate-700">
                    No {col.label.toLowerCase()} orders
                  </div>
                ) : (
                  colOrders.map(o => (
                    <KanbanCard key={o._id || o.id} order={o} nextStatus={nextStatus[col.id]} onMove={moveOrder} />
                  ))
                )}
                {colOrders.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-600 text-right">
                    ₹{colRevenue.toLocaleString()} total
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
