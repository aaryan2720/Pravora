'use client';
import { use } from 'react';
import { CheckCircle2, ChevronRight, Share2, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';

  const shareReceipt = () => {
    toast.success('Receipt link copied!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center">
        {/* Animated green check circle */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Payment Verified!</h1>
        <p className="text-slate-400 text-sm mb-6">Thank you for dining with us at Spice Garden. Your table session has been settled.</p>

        {/* Bill settlement receipt preview card */}
        <Card className="w-full p-5 border-slate-800 bg-slate-900 mb-6 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80 mb-3">
            <span className="text-xs text-slate-500">Transaction ID</span>
            <span className="text-xs font-mono text-slate-400">TXN_SL908127</span>
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-slate-400"><span>Paid for Table</span><span className="font-semibold text-slate-300">T1</span></div>
            <div className="flex justify-between text-xs text-slate-400"><span>Guests</span><span className="font-semibold text-slate-300">2</span></div>
            <div className="flex justify-between text-xs text-slate-400"><span>Total Settled</span><span className="font-semibold text-slate-300">₹1,426</span></div>
          </div>
          <button onClick={shareReceipt} className="w-full py-2 rounded-xl text-xs bg-slate-800 text-slate-300 border border-slate-700 hover:text-white flex items-center justify-center gap-1.5 transition-all">
            <Share2 size={12} />
            Share Digital Receipt
          </button>
        </Card>

        {/* Actions */}
        <div className="w-full space-y-3">
          <Link href={`/r/${slug}/exit`}>
            <Button variant="primary" size="lg" className="w-full gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              Proceed to Exit
              <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      <footer className="text-center text-[10px] text-slate-600">
        Paid securely via Pravora Pay · GST Invoice #IN-90812
      </footer>
    </div>
  );
}
