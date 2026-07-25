'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChefHat, CalendarDays, Clock, Users, ArrowRight, ChevronLeft } from 'lucide-react';
import { mockRestaurant } from '@/lib/mockData';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export default function GuestReservePage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const restaurant = mockRestaurant;

  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '19:30', guests: 2, notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      toast.error('Please fill in required fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('🎉 Reservation request sent! Check your WhatsApp/SMS shortly.');
    router.push(`/r/${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <Link href={`/r/${slug}`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ChevronLeft size={16} /> Home
        </Link>
        <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Book a Table</span>
        <span className="w-12" />
      </header>

      {/* Main body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        <div className="text-center py-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-2 text-amber-400">
            <CalendarDays size={22} />
          </div>
          <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Make a Reservation</h2>
          <p className="text-xs text-slate-500">{restaurant.name} · {restaurant.location.city}</p>
        </div>

        <Card className="p-5 border-slate-800 bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name *</label>
              <input className="input-base" placeholder="Enter name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Phone *</label>
                <input className="input-base" placeholder="+91 ..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Email (Optional)</label>
                <input className="input-base" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Date *</label>
                <input type="date" className="input-base" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Time *</label>
                <input type="time" className="input-base" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Guests</label>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({...form, guests: n})}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      form.guests === n
                        ? 'bg-amber-500 text-slate-900 border-amber-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {n} Guests
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Special Notes</label>
              <textarea className="input-base resize-none text-sm" rows={2} placeholder="Wheelchair access, window seat, allergy notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]" disabled={loading}>
              {loading ? 'Submitting request...' : 'Book Table Now'}
              <ArrowRight size={16} />
            </Button>
          </form>
        </Card>
      </main>

      <footer className="text-center py-6 text-xs text-slate-600 border-t border-slate-900">
        ServeLoop booking engine
      </footer>
    </div>
  );
}
