'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Divider } from '@/components/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

import { Suspense } from 'react';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/discover';
  const { signIn } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.customerRegister(form);
      if (res.success) {
        toast.success('Foodie account created successfully!');
        signIn(res.guest, res.accessToken);
        router.push(redirectPath);
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Signed in with Google!');
    router.push('/discover');
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-black text-white mb-2 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Join the Diner Circle! 🍽️
          </h1>
          <div className="p-3.5 mb-6 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5 leading-relaxed text-left">
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Get Digital Bills directly to your inbox</p>
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Earn loyalty points at cafes all over the world</p>
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Receive personalized food recommendations using AI</p>
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Track your kitchen timeline live</p>
          </div>

          {/* Google */}
          <Button variant="secondary" size="md" onClick={handleGoogle} disabled={loading} className="w-full mb-5 gap-3">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <Divider label="or sign up with email" className="mb-5" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-base pl-10 text-sm"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Email or Mobile Number</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-base pl-10 text-sm"
                  placeholder="you@email.com or phone"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-base pl-10 pr-10 text-sm"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
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

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-2 gap-2 shadow-[0_0_20px_rgba(253,109,35,0.2)]">
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already in the loop?{' '}
            <Link href="/auth/customer/signin" className="text-brand-orange hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerSignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm">Loading sign up portal...</p>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
