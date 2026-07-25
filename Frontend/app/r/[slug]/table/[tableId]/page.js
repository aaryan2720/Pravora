'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, ArrowRight, Star, MapPin } from 'lucide-react';
import { mockRestaurant } from '@/lib/mockData';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export default function TableEntryPage({ params }) {
  const router = useRouter();
  const slug = params?.slug || 'spice-garden';
  const tableId = params?.tableId || 'tbl_1';
  const restaurant = mockRestaurant;

  const [guestName, setGuestName] = useState('');
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`Welcome! Table T1 session active.`);
    router.push(`/r/${slug}/menu`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="ServeLoop" className="w-8 h-8 object-contain" />
          <span className="font-bold text-slate-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-brand-orange">Serve</span><span className="text-brand-yellow">Loop</span>
          </span>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
          <span className="status-dot live" />
          Live Table T1
        </div>
      </header>

      {/* Hero card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome to {restaurant.name}
            </h1>
            <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
              <MapPin size={13} /> {restaurant.location.address}
            </p>
          </div>

          <Card className="p-6 border-slate-800 bg-slate-900">
            <form onSubmit={handleStartSession} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-1.5">Your Name</label>
                <input
                  className="input-base"
                  placeholder="Enter your name..."
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Number of Guests</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuests(num)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                        guests === num
                          ? 'bg-amber-500 text-slate-900 border-amber-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                disabled={loading}
              >
                {loading ? 'Entering Table Session...' : 'Browse Menu & Order'}
                <ArrowRight size={16} />
              </Button>
            </form>
          </Card>

          {/* Footnotes */}
          <div className="mt-6 flex justify-around text-center text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-300">{restaurant.avgRating} ★</p>
              <p>Rating</p>
            </div>
            <div className="w-px bg-slate-800 h-8 self-center" />
            <div>
              <p className="font-bold text-slate-300">10-15m</p>
              <p>Avg Prep Time</p>
            </div>
            <div className="w-px bg-slate-800 h-8 self-center" />
            <div>
              <p className="font-bold text-slate-300">₹300 - ₹500</p>
              <p>Price for Two</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-600 border-t border-slate-900">
        Powered by ServeLoop · Seamless dining experience
      </footer>
    </div>
  );
}
