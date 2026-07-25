'use client';
import { useState } from 'react';
import { Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { mockInventory } from '@/lib/mockData';
import { ProgressBar, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  ok: { label: 'OK', color: 'jade', text: 'text-emerald-400' },
  low: { label: 'Low', color: 'amber', text: 'text-amber-400' },
  critical: { label: 'Critical', color: 'rose', text: 'text-rose-400' },
};

export default function InventoryPage() {
  const [items, setItems] = useState(mockInventory);
  const critical = items.filter(i => i.status === 'critical');
  const low = items.filter(i => i.status === 'low');

  const updateStock = (id, delta) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newCurrent = Math.max(0, i.current + delta);
      const status = newCurrent <= 0 ? 'critical' : newCurrent < i.min ? (newCurrent < i.min * 0.5 ? 'critical' : 'low') : 'ok';
      return { ...i, current: newCurrent, status };
    }));
    toast.success('Stock updated');
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Alerts */}
      {critical.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
          <AlertTriangle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Critical Stock Alert</p>
            <p className="text-xs text-rose-400/70">{critical.map(i => i.name).join(', ')} — order immediately</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-center">
          <p className="text-2xl font-black text-emerald-400">{items.filter(i => i.status === 'ok').length}</p>
          <p className="text-xs text-slate-500">In Stock</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-center">
          <p className="text-2xl font-black text-amber-400">{low.length}</p>
          <p className="text-xs text-slate-500">Running Low</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 text-center">
          <p className="text-2xl font-black text-rose-400">{critical.length}</p>
          <p className="text-xs text-slate-500">Critical</p>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <Package size={15} className="text-amber-400" />
          <span className="text-sm font-semibold text-slate-300">Stock Levels</span>
        </div>
        <div className="divide-y divide-slate-800">
          {items.map(item => {
            const s = statusConfig[item.status];
            const pct = (item.current / item.max) * 100;
            return (
              <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                    <Badge variant={item.status === 'ok' ? 'jade' : item.status === 'low' ? 'amber' : 'rose'}>{s.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={item.current} max={item.max} color={item.status === 'ok' ? 'jade' : item.status === 'low' ? 'amber' : 'rose'} className="flex-1" />
                    <span className="text-xs text-slate-500 flex-shrink-0 w-28 text-right">
                      {item.current} / {item.max} {item.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">Min threshold: {item.min} {item.unit}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => updateStock(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-bold hover:bg-slate-700 transition-all">−</button>
                  <button onClick={() => updateStock(item.id, 5)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all">+</button>
                  {item.status !== 'ok' && (
                    <button onClick={() => { updateStock(item.id, item.max - item.current); toast.success(`${item.name} restocked to max`); }}
                      className="px-2 py-1.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all ml-1">
                      Restock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
