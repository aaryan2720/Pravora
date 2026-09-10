'use client';
import { useState, useEffect } from 'react';
import { Users, Clock, CreditCard, X, QrCode, Download } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';
import { QRCodeCanvas } from 'qrcode.react';

const statusConfig = {
  free: { label: 'Free', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  occupied: { label: 'Occupied', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  reserved: { label: 'Reserved', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-500' },
  paying: { label: 'Paying', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', dot: 'bg-sky-500' },
  dirty: { label: 'Needs Cleaning', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-500' },
};

function TableCard({ table, onClick }) {
  const s = statusConfig[table.status] || statusConfig.free;
  
  return (
    <button
      onClick={() => onClick(table)}
      className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer ${s.bg} ${s.border} w-full`}
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
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <Clock size={11} />
          Active
        </div>
      )}
      {table.status === 'reserved' && table.guestName && (
        <div className="text-xs text-violet-300 mt-1 truncate">
          {table.guestName}
        </div>
      )}
    </button>
  );
}

function TableModal({ table, activeRestaurant, onClose, onStatusChange, onReset }) {
  if (!table) return null;
  const s = statusConfig[table.status] || statusConfig.free;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  const actions = {
    free: [{ label: 'Mark as Occupied', next: 'occupied', color: 'amber' }],
    occupied: [{ label: 'Request Bill / Pay', next: 'paying', color: 'sky' }, { label: 'Reset Table', next: 'reset', color: 'rose' }],
    paying: [{ label: 'Reset / Clear Table', next: 'reset', color: 'rose' }],
    dirty: [{ label: 'Mark as Clean / Reset', next: 'reset', color: 'jade' }],
    reserved: [{ label: 'Check In Guest', next: 'occupied', color: 'amber' }, { label: 'Cancel / Reset', next: 'reset', color: 'rose' }],
  };
  
  const btnColors = { 
    amber: 'bg-amber-500 text-slate-900', 
    sky: 'bg-sky-500 text-slate-900', 
    jade: 'bg-emerald-500 text-slate-900', 
    rose: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
  };

  const handleActionClick = (next) => {
    if (next === 'reset') {
      onReset(table._id);
    } else {
      onStatusChange(table._id, next);
    }
    onClose();
  };

  const qrBaseUrl = activeRestaurant?.settings?.qrBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const scanUrl = `${qrBaseUrl}/r/scan?token=${table.qrToken}`;

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-canvas-${table.label}`);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeRestaurant?.name || 'Restaurant'}_Table_${table.label}_QR.png`;
    a.click();
    toast.success(`Downloaded Table ${table.label} QR!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-modal-title"
        className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 id="table-modal-title" className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Table {table.label}</h2>
            <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close table modal"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all cursor-pointer focus-visible:outline-brand-orange"
          >
            <X size={16} />
          </button>
        </div>

        {/* Table info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-lg font-black text-amber-400">{table.seats}</p>
            <p className="text-xs text-slate-500">Seats</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-xs font-semibold text-emerald-400 truncate text-sm mt-1.5">{table.status.toUpperCase()}</p>
            <p className="text-xs text-slate-500">Status</p>
          </div>
        </div>

        {/* Live QR Section */}
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 mb-5">
          <div className="bg-white p-2.5 rounded-xl">
            <QRCodeCanvas
              id={`qr-canvas-${table.label}`}
              value={scanUrl}
              size={130}
              level="H"
            />
          </div>
          <div className="w-full text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Table QR Session Code</p>
            <p className="font-mono text-[10px] text-slate-400 select-all break-all mt-0.5">{table.qrToken}</p>
          </div>
          <button onClick={handleDownloadQR} className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            <Download size={13} /> Download QR Code Image
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {(actions[table.status] || []).map(a => (
            <button key={a.label} onClick={() => handleActionClick(a.next)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 cursor-pointer ${btnColors[a.color]}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TablesBoardPage() {
  const { activeRestaurant } = useApp();
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchTables = async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const res = await api.tables.list();
      if (res.success) {
        setTables(res.tables);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables(true);

    let interval = null;
    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (typeof document !== 'undefined' && !document.hidden) {
            fetchTables(false);
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
        fetchTables(false);
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

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.tables.updateStatus(id, status);
      if (res.success) {
        setTables(prev => prev.map(t => t._id === id ? { ...t, status } : t));
        toast.success('Table status updated!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update table status.');
    }
  };

  const handleReset = async (id) => {
    try {
      const res = await api.tables.reset(id);
      if (res.success) {
        setTables(prev => prev.map(t => t._id === id ? res.table : t));
        toast.success('Table reset successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset table.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading floor layout tables...</p>
      </div>
    );
  }

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
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${filter === status ? `${s.bg} ${s.border}` : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
              <p className={`text-xl font-black ${s.text}`}>{count}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{status}</p>
            </button>
          );
        })}
      </div>

      {/* Tables grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filtered.map(t => (
            <TableCard key={t._id} table={t} onClick={setSelected} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-600">
          No tables found with this status.
        </div>
      )}

      {/* Modal */}
      {selected && (
        <TableModal
          table={selected}
          activeRestaurant={activeRestaurant}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
