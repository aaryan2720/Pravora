'use client';
import { useState } from 'react';
import { Search, Plus, Edit3, Leaf, X, Check } from 'lucide-react';
import { mockMenuCategories, mockMenuItems } from '@/lib/mockData';
import { Card, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const availabilityConfig = {
  available: { label: 'Available', variant: 'available', next: 'unavailable' },
  unavailable: { label: 'Unavailable', variant: 'unavailable', next: 'soon' },
  soon: { label: 'Coming Soon', variant: 'soon', next: 'available' },
};

function MenuItemCard({ item, onAvailabilityChange, onEdit }) {
  const av = availabilityConfig[item.availability];
  return (
    <div className={`p-4 rounded-xl border transition-all ${item.availability === 'unavailable' ? 'border-slate-800 bg-slate-900/40 opacity-70' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h4 className="text-sm font-bold text-white">{item.name}</h4>
            {item.isVeg ? (
              <span className="text-emerald-400 flex-shrink-0" title="Vegetarian"><Leaf size={12} /></span>
            ) : (
              <span className="w-3 h-3 rounded-sm border-2 border-rose-400 flex items-center justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              </span>
            )}
            {item.isSpecial && <Badge variant="special">Special</Badge>}
          </div>
          <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-black text-white">₹{item.price}</p>
          {item.originalPrice && <p className="text-xs text-slate-600 line-through">₹{item.originalPrice}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => onAvailabilityChange(item.id, av.next)}
          className="badge cursor-pointer hover:opacity-80 transition-opacity"
          style={{}}
        >
          <span className={`badge ${av.variant === 'available' ? 'badge-available' : av.variant === 'unavailable' ? 'badge-unavailable' : 'badge-soon'}`}>
            {av.label}
          </span>
        </button>
        <div className="flex gap-2">
          <span className="text-xs text-slate-600">{item.prepTime}m prep</span>
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
            <Edit3 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickEditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ price: item?.price || 0, availability: item?.availability || 'available', isSpecial: item?.isSpecial || false });
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">{item.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Price (₹)</label>
            <input className="input-base" type="number" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Availability</label>
            <div className="flex gap-2">
              {['available', 'unavailable', 'soon'].map(a => (
                <button key={a} onClick={() => setForm({...form, availability: a})}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${form.availability === a ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  {a === 'soon' ? 'Soon' : a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isSpecial ? 'bg-amber-500' : 'bg-slate-700'}`}
              onClick={() => setForm({...form, isSpecial: !form.isSpecial})}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isSpecial ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-medium text-slate-300">Today's Special</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => { onSave(item.id, form); onClose(); toast.success('Item updated!'); }} className="flex-1">Save</Button>
        </div>
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  const [items, setItems] = useState(mockMenuItems);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);

  const updateAvailability = (id, availability) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, availability } : i));
    const labels = { available: '✅ Marked available', unavailable: '🔴 Marked unavailable', soon: '🟡 Marked coming soon' };
    toast.success(labels[availability]);
  };

  const updateItem = (id, data) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'all' || i.categoryId === activeCategory;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = { available: items.filter(i => i.availability === 'available').length, unavailable: items.filter(i => i.availability === 'unavailable').length, soon: items.filter(i => i.availability === 'soon').length, specials: items.filter(i => i.isSpecial).length };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[['available', stats.available, 'text-emerald-400'], ['unavailable', stats.unavailable, 'text-rose-400'], ['Coming Soon', stats.soon, 'text-amber-400'], ["Today's Specials", stats.specials, 'text-amber-300']].map(([label, val, color]) => (
          <div key={label} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 capitalize">{label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-base pl-9 py-2 text-sm" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus size={14} />
          Add Item
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}>
          All ({items.length})
        </button>
        {mockMenuCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(item => (
          <MenuItemCard key={item.id} item={item} onAvailabilityChange={updateAvailability} onEdit={setEditItem} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-600">No items found</div>
      )}

      {editItem && <QuickEditModal item={editItem} onClose={() => setEditItem(null)} onSave={updateItem} />}
    </div>
  );
}
