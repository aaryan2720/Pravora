'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, Divider } from '@/components/ui';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be 6+ characters'; // aligned with backend validator (min 6)
    return e;
  };

  const { signIn } = require('@/lib/context/AppContext').useApp();
  const { api } = require('@/lib/api');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      // Pass standard registration details. In version 1, restaurant stub is created automatically.
      const res = await api.auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
        restaurantName: `${form.name}'s Restaurant`
      });
      if (res.success) {
        toast.success("Welcome! Let's set up your restaurant.");
        signIn(res.user, res.accessToken);
        router.push('/onboarding');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    toast.error('Google OAuth not configured. Please use Email and Password.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 max-w-xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <img src="/favicon.svg" alt="ServeLoop" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-brand-orange">Serve</span><span className="text-brand-yellow">Loop</span>
          </span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Create your account
          </h1>
          <p className="text-slate-400">
            Set up your restaurant in minutes. No credit card required.
          </p>
        </div>

        <Divider label="Register with Email and Password" className="mb-6" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input
              className="input-base"
              placeholder="Ravi Kumar"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
          </div>

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
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-base pl-10 pr-10"
                placeholder="Min. 8 characters"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
          </div>

          {/* Password strength */}
          {form.password && (
            <div className="flex gap-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${form.password.length >= i*2 ? (i <= 2 ? 'bg-rose-500' : i === 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-700'}`} />
              ))}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                <Zap size={16} />
                Create Free Account
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        {/* Checklist */}
        <div className="mt-6 space-y-2">
          {['Free forever plan available', 'No credit card required', '5-minute restaurant setup'].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500 mt-8 text-center">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
        </p>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(253,109,35,0.06) 0%, transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(253,190,19,0.04) 0%, transparent 60%), #f8fafc'
      }}>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center mx-auto mb-6">
              <img src="/favicon.svg" alt="ServeLoop" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your restaurant,<br />
              <span className="gradient-text-amber">fully connected.</span>
            </h2>
            <p className="text-slate-400 text-base mb-8 max-w-xs mx-auto leading-relaxed">
              From guest discovery to bill payment — manage everything from one intelligent dashboard.
            </p>
            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
              {['QR Table Sessions', 'Live Orders', 'Analytics', 'AI Insights', 'Reservations', 'Membership'].map(f => (
                <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 border border-amber-500/10 rounded-full" />
        <div className="absolute -top-10 -right-10 w-40 h-40 border border-amber-500/10 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 border border-emerald-500/10 rounded-full" />
      </div>
    </div>
  );
}
