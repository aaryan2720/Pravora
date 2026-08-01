'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Divider } from '@/components/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    setLoading(true);
    try {
      const res = await api.auth.customerGoogleLogin({ idToken });
      if (res.success) {
        toast.success(`Successfully registered Diner account: ${res.guest.name}!`);
        signIn(res.guest, res.accessToken);
        router.push(redirectPath);
      }
    } catch (err) {
      toast.error(err.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 group">
          <img src="/favicon.svg" alt="ServeLoop" className="w-9 h-9 object-contain" />
          <span className="font-bold text-xl text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-amber-500">Serve</span><span className="text-amber-400">Loop</span>
          </span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col">
          <h1 className="text-xl font-black text-white mb-2 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Join the Diner Circle! 🍽️
          </h1>
          <div className="p-3.5 mb-6 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5 leading-relaxed text-left">
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Get Digital Bills directly to your inbox</p>
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Earn loyalty points at cafes all over the world</p>
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Receive personalized food recommendations using AI</p>
            <p className="font-bold text-amber-500 flex items-center gap-1.5">● Track your kitchen timeline live</p>
          </div>

          {/* Google Sign-up component */}
          <div className="w-full flex justify-center mb-5 overflow-hidden rounded-lg">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-Up failed.')}
              theme="filled_dark"
              shape="pill"
              text="signup_with"
              width="320px"
            />
          </div>

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
