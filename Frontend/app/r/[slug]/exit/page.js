'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { ChefHat, Heart, Star, Compass, UserCheck } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export default function GuestExitPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewSent, setReviewSent] = useState(false);

  const submitRating = async (stars) => {
    setRating(stars);
    setReviewSent(true);
    toast.success('💖 Thank you for your feedback!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center">
        {/* Heart icon */}
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 text-rose-400 animate-pulse">
          <Heart size={30} fill="currentColor" />
        </div>

        <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Thank you!</h1>
        <p className="text-slate-400 text-sm mb-6">We hope you had a wonderful dining experience at Spice Garden. Come back soon!</p>

        {/* Membership tier points reward card */}
        <Card className="w-full p-5 border-slate-800 bg-slate-900 mb-6">
          <div className="flex items-center gap-3 justify-center mb-3">
            <UserCheck size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-slate-200">Points Earned Today</span>
          </div>
          <p className="text-3xl font-black text-amber-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>+140</p>
          <p className="text-xs text-slate-500">Member Status: Silver Tier (Gold in 4 visits)</p>
        </Card>

        {/* Quick review widget */}
        <div className="mb-8 w-full">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rate your experience</p>
          {reviewSent ? (
            <p className="text-sm text-emerald-400 font-semibold">Your rating has been recorded. Thank you!</p>
          ) : (
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => submitRating(num)}
                  onMouseEnter={() => setHovered(num)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 text-slate-600 hover:scale-110 active:scale-95 transition-all"
                >
                  <Star
                    size={32}
                    className={
                      num <= (hovered || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Back to discover */}
        <Link href="/discover" className="w-full">
          <Button variant="secondary" size="lg" className="w-full gap-2">
            <Compass size={16} />
            Discover More Places
          </Button>
        </Link>
      </div>

      <footer className="text-center text-[10px] text-slate-600">
        Powered by Pravora · Seamless dining experience
      </footer>
    </div>
  );
}
