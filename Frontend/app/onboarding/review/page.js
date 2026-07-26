'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.onboarding.getStatus();
        if (res.success) {
          setRestaurantData(res.restaurant);
        }
        
        // Fetch AI onboarding insights dynamically
        const aiRes = await api.ai.getOnboardingSummary();
        if (aiRes.success) {
          setAiRecommendation(aiRes.result.recommendation || aiRes.result);
        }
      } catch (err) {
        console.error('Error fetching onboarding status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const res = await api.onboarding.complete();
      if (res.success) {
        toast.success('Restaurant Workspace Launched Live! 🚀');
        
        // Refresh session contexts
        const meRes = await api.auth.getMe();
        if (meRes.success) {
          localStorage.setItem('user', JSON.stringify(meRes.account));
          if (meRes.restaurant) {
            localStorage.setItem('restaurant', JSON.stringify(meRes.restaurant));
          }
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to launch. Please try again.');
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Analyzing configuration and fetching AI guide...</p>
      </div>
    );
  }

  const data = restaurantData?.onboardingData || {};
  const serviceStyleLabels = { assisted: 'Staff-Assisted', hybrid: 'Hybrid (QR + Staff)', self_service: 'Fully Self-Service' };
  const typeLabels = { cafe: 'Café', quick_service: 'Quick Service', casual_dining: 'Casual Dining', premium_dining: 'Premium Dining' };

  const summary = [
    { label: 'Restaurant Name', value: restaurantData?.name || 'Your Restaurant', icon: '🍽️' },
    { label: 'Restaurant Type', value: typeLabels[restaurantData?.type] || 'Casual Dining', icon: '🏨' },
    { label: 'Service Model', value: serviceStyleLabels[restaurantData?.serviceModel] || 'Hybrid (QR + Staff)', icon: '⚡' },
    { label: 'Location/City', value: data.location?.city || 'Bengaluru, India', icon: '📍' },
    { label: 'Tables Configured', value: `${data.tables?.tableCount || 16} tables`, icon: '🪑' },
    { label: 'Cuisines', value: data.location?.cuisine?.join(', ') || 'Indian, Fusion', icon: '🍲' },
    { label: 'Tax Rate (GST)', value: `${data.billing?.taxRate || 18}% GST`, icon: '💳' },
    { label: 'Reservations Slot', value: data.reservations?.reservations ? `Enabled · ${data.reservations?.slotMinutes || 30} mins` : 'Disabled', icon: '📅' },
  ];

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 11 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Review and launch 🚀
        </h2>
        <p className="text-slate-400">Everything looks great. Review your setup and launch your restaurant workspace.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        {summary.map(s => (
          <div key={s.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-sm font-semibold text-slate-200">{s.value}</p>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400 ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="mb-7 p-5 rounded-2xl bg-violet-500/8 border border-violet-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-300">Gemini AI Launch Guide</p>
        </div>
        <div className="text-sm text-slate-400 leading-relaxed">
          {aiRecommendation || 'Based on your restaurant profile, we recommend starting with digital menu and QR table sessions. Enable reservations for better table management and use the pulse dashboard to monitor peak hours.'}
        </div>
      </div>

      {/* Launch */}
      <button onClick={handleLaunch} disabled={launching} className="w-full py-4 rounded-2xl font-bold text-lg text-slate-900 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
        <Rocket size={22} />
        {launching ? 'Launching Workspace...' : 'Launch My Restaurant Workspace'}
        <ArrowRight size={20} />
      </button>
      <p className="text-center text-xs text-slate-600 mt-4">Your workspace is ready. Everything can be edited from your Settings page.</p>
    </div>
  );
}
