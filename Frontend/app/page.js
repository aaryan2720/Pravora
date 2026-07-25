'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChefHat, Zap, ArrowRight, CheckCircle2, Star, TrendingUp, QrCode, BarChart3, Users, Clock, Shield, Sparkles, ChevronRight, Play } from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import { Button, Badge, Card } from '@/components/ui';

const features = [
  {
    icon: QrCode,
    title: 'QR Table Sessions',
    description: 'Each table gets a unique QR identity. Guests scan, order, and pay — all inside the browser. Zero app downloads.',
    color: 'amber',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: Zap,
    title: 'Live Pulse Dashboard',
    description: 'Rush level, delayed tables, low-stock alerts, revenue, and top items — all updating in real time from one view.',
    color: 'jade',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    icon: TrendingUp,
    title: 'Instant Price Control',
    description: 'Update menu prices, toggle specials, and manage availability instantly. Your dashboard is the control room.',
    color: 'sky',
    glow: 'rgba(14,165,233,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Actionable Analytics',
    description: 'Peak hours, top dishes, table turnover, membership growth — daily business intelligence without spreadsheets.',
    color: 'violet',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: Users,
    title: 'Guest Membership',
    description: 'Repeat guests sign in to unlock favorites, visit history, and personalized loyalty offers.',
    color: 'rose',
    glow: 'rgba(244,63,94,0.15)',
  },
  {
    icon: Sparkles,
    title: 'AI-Guided Onboarding',
    description: 'Gemini analyzes your restaurant profile and recommends the best workflow mix in minutes.',
    color: 'amber',
    glow: 'rgba(245,158,11,0.15)',
  },
];

const stats = [
  { value: '2 min', label: 'Average onboarding time', icon: Clock },
  { value: '94%', label: 'Order accuracy improvement', icon: CheckCircle2 },
  { value: '3×', label: 'Faster table turnover', icon: TrendingUp },
  { value: '4.8★', label: 'Average guest rating', icon: Star },
];

const testimonials = [
  { name: 'Ravi Shankar', role: 'Owner, Spice Garden', avatar: 'RS', rating: 5, text: 'ServeLoop changed how we operate. Staff coordination went from chaotic to seamless. Our kitchen wait times dropped by 40%.' },
  { name: 'Priya Nair', role: 'Manager, Saffron House', avatar: 'PN', rating: 5, text: 'The pulse dashboard gives me a view of the entire floor without walking around. Best decision we made this year.' },
  { name: 'Arjun Mehta', role: 'Owner, Bamboo Bowl', avatar: 'AM', rating: 5, text: "The QR ordering system is loved by our guests. No app, no friction. Just scan and order. Revenue went up immediately." },
];

const howItWorks = [
  { step: '01', title: 'Create your restaurant profile', desc: 'Answer a few smart questions. Gemini analyzes your setup and recommends the best workflow.' },
  { step: '02', title: 'Set up your menu and tables', desc: 'Add menu items with live availability states. Generate unique QR codes for each table.' },
  { step: '03', title: 'Go live and take control', desc: 'Your staff gets an operations dashboard. Guests get a seamless table session experience.' },
];

const colorMap = {
  amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24', icon: 'text-amber-400' },
  jade: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#34d399', icon: 'text-emerald-400' },
  sky: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)', text: '#38bdf8', icon: 'text-sky-400' },
  violet: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#a78bfa', icon: 'text-violet-400' },
  rose: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)', text: '#fb7185', icon: 'text-rose-400' },
};

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseFloat(target);
    if (isNaN(num)) return;
    const dur = 1500;
    const steps = 50;
    const inc = num / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= num) { setCount(num); clearInterval(timer); }
      else setCount(parseFloat(cur.toFixed(1)));
    }, dur / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{isNaN(parseFloat(target)) ? target : `${count}${suffix}`}</>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNav />

      {/* Hero */}
      <section className="relative hero-mesh noise-overlay overflow-hidden pt-32 pb-24 px-4">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8 animate-fadeIn">
            <Sparkles size={14} />
            AI-powered restaurant operating system
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.05] animate-fadeInUp">
            <span className="text-white">Your restaurant,</span><br />
            <span className="gradient-text-hero">running smarter.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp delay-100">
            Connect guests, staff, kitchen, and management in real time. Live QR ordering, instant menu control, 
            and an operations dashboard that actually tells you what's happening.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fadeInUp delay-200">
            <Link href="/auth/signup">
              <Button variant="primary" size="xl" className="gap-3 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Zap size={18} />
                Start for Free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="glass" size="xl" className="gap-3">
                <Play size={16} className="fill-current" />
                See Live Demo
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 animate-fadeInUp delay-300">
            {['No credit card required', 'Setup in under 5 minutes', 'Cancel anytime'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Hero visual — Dashboard mockup */}
        <div className="relative z-10 max-w-5xl mx-auto mt-20 animate-fadeInUp delay-400">
          <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Mock dashboard header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-800/50">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-400">
                  app.serveloop.in/dashboard
                </div>
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="bg-slate-900/90 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Tables', value: '9 / 16', color: 'text-amber-400', sub: '3 paying' },
                  { label: "Today's Revenue", value: '₹48,420', color: 'text-emerald-400', sub: '87 orders' },
                  { label: 'Rush Level', value: '72%', color: 'text-rose-400', sub: 'High traffic' },
                  { label: 'Avg Wait', value: '14 min', color: 'text-sky-400', sub: 'On target' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                    <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Mock table grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[
                  { t: 'T1', s: 'occupied', c: 'border-amber-500/50 bg-amber-500/10' },
                  { t: 'T2', s: 'free', c: 'border-emerald-500/50 bg-emerald-500/10' },
                  { t: 'T3', s: 'occupied', c: 'border-amber-500/50 bg-amber-500/10' },
                  { t: 'T4', s: 'reserved', c: 'border-violet-500/50 bg-violet-500/10' },
                  { t: 'T5', s: 'occupied', c: 'border-amber-500/50 bg-amber-500/10' },
                  { t: 'T6', s: 'paying', c: 'border-sky-500/50 bg-sky-500/10' },
                  { t: 'T7', s: 'free', c: 'border-emerald-500/50 bg-emerald-500/10' },
                  { t: 'T8', s: 'occupied', c: 'border-amber-500/50 bg-amber-500/10' },
                ].map(t => (
                  <div key={t.t} className={`rounded-xl border-2 p-3 text-center ${t.c}`}>
                    <p className="text-xs font-bold text-slate-200">{t.t}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 capitalize">{t.s}</p>
                  </div>
                ))}
              </div>

              {/* Live label */}
              <div className="flex items-center gap-2 mt-4">
                <span className="status-dot live" />
                <span className="text-xs text-slate-500">Live · Updated just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <s.icon size={24} className="text-amber-400 mx-auto mb-3" />
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="amber" className="mb-4">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Everything your restaurant needs.<br />
              <span className="gradient-text-amber">Nothing it doesn't.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Built for real restaurant operations — not for food delivery. Every feature solves a real problem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <div key={i} className="card-hover rounded-2xl border p-6 group" style={{ background: c.bg, borderColor: c.border }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <f.icon size={22} style={{ color: c.text }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="jade" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Live in <span className="gradient-text-jade">under 5 minutes.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-amber-500/40 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-black text-amber-500/20 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="violet" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-black text-white">
              Restaurants love ServeLoop.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 bg-slate-900 border-slate-800">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 text-center relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(16,185,129,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <Zap size={40} className="text-amber-400 mx-auto mb-6 relative z-10" />
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 relative z-10">
              Ready to upgrade your<br />
              <span className="gradient-text-amber">restaurant operations?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 relative z-10">
              Join hundreds of restaurants already using ServeLoop to run smarter.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link href="/auth/signup">
                <Button variant="primary" size="xl" className="shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  <Zap size={18} />
                  Start Free Today
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="xl">
                  View Pricing
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <ChefHat size={14} className="text-slate-900" />
              </div>
              <span className="font-bold text-base text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Serve<span className="text-amber-400">Loop</span>
              </span>
            </div>
            <p className="text-sm text-slate-600">© 2025 ServeLoop. Smart restaurant operations platform.</p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
              <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
              <Link href="/discover" className="hover:text-slate-300 transition-colors">Explore</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
