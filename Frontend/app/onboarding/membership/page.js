'use client';
import { useState, useEffect } from 'react';
export default function MembershipPage() {
  const [s, setS] = useState({ membership: true, signIn: true, visitHistory: true, favorites: true, offers: true, recommendations: true });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_membership', JSON.stringify(s));
    }
  }, [s]);
  const T = ({ label, desc, k }) => (
    <label className="flex items-center justify-between py-3 border-b border-slate-800 cursor-pointer">
      <div><p className="text-sm font-medium text-slate-200">{label}</p><p className="text-xs text-slate-600">{desc}</p></div>
      <div onClick={() => setS(prev => ({...prev, [k]: !prev[k]}))}>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${s[k] ? 'bg-amber-500' : 'bg-slate-700'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s[k] ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  );
  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 8 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Membership and loyalty</h2>
        <p className="text-slate-400">Reward repeat guests and build a loyal customer base with personalized experiences.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <T label="Guest Membership Program" desc="Allow repeat guests to create a membership" k="membership" />
        <T label="Guest Sign-In During Visit" desc="Let guests sign in to unlock their profile" k="signIn" />
        <T label="Visit History" desc="Track guest visit counts and spending" k="visitHistory" />
        <T label="Favorites" desc="Guests can save their favourite items" k="favorites" />
        <T label="Loyalty Offers" desc="Show membership perks and offers" k="offers" />
        <T label="Smart Recommendations" desc="Suggest items based on past orders" k="recommendations" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[['Bronze', 'First visit', 'text-amber-700'], ['Silver', '5+ visits', 'text-slate-300'], ['Gold', '10+ visits', 'text-amber-400'], ].map(([tier, req, color]) => (
          <div key={tier} className="text-center p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className={`text-lg font-black ${color}`}>{tier}</p>
            <p className="text-xs text-slate-500 mt-0.5">{req}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
