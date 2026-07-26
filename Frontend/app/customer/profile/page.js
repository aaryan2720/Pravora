'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Clock, Award, History, Receipt, Utensils, QrCode, LogOut } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import PublicNav from '@/components/layout/PublicNav';
import { useApp } from '@/lib/context/AppContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, signOut, activeSession, activeRestaurant } = useApp();
  const [data, setData] = useState({ memberships: [], recentBills: [] });
  const [loading, setLoading] = useState(true);

  const sessionPath = activeSession 
    ? `/r/${activeRestaurant?.slug || 'scan'}/session/${activeSession.tableId?._id || activeSession.tableId}` 
    : '';

  useEffect(() => {
    if (!user) {
      router.push('/auth/customer/signin');
      return;
    }

    const loadProfileData = async () => {
      try {
        const res = await api.memberships.getMyMemberships();
        if (res.success) {
          setData({
            memberships: res.memberships || [],
            recentBills: res.recentBills || []
          });
        }
      } catch (err) {
        console.error('Failed to load guest memberships:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, router]);

  const getTierDetails = (points) => {
    if (points >= 1000) return { name: 'Platinum Elite', color: 'from-violet-500 to-indigo-600', border: 'border-violet-500/30', text: 'text-violet-400' };
    if (points >= 500) return { name: 'Gold Member', color: 'from-amber-400 to-orange-500', border: 'border-amber-500/30', text: 'text-amber-400' };
    if (points >= 150) return { name: 'Silver Member', color: 'from-slate-400 to-slate-550', border: 'border-slate-400/30', text: 'text-slate-300' };
    return { name: 'Bronze Diner', color: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/30', text: 'text-emerald-400' };
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <PublicNav />
        <svg className="animate-spin w-8 h-8 text-brand-orange mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-medium">Synchronizing your foodie loop stats...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNav />
      
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(253,109,35,0.25)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{user.name}</h1>
              <p className="text-sm text-slate-400">{user.email}</p>
              {user.phone && <p className="text-xs text-slate-500 mt-0.5">{user.phone}</p>}
            </div>
          </div>
          
          <Button variant="secondary" size="sm" onClick={signOut} className="gap-2 border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>

        {/* Active Dining Table Alert */}
        {sessionPath && (
          <Link href={sessionPath} className="block">
            <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30 flex items-center justify-between gap-4 transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 animate-pulse">
                  <Utensils size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">You are actively paired with Table!</p>
                  <p className="text-xs text-slate-400">Order foods, call waiter, and check your kitchen timeline live</p>
                </div>
              </div>
              <Badge variant="amber" className="whitespace-nowrap cursor-pointer">Track Live Table</Badge>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Memberships Cards Section (2/3 width) */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Award size={12} className="text-brand-yellow" /> Loyalty Memberships ({data.memberships.length})
            </h2>

            {data.memberships.length === 0 ? (
              <Card className="p-8 border-slate-800 bg-slate-900/60 text-center space-y-3">
                <p className="text-sm text-slate-500">You haven't joined any restaurant loyalty circles yet.</p>
                <Link href="/discover">
                  <Button variant="primary" size="sm">Explore & Scan Tables</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.memberships.map(m => {
                  const tier = getTierDetails(m.points);
                  const logoUrl = m.restaurantId?.logo;
                  const bannerUrl = m.restaurantId?.coverImage;
                  return (
                    <div key={m._id} className={`rounded-2xl border ${tier.border} overflow-hidden shadow-md bg-slate-900 flex flex-col justify-between h-44 relative`}>
                      {/* Banner Cover */}
                      <div className="h-16 bg-slate-800 relative">
                        {bannerUrl ? (
                          <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover opacity-30" />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                        
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-950/70 border border-slate-800 text-slate-300 capitalize`}>
                            {m.restaurantId?.type ? m.restaurantId.type.replace('_', ' ') : 'dining'}
                          </span>
                        </div>
                      </div>

                      {/* Card Identity */}
                      <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
                        <div className="flex items-start gap-2.5 -mt-5 relative z-10">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-900 bg-slate-850 flex items-center justify-center flex-shrink-0 shadow-md">
                            {logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-sm font-bold text-amber-500">{m.restaurantId?.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tier.name}</p>
                            <h3 className="text-sm font-bold text-white truncate max-w-[150px]">{m.restaurantId?.name}</h3>
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Points</p>
                            <p className={`text-sm font-black ${tier.text}`}>{m.points}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Visits</p>
                            <p className="text-sm font-black text-slate-200">{m.visits}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Total spent</p>
                            <p className="text-sm font-black text-slate-200">₹{m.totalSpent?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity / Past Bills (1/3 width) */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <History size={12} /> Dining Activity
            </h2>

            {data.recentBills.length === 0 ? (
              <Card className="p-6 border-slate-800 bg-slate-900/60 text-center py-10 text-xs text-slate-550">
                No past transactions recorded
              </Card>
            ) : (
              <div className="space-y-3">
                {data.recentBills.map(bill => (
                  <Card key={bill._id} className="p-3 bg-slate-900 border-slate-800 flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{bill.restaurantId?.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Table {bill.tableLabel} · {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-emerald-400">₹{bill.total}</p>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">{bill.paymentMethod || 'online'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
