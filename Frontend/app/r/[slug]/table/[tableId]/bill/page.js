'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, CreditCard } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

export default function RequestBillPage({ params }) {
  const router = useRouter();
  const { activeRestaurant, activeSession, setActiveSession, user } = useApp();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || 'tbl_1';

  const [bill, setBill] = useState(null);
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState('online'); // online | card_waiter | cash
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchOrGenerateBill = async () => {
      // Diner account is mandatory to view/settle bills
      if (!user) {
        toast.success('Please sign in or create a diner account to check out! 🎁');
        router.push(`/auth/customer/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
        setLoading(false);
        return;
      }

      const sessionId = activeSession?._id;
      if (!sessionId) {
        toast.error('Session not found. Scan table QR code again.');
        setLoading(false);
        return;
      }

      try {
        // Try getting existing bill first
        const res = await api.billing.get(sessionId);
        if (res.success && res.bill) {
          setBill(res.bill);
        } else {
          // If response succeeded but no bill, generate it
          const genRes = await api.billing.generate(sessionId);
          if (genRes.success && genRes.bill) {
            setBill(genRes.bill);
          } else {
            toast.error('Failed to prepare your bill. Please notify staff.');
          }
        }
      } catch (err) {
        console.log('No active bill found. Attempting to generate a new invoice...');
        try {
          const genRes = await api.billing.generate(sessionId);
          if (genRes.success && genRes.bill) {
            setBill(genRes.bill);
          } else {
            toast.error('Failed to prepare your bill. Please notify staff.');
          }
        } catch (e) {
          console.error('Error generating bill:', e);
          toast.error('Unable to fetch invoice details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrGenerateBill();
  }, [activeSession]);

  const handlePay = async () => {
    if (!bill?._id) return;
    setPaying(true);
    try {
      // Settle payment on backend. This automatically updates table status and closes session.
      const paymentMethodMapped = method === 'online' ? 'card' : method === 'card_waiter' ? 'card' : 'cash';
      const res = await api.billing.pay(bill._id, paymentMethodMapped);
      
      if (res.success) {
        toast.success('🎉 Bill payment request received! Thank you.');
        
        // Clear active session locally so new scanner can pair
        setActiveSession(null);
        localStorage.removeItem('activeSession');
        
        router.push(`/r/${slug}/payment/success`);
      }
    } catch (err) {
      toast.error(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Preparing final bill invoice...</p>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <h1 className="text-xl font-bold text-rose-400 mb-2">No Active Invoice</h1>
        <p className="text-sm text-slate-500 mb-4">Please make sure you have placed orders before checking out.</p>
        <Link href={`/r/${slug}/session/${tableId}`} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-700">Back to Session</Link>
      </div>
    );
  }

  const subtotal = bill.subtotal || 0;
  const gst = bill.tax || 0;
  const service = bill.serviceCharge || 0;
  const total = subtotal + gst + service + tip;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 pb-20 animate-fadeIn">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <Link href={`/r/${slug}/session/${tableId}`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ChevronLeft size={16} /> Session
        </Link>
        <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Request Checkout</span>
        <span className="text-xs text-slate-500">Checkout</span>
      </header>

      {/* Main body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Receipt size={22} />
          </div>
          <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Final Bill</h2>
          <p className="text-xs text-slate-500">{activeRestaurant?.name || 'Restaurant'} · Invoice</p>
        </div>

        {/* Itemized list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Items</p>
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            {bill.orders?.flatMap(o => o.items || []).map((item, i) => (
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
                type="button"
                aria-label={val === 0 ? 'No Tip' : `Tip ₹${val}`}
                onClick={() => setTip(val)}
                className={`min-h-[44px] px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                  tip === val
                    ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
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
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
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
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 animate-fadeIn">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>GST (18%)</span>
            <span>₹{gst}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Service</span>
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
            disabled={paying}
            className="px-6 gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            {paying ? 'Processing...' : method === 'online' ? 'Proceed to Pay' : 'Request Bill'}
          </Button>
        </div>
      </div>
    </div>
  );
}
