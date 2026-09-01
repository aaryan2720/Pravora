'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function QRResolveInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid table code. Please scan a valid QR code.');
      return;
    }

    const resolveQR = async () => {
      try {
        const res = await api.tables.resolveToken(token);
        if (res.success) {
          // Redirect the guest to their paired dining entry page
          router.push(`/r/${res.restaurant.slug}/table/${res.table.id}`);
        } else {
          setError(res.message || 'QR code resolution failed.');
        }
      } catch (err) {
        setError(err.message || 'Unable to scan this QR code. Please try again.');
      }
    };
    resolveQR();
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-sm text-center">
      <Link href="/" className="inline-block">
        <img src="/favicon.svg" alt="Pravora" width="48" height="48" className="w-12 h-12 mx-auto mb-6 animate-pulse" />
      </Link>
      
      {error ? (
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-rose-400">Scan Error</h1>
          <p className="text-sm text-slate-400 leading-relaxed bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
            {error}
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-xl cursor-pointer">
              Try Again
            </button>
            <Link href="/discover" className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-semibold rounded-xl cursor-pointer">
              Explore Cafes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Resolving Table paired session...</h1>
          <div className="flex justify-center gap-1.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping delay-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping delay-150" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            Pravora is matching your table number and active session...
          </p>
          <div className="pt-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-white underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QRResolvePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <Suspense fallback={
        <div className="w-full max-w-sm text-center space-y-3">
          <img src="/favicon.svg" alt="Pravora" width="48" height="48" className="w-12 h-12 mx-auto mb-6 animate-pulse" />
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Loading gateway...</h1>
        </div>
      }>
        <QRResolveInner />
      </Suspense>
    </div>
  );
}
