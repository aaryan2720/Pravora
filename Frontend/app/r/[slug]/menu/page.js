'use client';
import { useState, useContext, createContext, use } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Leaf } from 'lucide-react';
import { mockMenuItems, mockMenuCategories } from '@/lib/mockData';
import { Button, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

// Simple local cart context
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const add = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`Added ${item.name}`);
  };
  const remove = (id) => setCart(prev => {
    const item = prev.find(c => c.id === id);
    if (item?.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    return prev.filter(c => c.id !== id);
  });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return <CartContext.Provider value={{ cart, add, remove, total, count }}>{children}</CartContext.Provider>;
}

function MenuItemCard({ item }) {
  const { cart, add, remove } = useContext(CartContext);
  const inCart = cart.find(c => c.id === item.id);
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${item.availability !== 'available' ? 'opacity-50 border-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {item.isVeg ? <Leaf size={12} className="text-emerald-400 flex-shrink-0" /> : <span className="w-3 h-3 rounded-sm border-2 border-rose-400 flex-shrink-0" />}
          <h4 className="text-sm font-bold text-white">{item.name}</h4>
          {item.isSpecial && <Badge variant="amber">Special</Badge>}
        </div>
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{item.description}</p>
        <p className="text-xs text-slate-600 mb-2">{item.prepTime}m prep</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white">₹{item.price}</span>
          {item.originalPrice && <span className="text-xs text-slate-600 line-through">₹{item.originalPrice}</span>}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        {inCart ? (
          <div className="flex items-center gap-2">
            <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 font-bold text-lg flex items-center justify-center transition-all">−</button>
            <span className="text-sm font-bold text-amber-400 min-w-[16px] text-center">{inCart.qty}</span>
            <button onClick={() => add(item)} className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-400 font-bold text-lg flex items-center justify-center transition-all">+</button>
          </div>
        ) : (
          <button onClick={() => add(item)} disabled={item.availability !== 'available'}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {item.availability === 'available' ? 'Add' : item.availability === 'soon' ? 'Soon' : 'N/A'}
          </button>
        )}
      </div>
    </div>
  );
}

function CartSummary({ slug, tableId }) {
  const { cart, total, count, remove } = useContext(CartContext);
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/95 border-t border-slate-800 backdrop-blur-sm">
      <div className="max-w-lg mx-auto">
        <Link href={`/r/${slug}/table/${tableId}/cart`}>
          <button className="w-full py-4 rounded-2xl font-bold text-slate-900 flex items-center justify-between px-5 text-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>{count} item{count !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>₹{total.toLocaleString()}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function MenuPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || 'tbl_1';
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-950 pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-white">Spice Garden</h1>
              <p className="text-xs text-slate-500">Table T1</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
              <span className="status-dot live" />
              Open
            </div>
          </div>
        </div>

        {/* Categories slider */}
        <div className="sticky top-[57px] z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3 overflow-x-auto flex gap-2 scrollbar-hide">
          <button onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
            All Items
          </button>
          {mockMenuCategories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat.id ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
              <span>{cat.icon}</span>
              {cat.name}
            </button>
            ))}
          </div>

        {/* Menu items */}
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Specials */}
          {(activeCategory === 'all') && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wide">⭐ Today's Specials</h2>
              <div className="space-y-3">
                {mockMenuItems.filter(i => i.isSpecial && i.availability === 'available').map(item => <MenuItemCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {/* By category */}
          {mockMenuCategories.map(cat => {
            const catItems = mockMenuItems.filter(i => i.categoryId === cat.id && (activeCategory === 'all' || activeCategory === cat.id));
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id} className="mb-6">
                <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <span>{cat.icon}</span>
                  {cat.name}
                </h2>
                <div className="space-y-3">
                  {catItems.map(item => <MenuItemCard key={item.id} item={item} />)}
                </div>
              </div>
            );
          })}
        </div>

        <CartSummary slug={slug} tableId={tableId} />
      </div>
    </CartProvider>
  );
}
