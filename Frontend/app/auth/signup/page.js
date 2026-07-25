'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChefHat, Mail, Lock, Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    if (form.password.length < 8) e.password = 'Password must be 8+ characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Account created! Let\'s set up your restaurant.');
    router.push('/onboarding/type');
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Signed in with Google!');
    router.push('/onboarding/type');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 max-w-xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <ChefHat size={16} className="text-slate-900" />
          </div>
          <span className="font-bold text-lg text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Serve<span className="text-amber-400">Loop</span>
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

        {/* Google OAuth */}
        <Button variant="secondary" size="lg" onClick={handleGoogle} disabled={loading} className="w-full mb-6 gap-3">
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <Divider label="or continue with email" className="mb-6" />

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
        background: 'radial-gradient(ellipse at 30% 50%, rgba(245,158,11,0.12) 0%, transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.08) 0%, transparent 60%), #0f172a'
      }}>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-6">
              <ChefHat size={32} className="text-slate-900" />
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
