'use client';
import { useState } from 'react';
import { Users, Clock, CreditCard, X, QrCode } from 'lucide-react';
import { mockTables, mockOrders } from '@/lib/mockData';
import { Card, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  free: { label: 'Free', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  occupied: { label: 'Occupied', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  reserved: { label: 'Reserved', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-500' },
  paying: { label: 'Paying', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', dot: 'bg-sky-500' },
  dirty: { label: 'Needs Cleaning', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-500' },
};

function TableCard({ table, onAction, onClick }) {
  const s = statusConfig[table.status];
  return (
    <button
      onClick={() => onClick(table)}
      className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer ${s.bg} ${s.border}`}
    >
      {/* Status dot */}
      <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${s.dot}`} />

      <div className="flex items-start gap-2 mb-3">
        <span className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{table.label}</span>
        <span className={`text-xs font-semibold mt-0.5 ${s.text}`}>{s.label}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        <Users size={11} />
        {table.seats} seats
      </div>

      {table.status === 'occupied' && (
        <>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock size={11} />
            {table.waitTime}m active
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <CreditCard size={11} />
            ₹{table.billTotal.toLocaleString()}
          </div>
        </>
      )}
      {table.status === 'reserved' && (
        <div className="text-xs text-violet-300 mt-1">
          {table.guestName} · {table.reservationTime}
        </div>
      )}
      {table.status === 'paying' && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mt-1">
          <CreditCard size={11} />
          ₹{table.billTotal.toLocaleString()} — paying
        </div>
      )}
    </button>
  );
}

function TableModal({ table, onClose, onStatusChange }) {
  if (!table) return null;
  const s = statusConfig[table.status];
  const tableOrders = mockOrders.filter(o => o.tableId === table.id);
  const actions = {
    free: [{ label: 'Mark as Occupied', next: 'occupied', color: 'amber' }],
    occupied: [{ label: 'Request Bill', next: 'paying', color: 'sky' }, { label: 'Clear Table', next: 'dirty', color: 'rose' }],
    paying: [{ label: 'Mark as Paid & Clear', next: 'dirty', color: 'jade' }],
    dirty: [{ label: 'Mark as Clean', next: 'free', color: 'jade' }],
    reserved: [{ label: 'Check In Guest', next: 'occupied', color: 'amber' }, { label: 'Cancel Reservation', next: 'free', color: 'rose' }],
  };
  const btnColors = { amber: 'bg-amber-500 text-slate-900', sky: 'bg-sky-500 text-slate-900', jade: 'bg-emerald-500 text-slate-900', rose: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Table {table.label}</h2>
            <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Table info */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-lg font-black text-amber-400">{table.seats}</p>
            <p className="text-xs text-slate-500">Seats</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-lg font-black text-sky-400">{table.ordersCount}</p>
            <p className="text-xs text-slate-500">Orders</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-lg font-black text-emerald-400">₹{(table.billTotal/1000).toFixed(1)}k</p>
            <p className="text-xs text-slate-500">Bill</p>
          </div>
        </div>

        {/* Recent orders */}
        {tableOrders.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent Orders</p>
            <div className="space-y-2">
              {tableOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-800">
                  <span className="text-slate-400 truncate">{o.items.map(i => i.name).join(', ')}</span>
                  <span className={`text-xs ml-2 flex-shrink-0 ${s.text}`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
          <QrCode size={14} />
          QR: spiceloop.in/r/spice-garden/table/{table.id}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {(actions[table.status] || []).map(a => (
            <button key={a.label} onClick={() => { onStatusChange(table.id, a.next); onClose(); toast.success(`${table.label}: ${a.label}`); }}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 ${btnColors[a.color]}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TablesBoardPage() {
  const [tables, setTables] = useState(mockTables);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const updateStatus = (id, status) => setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  const filtered = filter === 'all' ? tables : tables.filter(t => t.status === filter);

  const stats = {
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    paying: tables.filter(t => t.status === 'paying').length,
    dirty: tables.filter(t => t.status === 'dirty').length,
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(stats).map(([status, count]) => {
          const s = statusConfig[status];
          return (
            <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`p-3 rounded-xl border text-center transition-all ${filter === status ? `${s.bg} ${s.border}` : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
              <p className={`text-xl font-black ${s.text}`}>{count}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{status}</p>
            </button>
          );
        })}
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filtered.map(t => (
          <TableCard key={t.id} table={t} onClick={setSelected} onAction={updateStatus} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          No tables with this status
        </div>
      )}

      {/* Modal */}
      {selected && (
        <TableModal
          table={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}
