'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Divider } from '@/components/ui';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.login(form);
      if (res.success) {
        toast.success('Welcome back!');
        signIn(res.user, res.accessToken);
        // Redirect based on whether restaurant onboarding is complete or if user is a global super-admin
        if (res.user.role === 'admin') {
          router.push('/dashboard/saas');
        } else if (res.user.restaurantId) {
          const restaurantRes = await api.restaurant.getById(res.user.restaurantId);
          if (restaurantRes.success && restaurantRes.restaurant.onboardingComplete) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    toast.error('Google OAuth not configured. Please use Email and Password.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 group">
          <img src="/favicon.svg" alt="ServeLoop" className="w-9 h-9 object-contain" />
          <span className="font-bold text-xl text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-brand-orange">Serve</span><span className="text-brand-yellow">Loop</span>
          </span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-1 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm text-center mb-7">Sign in to your restaurant dashboard</p>

          <Divider label="Email and Password" className="mb-5" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-base pl-10"
                  placeholder="you@restaurant.com"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-base pl-10 pr-10"
                  placeholder="Your password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-1 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </Button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            New to ServeLoop?{' '}
            <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300 font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
