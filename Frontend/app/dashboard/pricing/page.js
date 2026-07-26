'use client';
import { useState, useEffect } from 'react';
import { Star, TrendingUp, Edit3, Check, Loader2 } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

function PriceCard({ item, editPrices, setEditPrices, savePrice, toggleSpecial }) {
  const itemId = item._id || item.id;
  const editing = itemId in editPrices;

  return (
    <div className={`p-4 rounded-xl border transition-all ${item.isSpecial ? 'bg-amber-500/8 border-amber-500/25 shadow-sm' : 'bg-slate-900 border-slate-800'} animate-fadeInUp`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-slate-200 flex-1 mr-2 truncate">{item.name}</p>
        <button onClick={() => toggleSpecial(itemId, !item.isSpecial)} className={`p-1.5 rounded-lg transition-all flex-shrink-0 cursor-pointer ${item.isSpecial ? 'text-amber-400 bg-amber-500/20' : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'}`}>
          <Star size={14} fill={item.isSpecial ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
        {editing ? (
          <>
            <span className="text-slate-500 text-sm">₹</span>
            <input
              className="input-base py-1 text-xs flex-1"
              type="number"
              value={editPrices[itemId]}
              onChange={e => setEditPrices(p => ({...p, [itemId]: e.target.value}))}
              autoFocus
            />
            <button onClick={() => savePrice(itemId)} className="p-1.5 rounded-lg bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-all cursor-pointer">
              <Check size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <span className="text-base font-black text-white">₹{item.price}</span>
            </div>
            <button onClick={() => setEditPrices(p => ({...p, [itemId]: item.price}))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer">
              <Edit3 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { activeRestaurant } = useApp();
  const [items, setItems] = useState([]);
  const [editPrices, setEditPrices] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPct, setBulkPct] = useState(10);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchItems = async (showLoad = false) => {
    if (!activeRestaurant?._id) return;
    if (showLoad) setLoading(true);
    try {
      const res = await api.menu.getPublic(activeRestaurant._id);
      if (res.success && res.menu) {
        const menuItems = res.menu.flatMap(c => (c.items || []).map(i => ({ ...i, categoryId: c._id })));
        setItems(menuItems);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu pricing catalogue.');
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
  }, [activeRestaurant]);

  const toggleSpecial = async (itemId, isSpecial) => {
    try {
      const res = await api.menu.updateItem(itemId, { isSpecial });
      if (res.success) {
        setItems(prev => prev.map(i => (i._id || i.id) === itemId ? { ...i, isSpecial } : i));
        toast.success(isSpecial ? '⭐ Added as Today\'s Special!' : 'Removed from specials.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update special state.');
    }
  };

  const savePrice = async (itemId) => {
    const newPrice = Number(editPrices[itemId]);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    try {
      const res = await api.menu.updateItem(itemId, { price: newPrice });
      if (res.success) {
        setItems(prev => prev.map(i => (i._id || i.id) === itemId ? { ...i, price: newPrice } : i));
        setEditPrices(prev => { const n = { ...prev }; delete n[itemId]; return n; });
        toast.success('Price updated instantly! ✓');
      }
    } catch (err) {
      toast.error(err.message || 'Price update failed.');
    }
  };

  const applyBulk = async () => {
    if (items.length === 0) return;
    setUpdating(true);
    toast.loading('Applying bulk pricing update to all items...', { id: 'bulkUpdate' });

    try {
      // Loop through all items and update price in parallel on backend
      const promises = items.map(i => {
        const itemId = i._id || i.id;
        const newPrice = Math.round(i.price * (1 + bulkPct / 100));
        return api.menu.updateItem(itemId, { price: newPrice });
      });

      await Promise.all(promises);
      toast.success(`Successfully adjusted all pricing by ${bulkPct > 0 ? '+' : ''}${bulkPct}%! 🚀`, { id: 'bulkUpdate' });
      setBulkMode(false);
      fetchItems(false);
    } catch (err) {
      toast.error('Bulk update encountered errors on some items.', { id: 'bulkUpdate' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
        <p className="text-sm">Loading pricing records...</p>
      </div>
    );
  }

  const specials = items.filter(i => i.isSpecial);
  const others = items.filter(i => !i.isSpecial);

  return (
    <div className="max-w-[1200px] mx-auto animate-fadeIn pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 font-semibold flex items-center gap-1.5">
            <Star size={14} className="animate-pulse" /> {specials.length} Today's Specials
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400">
            {items.length} total items
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setBulkMode(!bulkMode)} className="border-slate-800 hover:border-slate-700 bg-slate-900 cursor-pointer">
          <TrendingUp size={14} className="mr-1.5" />
          Bulk Price Update
        </Button>
      </div>

      {/* Bulk update panel */}
      {bulkMode && (
        <Card className="p-5 mb-6 bg-amber-500/5 border-amber-500/20 animate-fadeInUp">
          <p className="text-sm font-semibold text-amber-300 mb-3">Bulk Price Adjustment</p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input type="range" min={-50} max={100} value={bulkPct} onChange={e => setBulkPct(+e.target.value)} className="accent-amber-500 w-32 cursor-pointer" />
              <span className={`text-lg font-black w-16 ${bulkPct >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>{bulkPct > 0 ? '+' : ''}{bulkPct}%</span>
            </div>
            <Button variant="primary" size="sm" onClick={applyBulk} disabled={updating} className="cursor-pointer">Apply to All</Button>
            <Button variant="ghost" size="sm" onClick={() => setBulkMode(false)} className="cursor-pointer text-slate-400 hover:text-white">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Today's Specials */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-amber-400" />
          <h3 className="text-base font-bold text-white font-outfit" style={{ fontFamily: 'Outfit, sans-serif' }}>Today's Specials</h3>
          <span className="text-xs text-slate-500">These appear first on the customer menu</span>
        </div>
        {specials.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 text-center text-sm text-slate-550">
            No specials configured today. Highlight items by clicking the star icon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {specials.map(item => (
              <PriceCard key={item._id || item.id} item={item} editPrices={editPrices} setEditPrices={setEditPrices} savePrice={savePrice} toggleSpecial={toggleSpecial} />
            ))}
          </div>
        )}
      </div>

      {/* All Items */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 font-outfit" style={{ fontFamily: 'Outfit, sans-serif' }}>All Catalog Items</h3>
        {others.length === 0 && specials.length > 0 ? (
          <div className="text-center py-10 text-slate-650 text-sm">All catalog items are currently featured in Today's Specials.</div>
        ) : others.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl text-slate-650 text-sm">
            Menu catalog is empty. Add menu items in Menu Management first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {others.map(item => (
              <PriceCard key={item._id || item.id} item={item} editPrices={editPrices} setEditPrices={setEditPrices} savePrice={savePrice} toggleSpecial={toggleSpecial} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
