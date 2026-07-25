'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, MapPin, Star, Clock, Zap, ChevronRight } from 'lucide-react';
import { mockDiscoveryRestaurants } from '@/lib/mockData';
import PublicNav from '@/components/layout/PublicNav';
import { Badge, Card } from '@/components/ui';

const cuisineFilters = ['All', 'Indian', 'Pan-Asian', 'Mediterranean', 'BBQ', 'Quick Service'];

function RestaurantCard({ r }) {
  const rushColor = r.rushLevel > 70 ? 'text-rose-400' : r.rushLevel > 40 ? 'text-amber-400' : 'text-emerald-400';
  return (
    <Link href={`/r/${r.slug}`}>
      <Card hover className="overflow-hidden group">
        {/* Cover */}
        <div className="h-40 bg-slate-800 relative overflow-hidden flex items-center justify-center">
          <div className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-500">🍽️</div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {r.isLive ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                <span className="status-dot live" />
                Open
              </div>
            ) : (
              <div className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-500">Closed</div>
            )}
          </div>
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300">
            {r.priceRange}
          </div>
          <div className="absolute bottom-3 right-3 text-xs text-slate-400 flex items-center gap-1">
            <MapPin size={11} /> {r.distance}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>{r.name}</h3>
            <div className="flex items-center gap-1 text-xs font-semibold flex-shrink-0 ml-2">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-slate-300">{r.rating}</span>
              <span className="text-slate-600">({r.reviews})</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-2">{r.cuisine}</p>

          {/* Rush + location */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin size={11} /> {r.location}
            </span>
            {r.isLive && (
              <span className={`flex items-center gap-1 ${rushColor}`}>
                <Zap size={11} />
                {r.rushLevel > 70 ? 'Very Busy' : r.rushLevel > 40 ? 'Moderate' : 'Quiet'}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {r.tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-400 capitalize">{t}</span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');

  const filtered = mockDiscoveryRestaurants.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchCuisine = cuisine === 'All' || r.cuisine.toLowerCase().includes(cuisine.toLowerCase());
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
            {filtered.map(r => <RestaurantCard key={r.id} r={r} />)}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              No restaurants found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
