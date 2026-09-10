'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Leaf } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

function MenuItemCard({ item }) {
  const { cart, addToCart, updateCartQty } = useApp();
  const itemId = item._id || item.id;
  const inCart = cart.find(c => c.itemId === itemId);
  
  const handleAdd = () => {
    addToCart(item, 1);
    toast.success(`Added ${item.name}`);
  };

  const handleMinus = () => {
    if (inCart) {
      updateCartQty(itemId, inCart.qty - 1);
    }
  };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${item.availability !== 'available' ? 'opacity-50 border-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-700'} w-full`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {item.isVeg ? (
            <span className="text-emerald-400 flex-shrink-0" title="Vegetarian" aria-label="Vegetarian"><Leaf size={12} /></span>
          ) : (
            <span className="w-3 h-3 rounded-sm border-2 border-rose-400 flex items-center justify-center flex-shrink-0" title="Non-Vegetarian" aria-label="Non-Vegetarian">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            </span>
          )}
          <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
          {item.isSpecial && <Badge variant="amber">Special</Badge>}
        </div>
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{item.description}</p>
        <p className="text-xs text-slate-600 mb-2">{item.prepTime || 15}m prep</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white">₹{item.price}</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        {inCart ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMinus}
              aria-label={`Decrease quantity of ${item.name}`}
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 font-bold text-lg flex items-center justify-center transition-all cursor-pointer focus-visible:outline-brand-orange"
            >
              −
            </button>
            <span className="text-sm font-bold text-amber-400 min-w-[16px] text-center" aria-live="polite">{inCart.qty}</span>
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Increase quantity of ${item.name}`}
              className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-400 font-bold text-lg flex items-center justify-center transition-all cursor-pointer focus-visible:outline-brand-orange"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={item.availability !== 'available'}
            aria-label={`Add ${item.name} to order`}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-brand-orange"
          >
            {item.availability === 'available' ? 'Add' : item.availability === 'soon' ? 'Soon' : 'N/A'}
          </button>
        )}
      </div>
    </div>
  );
}

function CartSummary({ slug, tableId }) {
  const { cartCount, cartTotal } = useApp();
  if (cartCount === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/95 border-t border-slate-800 backdrop-blur-sm">
      <div className="max-w-lg mx-auto">
        <Link href={`/r/${slug}/table/${tableId}/cart`}>
          <button className="w-full py-4 rounded-2xl font-bold text-slate-900 flex items-center justify-between px-5 text-sm cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>₹{cartTotal.toLocaleString()}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function MenuPage({ params }) {
  const { activeRestaurant, setActiveRestaurant, activeSession } = useApp();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || activeSession?.tableId || 'tbl_1';
  
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        let restaurantId = activeRestaurant?._id;
        
        // Fetch restaurant metadata if context is empty (e.g., direct page load/refresh)
        if (!restaurantId) {
          const restRes = await api.restaurant.getBySlug(slug);
          if (restRes.success && restRes.restaurant) {
            restaurantId = restRes.restaurant._id;
            setActiveRestaurant(restRes.restaurant);
          } else {
            toast.error('Restaurant details not found.');
            setLoading(false);
            return;
          }
        }

        const res = await api.menu.getPublic(restaurantId);
        if (res.success && res.menu) {
          // Parse categories and items from backend grouped menu structure
          const cats = res.menu.map(c => ({ id: c._id, name: c.name, icon: c.icon || '🍛' }));
          const items = res.menu.flatMap(c => c.items || []);
          setCategories(cats);
          setMenuItems(items);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        toast.error('Failed to load menu. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchMenu();
  }, [activeRestaurant, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading chef's menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">{activeRestaurant?.name || 'Restaurant'}</h1>
            <p className="text-xs text-slate-500">Dining Session Table</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-xs font-semibold text-emerald-400 animate-pulse">
            <span className="status-dot live" />
            Open Session
          </div>
        </div>
      </div>

      {/* Categories slider */}
      <div className="sticky top-[57px] z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3 overflow-x-auto flex gap-2 scrollbar-hide">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeCategory === 'all' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
          All Items
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === cat.id ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Specials */}
        {(activeCategory === 'all') && menuItems.some(i => i.isSpecial) && (
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wide">⭐ Today's Specials</h2>
            <div className="space-y-3">
              {menuItems.filter(i => i.isSpecial && i.availability === 'available').map(item => <MenuItemCard key={item._id || item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* By category */}
        {categories.map(cat => {
          const catItems = menuItems.filter(i => i.categoryId === cat.id && (activeCategory === 'all' || activeCategory === cat.id));
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} className="mb-6 animate-fadeIn">
              <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.name}
              </h2>
              <div className="space-y-3">
                {catItems.map(item => <MenuItemCard key={item._id || item.id} item={item} />)}
              </div>
            </div>
          );
        })}
        
        {menuItems.length === 0 && (
          <div className="text-center py-20 text-slate-600 text-sm">Chef is currently setting up the menu. Please check back in a moment!</div>
        )}
      </div>

      <CartSummary slug={slug} tableId={tableId} />
    </div>
  );
}
