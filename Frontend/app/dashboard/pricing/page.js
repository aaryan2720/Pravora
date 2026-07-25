'use client';
import { useState } from 'react';
import { Tag, Star, TrendingUp, Edit3, Check } from 'lucide-react';
import { mockMenuItems } from '@/lib/mockData';
import { Card, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [items, setItems] = useState(mockMenuItems);
  const [editPrices, setEditPrices] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPct, setBulkPct] = useState(10);

  const specials = items.filter(i => i.isSpecial);
  const others = items.filter(i => !i.isSpecial);

  const toggleSpecial = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isSpecial: !i.isSpecial } : i));
    const item = items.find(i => i.id === id);
    toast.success(item.isSpecial ? `${item.name} removed from specials` : `${item.name} added as Today's Special ⭐`);
  };

  const savePrice = (id) => {
    const newPrice = editPrices[id];
    if (!newPrice) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, price: +newPrice, originalPrice: i.price } : i));
    setEditPrices(prev => { const n = { ...prev }; delete n[id]; return n; });
    toast.success('Price updated instantly ✓');
  };

  const applyBulk = () => {
    setItems(prev => prev.map(i => ({ ...i, originalPrice: i.price, price: Math.round(i.price * (1 + bulkPct / 100)) })));
    toast.success(`All prices updated by +${bulkPct}%`);
    setBulkMode(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 font-semibold">
            {specials.length} Today's Specials
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-400">
            {items.length} total items
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setBulkMode(!bulkMode)}>
          <TrendingUp size={14} />
          Bulk Price Update
        </Button>
      </div>

      {/* Bulk update */}
      {bulkMode && (
        <Card className="p-5 mb-6 bg-amber-500/5 border-amber-500/20">
          <p className="text-sm font-semibold text-amber-300 mb-3">Bulk Price Adjustment</p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input type="range" min={-50} max={100} value={bulkPct} onChange={e => setBulkPct(+e.target.value)} className="accent-amber-500 w-32" />
              <span className={`text-lg font-black w-16 ${bulkPct >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>{bulkPct > 0 ? '+' : ''}{bulkPct}%</span>
            </div>
            <Button variant="primary" size="sm" onClick={applyBulk}>Apply to All</Button>
            <Button variant="ghost" size="sm" onClick={() => setBulkMode(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Today's Specials */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-amber-400" />
          <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Today's Specials</h3>
          <span className="text-xs text-slate-500">These appear first on the customer menu</span>
        </div>
        {specials.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-amber-500/20 text-center text-sm text-slate-600">
            No specials today. Toggle the star on any item below to feature it.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {specials.map(item => (
              <PriceCard key={item.id} item={item} editPrices={editPrices} setEditPrices={setEditPrices} savePrice={savePrice} toggleSpecial={toggleSpecial} />
            ))}
          </div>
        )}
      </div>

      {/* All Items */}
      <div>
        <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>All Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {others.map(item => (
            <PriceCard key={item.id} item={item} editPrices={editPrices} setEditPrices={setEditPrices} savePrice={savePrice} toggleSpecial={toggleSpecial} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceCard({ item, editPrices, setEditPrices, savePrice, toggleSpecial }) {
  const editing = item.id in editPrices;
  return (
    <div className={`p-4 rounded-xl border transition-all ${item.isSpecial ? 'bg-amber-500/8 border-amber-500/25' : 'bg-slate-900 border-slate-800'}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-slate-200 flex-1 mr-2">{item.name}</p>
        <button onClick={() => toggleSpecial(item.id)} className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${item.isSpecial ? 'text-amber-400 bg-amber-500/20' : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'}`}>
          <Star size={14} fill={item.isSpecial ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3">
        {editing ? (
          <>
            <span className="text-slate-500 text-sm">₹</span>
            <input
              className="input-base py-1.5 text-sm flex-1"
              type="number"
              value={editPrices[item.id]}
              onChange={e => setEditPrices(p => ({...p, [item.id]: e.target.value}))}
              autoFocus
            />
            <button onClick={() => savePrice(item.id)} className="p-1.5 rounded-lg bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-all">
              <Check size={14} />
            </button>
          </>
        ) : (
          <>
            <div>
              <span className="text-lg font-black text-white">₹{item.price}</span>
              {item.originalPrice && <span className="text-xs text-slate-600 line-through ml-1">₹{item.originalPrice}</span>}
            </div>
            <button onClick={() => setEditPrices(p => ({...p, [item.id]: item.price}))}
              className="ml-auto p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
              <Edit3 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
