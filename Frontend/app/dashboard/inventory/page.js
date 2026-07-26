'use client';
import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Trash2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { ProgressBar, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  ok: { label: 'OK', color: 'jade', text: 'text-emerald-400' },
  low: { label: 'Low', color: 'amber', text: 'text-amber-400' },
  critical: { label: 'Critical', color: 'rose', text: 'text-rose-400' },
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', unit: 'kg', current: 10, min: 5, max: 20, notes: '' });

  const fetchInventory = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.inventory.list();
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);
  }, []);

  const critical = items.filter(i => i.status === 'critical');
  const low = items.filter(i => i.status === 'low');

  const handleCreateItem = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.unit) return;
    try {
      const res = await api.inventory.create({
        name: form.name,
        unit: form.unit,
        current: Number(form.current),
        min: Number(form.min),
        max: Number(form.max),
        notes: form.notes
      });
      if (res.success) {
        toast.success(`Created stock item: ${res.item.name}`);
        setForm({ name: '', unit: 'kg', current: 10, min: 5, max: 20, notes: '' });
        setShowAddForm(false);
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create inventory item.');
    }
  };

  const handleUpdateStock = async (item, delta) => {
    const newCurrent = Math.max(0, item.current + delta);
    try {
      const res = await api.inventory.update(item._id, { current: newCurrent });
      if (res.success) {
        toast.success(`Updated stock for ${item.name}`);
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update stock.');
    }
  };

  const handleRestock = async (item) => {
    try {
      const res = await api.inventory.update(item._id, { current: item.max });
      if (res.success) {
        toast.success(`Restocked ${item.name} to maximum limit! 📦`);
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to restock item.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const res = await api.inventory.delete(id);
      if (res.success) {
        toast.success('Removed inventory item');
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove inventory item.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading inventory list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto animate-fadeIn">
      {/* Alerts */}
      {critical.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 shadow-sm animate-fadeIn">
          <AlertTriangle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Critical Stock Alert</p>
            <p className="text-xs text-rose-400/70">{critical.map(i => i.name).join(', ')} — order immediately</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-400">{items.filter(i => i.status === 'ok').length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">In Stock</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-400">{low.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Running Low</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-rose-400">{critical.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Critical</p>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kitchen Stock Manager</p>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5 cursor-pointer">
          <Plus size={14} /> Add Stock Item
        </Button>
      </div>

      {/* Form modal or panel */}
      {showAddForm && (
        <form onSubmit={handleCreateItem} className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm animate-fadeIn">
          <p className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider text-[11px]">Create New Stock Item</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Item Name *</label>
              <input required className="input-base text-sm" placeholder="e.g. Cheese, Milk, Rice" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unit *</label>
              <input required className="input-base text-sm" placeholder="e.g. kg, L, boxes" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Stock</label>
              <input type="number" required className="input-base text-sm" min={0} value={form.current} onChange={e => setForm({...form, current: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Min Threshold</label>
                <input type="number" required className="input-base text-sm" min={0} value={form.min} onChange={e => setForm({...form, min: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Max Level</label>
                <input type="number" required className="input-base text-sm" min={1} value={form.max} onChange={e => setForm({...form, max: e.target.value})} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notes (optional)</label>
            <input className="input-base text-sm mb-4" placeholder="e.g. Keep refrigerated" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Item</Button>
          </div>
        </form>
      )}

      {/* Inventory table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <Package size={15} className="text-amber-400" />
          <span className="text-sm font-semibold text-slate-300">Stock Levels</span>
        </div>
        <div className="divide-y divide-slate-800">
          {items.map(item => {
            const s = statusConfig[item.status || 'ok'];
            const pct = Math.min(100, (item.current / item.max) * 100);
            return (
              <div key={item._id || item.id} className="px-5 py-4 flex items-center gap-4 transition-colors hover:bg-slate-950/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                    <Badge variant={item.status === 'ok' ? 'jade' : item.status === 'low' ? 'amber' : 'rose'}>{s.label}</Badge>
                    {item.notes && (
                      <span className="text-slate-600 flex items-center gap-1 text-[11px]" title={item.notes}>
                        <Info size={11} /> {item.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={item.current} max={item.max} color={item.status === 'ok' ? 'jade' : item.status === 'low' ? 'amber' : 'rose'} className="flex-1" />
                    <span className="text-xs font-semibold text-slate-400 flex-shrink-0 w-28 text-right">
                      {item.current} / {item.max} {item.unit}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Min Alert Limit: {item.min} {item.unit}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleUpdateStock(item, -1)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-bold hover:bg-slate-700 transition-all cursor-pointer">−</button>
                    <button onClick={() => handleUpdateStock(item, 5)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all cursor-pointer">+</button>
                  </div>
                  {item.status !== 'ok' && (
                    <button onClick={() => handleRestock(item)}
                      className="px-2 py-1.5 rounded-lg text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer">
                      Restock
                    </button>
                  )}
                  <button onClick={() => handleDeleteItem(item._id)} className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">
              No inventory stock items tracked. Add your first item above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
