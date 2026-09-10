'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui';
import PublicNav from '@/components/layout/PublicNav';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState('ready'); // ready | scanning
  const [isSecureContext, setIsSecureContext] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setIsSecureContext(hasMedia);
    }
  }, []);

  useEffect(() => {
    let html5QrCode;

    if (mode === 'scanning') {
      // Dynamic import to prevent SSR server-side compilation issues
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        html5QrCode = new Html5Qrcode('qr-reader');
        
        const successCallback = (decodedText) => {
          toast.success('QR Code detected! ✓');
          html5QrCode.stop().then(() => {
            try {
              // Parse URL if scanned text is full link
              const url = new URL(decodedText);
              if (url.pathname.includes('/r/scan')) {
                const token = url.searchParams.get('token');
                if (token) {
                  router.push(`/r/scan?token=${token}`);
                  return;
                }
              }
              if (url.pathname.includes('/r/') && url.pathname.includes('/table/')) {
                router.push(url.pathname);
                return;
              }
              // External link fallback
              window.location.href = decodedText;
            } catch (e) {
              // Raw token string fallback
              if (decodedText.startsWith('tbl-') || decodedText.length > 10) {
                router.push(`/r/scan?token=${decodedText}`);
              } else {
                toast.error('Invalid or unrecognized table code.');
                setMode('ready');
              }
            }
          }).catch(err => {
            console.error('Error stopping scanner:', err);
          });
        };

        const config = { fps: 12, qrbox: { width: 220, height: 220 } };

        html5QrCode.start(
          { facingMode: 'environment' },
          config,
          successCallback
        ).catch(err => {
          console.error('Camera startup failed:', err);
          toast.error('Could not open camera. Please verify camera permissions.');
          setMode('ready');
        });
      }).catch(err => {
        console.error('Html5Qrcode module loading failed:', err);
      });
    }

    return () => {
      if (html5QrCode) {
        // Cleanup scanner if active
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop();
          }
        } catch (err) {
          console.error('Cleanup stop failed:', err);
        }
      }
    };
  }, [mode, router]);

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
            <div className="space-y-3 animate-fadeIn">
              {!isSecureContext && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-left leading-relaxed">
                  ⚠️ <strong>Camera Blocked (Insecure Context):</strong> Browsers block camera access over HTTP local network IPs. 
                  To test on your mobile phone, you must either:
                  <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-slate-400">
                    <li>Use a secure HTTPS tunnel like <strong>ngrok</strong> (e.g. <code className="text-amber-500">ngrok http 3000</code>).</li>
                    <li>Or add your IP to Chrome flags: <code className="block bg-slate-950 p-1.5 rounded-lg font-mono text-[9px] text-slate-300 mt-1 select-all">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></li>
                  </ul>
                </div>
              )}
              <Button variant="primary" size="xl" className="w-full gap-3 shadow-[0_0_20px_rgba(253,109,35,0.25)] cursor-pointer" onClick={() => setMode('scanning')}>
                <Camera size={20} />
                Open Camera & Scan
              </Button>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-500 leading-relaxed text-left">
                ℹ️ Scanning the table QR code automatically pairs your phone with your table number and activates your dining session instantly.
              </div>
            </div>
          )}

          {mode === 'scanning' && (
            <div className="text-center animate-fadeIn relative">
              <button 
                type="button"
                aria-label="Cancel scan"
                onClick={() => setMode('ready')}
                className="absolute -top-12 right-2 min-w-[44px] min-h-[44px] rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Cancel Scan"
              >
                <X size={18} />
              </button>
              
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Scanner container for video stream */}
                <div className="absolute inset-0 bg-slate-900 rounded-2xl border-2 border-brand-orange/50 overflow-hidden flex items-center justify-center">
                  <div id="qr-reader" className="w-full h-full object-cover" />
                  
                  {/* Scan overlay guide line */}
                  <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-brand-orange to-transparent animate-laserScan top-2 z-10 pointer-events-none" style={{ boxShadow: '0 0 12px rgba(233,106,10,0.85)' }} />
                </div>
                
                {/* Corner markers */}
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8 z-20 pointer-events-none`}>
                    <div className={`w-full h-full border-brand-orange border-[3px] ${i === 0 ? 'border-r-0 border-b-0 rounded-tl-lg' : i === 1 ? 'border-l-0 border-b-0 rounded-tr-lg' : i === 2 ? 'border-r-0 border-t-0 rounded-bl-lg' : 'border-l-0 border-t-0 rounded-br-lg'}`} />
                  </div>
                ))}
              </div>
              <p className="text-sm text-brand-orange font-medium animate-pulse">Camera active. Align QR code in target box.</p>
              <p className="text-xs text-slate-500 mt-1">Please allow camera permissions if prompted by your browser.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
