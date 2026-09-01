'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Zap, ChevronRight, QrCode } from 'lucide-react';
import { mockDiscoveryRestaurants } from '@/lib/mockData';
import { api } from '@/lib/api';
import PublicNav from '@/components/layout/PublicNav';
import { Badge, Card, Button } from '@/components/ui';

const cuisineFilters = ['All', 'Indian', 'Pan-Asian', 'Mediterranean', 'BBQ', 'Quick Service'];

function RestaurantCard({ r }) {
  const isLive = r.isLive;
  const rating = r.rating || r.avgRating || 4.5;
  const reviews = r.reviews || r.totalReviews || 120;
  const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' · ') : (r.cuisine || 'Cuisine');
  const city = typeof r.location === 'object' && r.location
    ? (r.location.city || r.location.country || 'Location')
    : (r.location || 'Location');
  const typeTag = r.type ? r.type.replace('_', ' ') : 'dining';
  const tags = r.tags || [typeTag, r.serviceModel || 'hybrid'];

  return (
    <Link href={`/r/${r.slug}`}>
      <Card hover className="overflow-hidden group bg-slate-900 border-slate-800">
        {/* Cover Banner */}
        <div className="h-36 bg-slate-800 relative overflow-hidden flex items-center justify-center">
          {r.coverImage ? (
            <img src={r.coverImage} alt={r.name} width="400" height="200" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="text-5xl opacity-10 group-hover:scale-110 transition-transform duration-500">🍽️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          {/* Status badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isLive ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="status-dot live" />
                Open
              </div>
            ) : (
              <div className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-bold text-slate-500">Closed</div>
            )}
          </div>
          
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-800 text-[10px] font-bold text-slate-300">
            {r.priceRange || '₹₹'}
          </div>

          {/* Overlapping Logo */}
          <div className="absolute -bottom-6 left-4 z-10 w-14 h-14 rounded-xl overflow-hidden border-[3px] border-slate-900 bg-slate-800 shadow-lg flex items-center justify-center">
            {r.logo ? (
              <img src={r.logo} alt={r.name} width="56" height="56" className="w-full h-full object-contain" />
            ) : (
              <span className="text-lg font-black text-amber-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {r.name?.charAt(0).toUpperCase() || 'R'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-8">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors truncate max-w-[170px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {r.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold flex-shrink-0">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-slate-300">{rating}</span>
              <span className="text-slate-500">({reviews})</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-2 truncate">{cuisineStr}</p>

          {/* Location */}
          <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} /> {city}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-800/80 border border-slate-800 text-slate-400 capitalize">{t}</span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function DiscoverPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.restaurant.list();
        if (res.success && res.restaurants?.length > 0) {
          setRestaurants(res.restaurants);
        } else {
          setRestaurants(mockDiscoveryRestaurants);
        }
      } catch (err) {
        console.error(err);
        setRestaurants(mockDiscoveryRestaurants);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter(r => {
    const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
    const matchSearch = !search || 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      cuisineStr.toLowerCase().includes(search.toLowerCase());
    const matchCuisine = cuisine === 'All' || 
      cuisineStr.toLowerCase().includes(cuisine.toLowerCase());
    return matchSearch && matchCuisine;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNav />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="amber" className="mb-3">Discover</Badge>
            <h1 className="text-4xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Find your next great meal
            </h1>
            <p className="text-slate-400">Browse live restaurants near you with real-time availability</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-base pl-12 py-4 text-base" placeholder="Search restaurant or cuisine..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Quick Scan Promo */}
          <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center flex-shrink-0 text-white shadow-[0_0_15px_rgba(253,109,35,0.2)]">
                <QrCode size={22} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Already at a table?</p>
                <p className="text-xs text-slate-500">Scan the table QR code to start ordering and pay instantly.</p>
              </div>
            </div>
            <Link href="/scan">
              <Button variant="primary" size="md" className="whitespace-nowrap flex items-center gap-2 shadow-[0_0_15px_rgba(253,109,35,0.25)]">
                <QrCode size={15} /> Scan Table QR
              </Button>
            </Link>
          </div>

          {/* Cuisine filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {cuisineFilters.map(c => (
              <button key={c} onClick={() => setCuisine(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${cuisine === c ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(r => <RestaurantCard key={r._id || r.id} r={r} />)}
          </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            No restaurants found for "{search}"
          </div>
        )}
      </div>
    </div>

    {/* Floating Scan FAB for quick access */}
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/scan">
        <button className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-brand-orange text-white font-bold shadow-[0_4px_20px_rgba(253,109,35,0.4)] hover:bg-brand-orange/90 hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer">
          <QrCode size={18} />
          Scan Table QR
        </button>
      </Link>
    </div>
  </div>
);
}
