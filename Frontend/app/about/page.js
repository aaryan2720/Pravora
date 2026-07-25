'use client';
import Link from 'next/link';
import { ChefHat, ArrowRight, ShieldCheck, Heart, Sparkles, Coffee } from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import { Button, Card } from '@/components/ui';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-900">
      <PublicNav />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
            We're on a mission to <span className="gradient-text-amber">redefine restaurant hospitality</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            ServeLoop was built to connect dining rooms, kitchens, guests, and management in one seamless, real-time operating ecosystem.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-black mb-4 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Why we started
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed text-sm">
              <p>
                As diners and tech enthusiasts, we noticed a persistent gap: restaurants use disjointed tools for reservations, POS, QR ordering, and employee shifts. Guests wait too long to order or pay, kitchens get overwhelmed, and managers fly blind.
              </p>
              <p>
                We built ServeLoop as a single source of truth. By bringing table states, order cycles, inventory, and staff rosters under one intelligent dashboard, we empower operators to do what they do best: focus on the hospitality.
              </p>
            </div>
          </div>
          <div className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-6">
              <ChefHat className="text-amber-400" size={24} />
            </div>
            <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Modern Tech for Modern Kitchens</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed from day one for zero lag, deep visibility, and real-time synchronization across devices.
            </p>
            {/* Design circle */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 border border-slate-800 rounded-full" />
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Our Core Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Reliability', desc: 'No system lag. When a guest orders, it reaches the kitchen screen instantly.' },
              { icon: Sparkles, title: 'Intelligence', desc: 'Smarter operations via Gemini AI for predictions, stock planning, and metrics.' },
              { icon: Coffee, title: 'Intuitive Design', desc: 'Easy on the eyes, quick for staff to operate, and delighting for guests to order.' }
            ].map((v, i) => (
              <Card key={i} className="p-6">
                <v.icon className="text-amber-400 mb-4" size={32} />
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 text-center max-w-xl mx-auto">
        <h2 className="text-3xl font-black mb-4 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Join the Loop</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Get started today and experience the difference of a fully connected restaurant operations platform.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/signup">
            <Button variant="primary" size="md">Get Started Free</Button>
          </Link>
          <Link href="/discover">
            <Button variant="secondary" size="md">Explore Restaurants</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
