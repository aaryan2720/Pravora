'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronLeft, Send, LifeBuoy } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

export default function GuestHelpPage({ params }) {
  const router = useRouter();
  const { user, activeSession } = useApp();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'sora-cafe';

  const [restaurant, setRestaurant] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    category: 'service', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await api.restaurant.getBySlug(slug);
        if (res.success) {
          setRestaurant(res.restaurant);
        }
      } catch (err) {
        console.error('Error loading restaurant:', err);
        toast.error('Failed to load cafe details.');
      } finally {
        setLoadingRestaurant(false);
      }
    };
    if (slug) fetchRestaurant();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      toast.error('Please fill in name and description');
      return;
    }
    if (!restaurant?._id) {
      toast.error('Restaurant context missing.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.complaints.create({
        restaurantId: restaurant._id,
        tableId: activeSession?.tableId?._id || activeSession?.tableId || null,
        sessionId: activeSession?._id || activeSession?.id || null,
        guestName: form.name,
        guestPhone: form.phone || null,
        category: form.category,
        description: form.description
      });
      if (res.success) {
        toast.success('🎉 Help request sent! A staff member is on their way.');
        // Go back to the session or menu
        if (activeSession) {
          router.push(`/r/${slug}/session/${activeSession.tableId?._id || activeSession.tableId}`);
        } else {
          router.push(`/r/${slug}`);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to file request.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Connecting to Help Desk...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <h1 className="text-xl font-bold text-rose-400 mb-2">Restaurant Not Found</h1>
        <Link href="/" className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-700">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 cursor-pointer">
          <ChevronLeft size={16} /> Back
        </button>
        <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Customer Care Desk</span>
        <span className="w-12" />
      </header>

      {/* Main body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        <div className="text-center py-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-2 text-amber-400">
            <LifeBuoy size={22} className="animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Need Assistance?</h2>
          <p className="text-xs text-slate-500">Report service, cleanliness or food issues directly to staff</p>
        </div>

        <Card className="p-5 border-slate-800 bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Your Name *</label>
              <input className="input-base" placeholder="Enter name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Phone Number (Optional)</label>
              <input className="input-base" placeholder="+91 ..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Issue Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'service', label: '🛎️ Slow Service' },
                  { value: 'food', label: '🍳 Food Issue' },
                  { value: 'billing', label: '💵 Billing Error' },
                  { value: 'cleanliness', label: '🧼 Cleanliness' },
                  { value: 'other', label: '❓ Other / Ask Help' },
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({...form, category: cat.value})}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                      form.category === cat.value
                        ? 'bg-amber-500 text-slate-900 border-amber-500'
                        : 'bg-slate-800 text-slate-450 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Description *</label>
              <textarea className="input-base resize-none text-sm" rows={4} placeholder="Please detail the issue here so we can help you promptly..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer" disabled={loading}>
              {loading ? 'Sending ticket...' : 'Report Issue to Staff'}
              <Send size={14} />
            </Button>
          </form>
        </Card>
      </main>

      <footer className="text-center py-6 text-xs text-slate-600 border-t border-slate-900">
        ServeLoop Customer Care Engine
      </footer>
    </div>
  );
}
