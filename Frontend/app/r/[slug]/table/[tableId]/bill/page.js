'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, CreditCard, Sparkles } from 'lucide-react';
import { mockSession } from '@/lib/mockData';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export default function RequestBillPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || 'tbl_1';
  const session = mockSession;

  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState('online'); // online | card_waiter | cash
  const [loading, setLoading] = useState(false);

  const subtotal = session.subtotal;
  const gst = session.tax;
  const service = session.serviceCharge;
  const total = subtotal + gst + service + tip;

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('🎉 Bill request received!');
    router.push(`/r/${slug}/payment/success`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 pb-20">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <Link href={`/r/${slug}/session/${tableId}`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ChevronLeft size={16} /> Session
        </Link>
        <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Request Checkout</span>
        <span className="text-xs text-slate-500">T1</span>
      </header>

      {/* Main body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Receipt size={22} />
          </div>
          <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Final Bill</h2>
          <p className="text-xs text-slate-500">Spice Garden · Table T1</p>
        </div>

        {/* Itemized list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Items</p>
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            {session.orders.flatMap(o => o.items).map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{item.qty}× {item.name}</span>
                <span className="text-slate-400">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add a Tip for Staff</p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 50, 100, 200].map(val => (
              <button
                key={val}
                onClick={() => setTip(val)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  tip === val
                    ? 'bg-amber-500 text-slate-900 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {val === 0 ? 'No Tip' : `₹${val}`}
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Method</p>
          <div className="space-y-2">
            {[
              { id: 'online', label: 'Pay online now', desc: 'UPI, Card, Netbanking (Instant)', icon: CreditCard },
              { id: 'card_waiter', label: 'Bring card machine', desc: 'Waiter will bring POS terminal', icon: CreditCard },
              { id: 'cash', label: 'Pay with cash', desc: 'Waiter will bring change', icon: Receipt },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                  method === m.id
                    ? 'bg-amber-500/10 border-amber-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <m.icon size={18} className={method === m.id ? 'text-amber-400' : 'text-slate-500'} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{m.label}</p>
                  <p className="text-xs text-slate-500">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bill summary */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>GST (18%)</span>
            <span>₹{gst}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Service (5%)</span>
            <span>₹{service}</span>
          </div>
          {tip > 0 && (
            <div className="flex justify-between text-xs text-amber-400">
              <span>Tip</span>
              <span>₹{tip}</span>
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-black text-white">
            <span>Amount Due</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </main>

      {/* Sticky pay actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/95 border-t border-slate-900 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Payable</p>
            <p className="text-lg font-black text-white">₹{total.toLocaleString()}</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handlePay}
            disabled={loading}
            className="px-6 gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            {method === 'online' ? 'Proceed to Pay' : 'Request Bill'}
          </Button>
        </div>
      </div>
    </div>
  );
}
