'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, Phone, QrCode, CalendarDays, ChevronRight, Zap, Leaf } from 'lucide-react';
import { mockRestaurant, mockMenuItems } from '@/lib/mockData';
import { api } from '@/lib/api';
import { Button, Badge } from '@/components/ui';

export default function RestaurantLandingPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const loadData = async () => {
      try {
        const res = await api.restaurant.getBySlug(slug);
        if (res.success && res.restaurant) {
          setRestaurant(res.restaurant);
          // Load menu items
          const itemsRes = await api.menu.getItems(res.restaurant._id);
          if (itemsRes.success) {
            setMenuItems(itemsRes.items || []);
          }
        } else {
          setRestaurant(mockRestaurant);
          setMenuItems(mockMenuItems);
        }
      } catch (err) {
        console.error(err);
        setRestaurant(mockRestaurant);
        setMenuItems(mockMenuItems);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading restaurant portal...</p>
      </div>
    );
  }

  const isLive = restaurant?.isLive;
  const rating = restaurant?.avgRating || restaurant?.rating || 4.5;
  const reviewsCount = restaurant?.totalReviews || restaurant?.reviews || 120;
  const cuisineList = Array.isArray(restaurant?.cuisine) ? restaurant.cuisine : ['Indian', 'Multi-Cuisine'];
  const addressStr = restaurant?.location?.address || 'MG Road';
  const cityStr = restaurant?.location?.city || 'Bengaluru';
  const phoneStr = restaurant?.contact?.phone || '+91 ...';

  const specials = menuItems.filter(i => i.isSpecial && i.availability === 'available').slice(0, 3);
  const availableItems = menuItems.filter(i => i.availability === 'available').slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative h-72 sm:h-80 bg-slate-800 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-emerald-500/5 flex items-center justify-center">
          <span className="text-8xl opacity-10">🍽️</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative z-10 p-6 w-full">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isLive ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                    <span className="status-dot live" />
                    Open Now
                  </div>
                ) : (
                  <Badge variant="rose">Closed</Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Zap size={12} />
                  {(restaurant?.rushLevel || 25) > 70 ? 'Very Busy' : (restaurant?.rushLevel || 25) > 40 ? 'Moderate' : 'Quiet'}
                </div>
              </div>
              <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{restaurant?.name || 'Restaurant'}</h1>
              <p className="text-slate-400 text-sm">{cuisineList.join(' · ')}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{rating}</span>
              <span className="text-slate-500">({reviewsCount.toLocaleString()} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Info bar */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6 pb-6 border-b border-slate-800">
          <span className="flex items-center gap-1.5"><MapPin size={14} /> {addressStr}, {cityStr}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} /> 11:00 – 23:00</span>
          <span className="flex items-center gap-1.5"><Phone size={14} /> {phoneStr}</span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Link href={`/scan`}>
            <Button variant="primary" size="lg" className="w-full gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <QrCode size={18} />
              Scan Table QR
            </Button>
          </Link>
          <Link href={`/r/${slug}/reserve`}>
            <Button variant="secondary" size="lg" className="w-full gap-3">
              <CalendarDays size={18} />
              Make Reservation
            </Button>
          </Link>
        </div>

        {/* Today's Specials */}
        {specials.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span>⭐</span> Today's Specials
              </h2>
              <Link href={`/r/${slug}/menu`} className="text-xs text-amber-400 flex items-center gap-1">
                Full menu <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {specials.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xl flex-shrink-0">
                    {item.isVeg ? '🥗' : '🍖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      {item.isVeg && <Leaf size={12} className="text-emerald-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-black text-amber-400">₹{item.price}</p>
                    {item.originalPrice && <p className="text-xs text-slate-600 line-through">₹{item.originalPrice}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Menu Preview</h2>
            <Link href={`/r/${slug}/menu`} className="text-xs text-amber-400 flex items-center gap-1">
              See full menu <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableItems.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.isVeg ? <Leaf size={10} className="text-emerald-400" /> : <span className="w-2.5 h-2.5 rounded-sm border-2 border-rose-400 flex-shrink-0" />}
                    <span className="text-xs text-slate-600">{item.prepTime}m</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags / features */}
        <div className="flex flex-wrap gap-2">
          {['Dine-In', 'Reservations Available', 'QR Ordering', 'Veg-Friendly', 'Live Availability'].map(t => (
            <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
