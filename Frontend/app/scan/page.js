'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import PublicNav from '@/components/layout/PublicNav';

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState('ready'); // ready | scanning

  const startScan = () => {
    setMode('scanning');
    // Simulate scan after 2s and redirect immediately
    setTimeout(() => {
      router.push('/r/spice-garden/table/tbl_1');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNav />
      <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
              <QrCode size={30} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Scan Table QR</h1>
            <p className="text-slate-400 text-sm">Point your camera at the QR code on your table to start ordering</p>
          </div>

          {mode === 'ready' && (
            <div className="space-y-3">
              <Button variant="primary" size="xl" className="w-full gap-3 shadow-[0_0_20px_rgba(253,109,35,0.25)]" onClick={startScan}>
                <Camera size={20} />
                Open Camera & Scan
              </Button>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-500 leading-relaxed text-left">
                ℹ️ Scanning the table QR code automatically pairs your phone with your table number and activates your dining session instantly.
              </div>
            </div>
          )}

          {mode === 'scanning' && (
            <div className="text-center">
              <div className="relative w-56 h-56 mx-auto mb-6">
                {/* Scanner frame */}
                <div className="absolute inset-0 bg-slate-900 rounded-2xl border-2 border-brand-orange/50 overflow-hidden flex items-center justify-center">
                  <div className="text-4xl opacity-30">📷</div>
                  {/* Scan line animation */}
                  <div className="absolute left-4 right-4 h-0.5 bg-brand-orange/60 animate-bounce top-1/2" style={{ boxShadow: '0 0 8px rgba(253,109,35,0.6)' }} />
                </div>
                {/* Corner markers */}
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8`}>
                    <div className={`w-full h-full border-brand-orange border-[3px] ${i === 0 ? 'border-r-0 border-b-0 rounded-tl-lg' : i === 1 ? 'border-l-0 border-b-0 rounded-tr-lg' : i === 2 ? 'border-r-0 border-t-0 rounded-bl-lg' : 'border-l-0 border-t-0 rounded-br-lg'}`} />
                  </div>
                ))}
              </div>
              <p className="text-sm text-brand-orange font-medium animate-pulse">Initializing camera & scanning...</p>
              <p className="text-xs text-slate-500 mt-1">Simulating scan detection of Table T1...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
