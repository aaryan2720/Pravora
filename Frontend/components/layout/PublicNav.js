'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChefHat, Zap } from 'lucide-react';
import { Button } from '@/components/ui';

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-400 transition-colors">
              <ChefHat size={16} className="text-slate-900" />
            </div>
            <span className="font-bold text-lg text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Serve<span className="text-amber-400">Loop</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '/about', label: 'How It Works' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/discover', label: 'Explore' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">
                <Zap size={14} />
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 flex flex-col gap-3">
            {[
              { href: '/about', label: 'How It Works' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/discover', label: 'Explore' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="text-slate-300 hover:text-white py-2 font-medium transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-800">
              <Link href="/auth/signin" onClick={() => setOpen(false)}>
                <Button variant="secondary" size="md" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)}>
                <Button variant="primary" size="md" className="w-full">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
