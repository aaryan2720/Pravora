'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, MapPin, Clock, Award, History, Receipt, Utensils, 
  QrCode, LogOut, Settings, Heart, Check, X, ShieldAlert, Sparkles 
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import PublicNav from '@/components/layout/PublicNav';
import { useApp } from '@/lib/context/AppContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, setUser, signOut, activeSession, activeRestaurant } = useApp();
  const [data, setData] = useState({ memberships: [], recentBills: [] });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    dietaryPreference: 'none',
    allergies: [],
  });

  const availableAllergies = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Seafood', 'Nuts', 'Egg', 'Sesame'];

  const sessionPath = activeSession 
    ? `/r/${activeRestaurant?.slug || 'scan'}/session/${activeSession.tableId?._id || activeSession.tableId}` 
    : '';

  useEffect(() => {
    if (!user) {
      router.push('/auth/customer/signin');
      return;
    }

    // Set initial profile form values
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      dietaryPreference: user.dietaryPreference || 'none',
      allergies: user.allergies || [],
    });

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

  const handleAllergyToggle = (allergy) => {
    setProfileForm(prev => {
      const exists = prev.allergies.includes(allergy);
      if (exists) {
        return { ...prev, allergies: prev.allergies.filter(a => a !== allergy) };
      } else {
        return { ...prev, allergies: [...prev.allergies, allergy] };
      }
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.auth.updateCustomerProfile(profileForm);
      if (res.success) {
        setUser(res.guest);
        localStorage.setItem('user', JSON.stringify(res.guest));
        toast.success('Diner profile and preferences updated!');
        setShowSettings(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId, itemId) => {
    try {
      const res = await api.memberships.toggleFavorite(itemId);
      if (res.success) {
        toast.success('Removed from favorites');
        // Update local state to immediately filter it out
        setData(prev => ({
          ...prev,
          memberships: prev.memberships.map(m => {
            if (m.restaurantId?._id === restaurantId || m.restaurantId === restaurantId) {
              return {
                ...m,
                favorites: m.favorites.filter(f => f._id !== itemId)
              };
            }
            return m;
          })
        }));
      }
    } catch (err) {
      toast.error('Failed to remove favorite.');
    }
  };

  const getTierDetails = (points) => {
    if (points >= 5000) {
      return { 
        name: 'Platinum Elite', 
        color: 'from-violet-500 to-indigo-600', 
        border: 'border-violet-500/30', 
        text: 'text-violet-400', 
        nextTier: null, 
        nextPoints: null, 
        currentThreshold: 5000 
      };
    }
    if (points >= 2000) {
      return { 
        name: 'Gold Member', 
        color: 'from-amber-400 to-orange-500', 
        border: 'border-amber-500/30', 
        text: 'text-amber-400', 
        nextTier: 'Platinum', 
        nextPoints: 5000, 
        currentThreshold: 2000 
      };
    }
    if (points >= 500) {
      return { 
        name: 'Silver Member', 
        color: 'from-slate-400 to-slate-550', 
        border: 'border-slate-400/30', 
        text: 'text-slate-300', 
        nextTier: 'Gold', 
        nextPoints: 2000, 
        currentThreshold: 500 
      };
    }
    return { 
      name: 'Bronze Diner', 
      color: 'from-emerald-500 to-teal-600', 
      border: 'border-emerald-500/30', 
      text: 'text-emerald-400', 
      nextTier: 'Silver', 
      nextPoints: 500, 
      currentThreshold: 0 
    };
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

  // Aggregate all favorited items across all memberships
  const allFavorites = data.memberships.flatMap(m => 
    (m.favorites || []).map(f => ({ ...f, restaurant: m.restaurantId }))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNav />
      
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(253,109,35,0.25)]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-slate-100 flex items-center gap-2 justify-center sm:justify-start" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {user.name}
                  {user.dietaryPreference && user.dietaryPreference !== 'none' && (
                    <Badge variant={user.dietaryPreference === 'veg' ? 'emerald' : 'amber'} className="capitalize text-[10px] py-0.5 px-2">
                      🌱 {user.dietaryPreference}
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-400">{user.email}</p>
                {user.phone && <p className="text-xs text-slate-500 mt-0.5">{user.phone}</p>}
                {user.allergies && user.allergies.length > 0 && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                    <ShieldAlert size={12} /> Allergies: {user.allergies.join(', ')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2 border-slate-800 text-slate-300">
                <Settings size={14} /> {showSettings ? 'Hide Settings' : 'Edit Preferences'}
              </Button>
              <Button variant="secondary" size="sm" onClick={signOut} className="gap-2 border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer">
                <LogOut size={14} /> Sign Out
              </Button>
            </div>
          </div>

          {/* Settings / Preferences Form */}
          {showSettings && (
            <div className="mt-4 pt-5 border-t border-slate-800 animate-slideDown">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Diner Profile & Dietary Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">Name</label>
                    <input 
                      className="input-base text-sm" 
                      value={profileForm.name} 
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">Phone</label>
                    <input 
                      className="input-base text-sm" 
                      placeholder="e.g. +91 98765 43210"
                      value={profileForm.phone} 
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Dietary Profile</label>
                  <select 
                    className="input-base text-sm bg-slate-950 text-slate-300 border-slate-800"
                    value={profileForm.dietaryPreference}
                    onChange={e => setProfileForm({ ...profileForm, dietaryPreference: e.target.value })}
                  >
                    <option value="none">No Specific Preference (General Diner)</option>
                    <option value="veg">🌱 Vegetarian (Excludes Meat & Seafood)</option>
                    <option value="vegan">🥦 Vegan (100% Plant-Based)</option>
                    <option value="gluten_free">🌾 Gluten-Free</option>
                    <option value="halal">🕌 Halal certified items</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Food Allergies / Exclusions</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableAllergies.map(allergy => {
                      const isSelected = profileForm.allergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => handleAllergyToggle(allergy)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {allergy}
                          {isSelected && <Check size={12} className="text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Our intelligent AI menu engine filters items containing marked allergens from recommendation lists.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setShowSettings(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={updating}>
                    {updating ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </div>
          )}
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
                  <p className="text-sm font-bold text-slate-200">You are actively paired with Table!</p>
                  <p className="text-xs text-slate-400">Order foods, call waiter, and check your kitchen timeline live</p>
                </div>
              </div>
              <Badge variant="amber" className="whitespace-nowrap cursor-pointer">Track Live Table</Badge>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Memberships Cards Section (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
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

                    // Progress bar calculation
                    let progressPercent = 0;
                    if (tier.nextPoints) {
                      const range = tier.nextPoints - tier.currentThreshold;
                      const currentProgress = m.points - tier.currentThreshold;
                      progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
                    } else {
                      progressPercent = 100;
                    }

                    return (
                      <div key={m._id} className={`rounded-2xl border ${tier.border} overflow-hidden shadow-md bg-slate-900 flex flex-col justify-between h-[210px] relative`}>
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
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tier.name}</p>
                              <h3 className="text-sm font-bold text-slate-100 truncate max-w-[150px]">{m.restaurantId?.name}</h3>
                            </div>
                          </div>

                          {/* Progress bar inside the card */}
                          <div className="mt-3">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
                              <span>Points Progress</span>
                              <span>
                                {m.points} {tier.nextPoints ? `/ ${tier.nextPoints} pts` : 'pts (MAX)'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            {tier.nextTier && (
                              <p className="text-[9px] text-slate-500 mt-1 text-right">
                                {tier.nextPoints - m.points} more points to reach {tier.nextTier}
                              </p>
                            )}
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-semibold">Points</p>
                              <p className={`text-xs font-black ${tier.text}`}>{m.points}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-semibold">Visits</p>
                              <p className="text-xs font-black text-slate-200">{m.visits}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-semibold">Total spent</p>
                              <p className="text-xs font-black text-slate-200">₹{m.totalSpent?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Favorite dishes */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Heart size={12} className="text-rose-500 fill-rose-500" /> Favorite Dishes ({allFavorites.length})
              </h2>

              {allFavorites.length === 0 ? (
                <Card className="p-8 border-slate-800 bg-slate-900/60 text-center text-sm text-slate-500">
                  Your favorited dishes will appear here. Click the heart icon on any restaurant's menu!
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allFavorites.map(item => (
                    <Card key={item._id} className="p-3 bg-slate-900 border-slate-800 flex gap-3 group relative overflow-hidden">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <h4 className="text-sm font-bold text-slate-100 truncate pr-6">{item.name}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.restaurant?.name || 'Restaurant'}</p>
                          <p className="text-xs text-slate-400 mt-1 font-bold">₹{item.price}</p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveFavorite(item.restaurant?._id || item.restaurant, item._id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-500 border border-slate-850 hover:border-rose-500/20 transition-colors"
                        title="Remove from favorites"
                      >
                        <X size={12} />
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Activity / Past Bills (1/3 width) */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <History size={12} /> Dining Activity
            </h2>

            {data.recentBills.length === 0 ? (
              <Card className="p-6 border-slate-800 bg-slate-900/60 text-center py-10 text-xs text-slate-500">
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
