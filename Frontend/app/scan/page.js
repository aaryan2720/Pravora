'use client';
import { useState } from 'react';
import Link from 'next/link';
import { QrCode, Camera, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import PublicNav from '@/components/layout/PublicNav';

export default function ScanPage() {
  const [mode, setMode] = useState('ready'); // ready | scanning | manual | done
  const [tableId, setTableId] = useState('');

  const startScan = () => {
    setMode('scanning');
    // Simulate scan after 2s
    setTimeout(() => {
      setMode('done');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNav />
      <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
              <QrCode size={30} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Scan Table QR</h1>
            <p className="text-slate-400 text-sm">Point your camera at the QR code on your table to start ordering</p>
          </div>

          {mode === 'ready' && (
            <div className="space-y-3">
              <Button variant="primary" size="xl" className="w-full gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]" onClick={startScan}>
                <Camera size={20} />
                Open Camera
              </Button>
              <div className="text-center text-xs text-slate-600 py-2">or</div>
              <Button variant="secondary" size="lg" className="w-full" onClick={() => setMode('manual')}>
                Enter Table ID Manually
              </Button>
            </div>
          )}

          {mode === 'scanning' && (
            <div className="text-center">
              <div className="relative w-56 h-56 mx-auto mb-6">
                {/* Scanner frame */}
                <div className="absolute inset-0 bg-slate-900 rounded-2xl border-2 border-amber-500/50 overflow-hidden flex items-center justify-center">
                  <div className="text-4xl opacity-30">📷</div>
                  {/* Scan line animation */}
                  <div className="absolute left-4 right-4 h-0.5 bg-amber-400/60 animate-bounce top-1/2" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />
                </div>
                {/* Corner markers */}
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8`}>
                    <div className={`w-full h-full border-amber-400 border-[3px] ${i === 0 ? 'border-r-0 border-b-0 rounded-tl-lg' : i === 1 ? 'border-l-0 border-b-0 rounded-tr-lg' : i === 2 ? 'border-r-0 border-t-0 rounded-bl-lg' : 'border-l-0 border-t-0 rounded-br-lg'}`} />
                  </div>
                ))}
              </div>
              <p className="text-sm text-amber-400 font-medium">Scanning for QR code...</p>
              <p className="text-xs text-slate-600 mt-1">Hold steady over the table QR code</p>
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Enter Table ID or Scan URL</label>
                <input
                  className="input-base text-base"
                  placeholder="e.g. T1, T12, or paste QR URL"
                  value={tableId}
                  onChange={e => setTableId(e.target.value)}
                />
              </div>
              <Link href={`/r/spice-garden/table/${tableId || 'tbl_1'}`}>
                <Button variant="primary" size="lg" className="w-full" disabled={!tableId}>
                  Go to Table Session
                  <ChevronRight size={16} />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setMode('ready')}>← Back</Button>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15 text-xs text-amber-400/80">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                Camera access not available? Enter the table number shown on the QR code stand.
              </div>
            </div>
          )}

          {mode === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>QR Scanned!</p>
              <p className="text-sm text-slate-400">Table T1 detected · Spice Garden</p>
              <Link href="/r/spice-garden/table/tbl_1">
                <Button variant="primary" size="lg" className="w-full shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  Start Table Session <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
