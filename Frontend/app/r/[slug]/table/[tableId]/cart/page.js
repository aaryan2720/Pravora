'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChefHat, ChevronLeft, ShoppingBag, Send, FileText } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

export default function CartReviewPage({ params }) {
  const router = useRouter();
  const { cart, updateCartQty, clearCart, cartTotal, activeSession, user } = useApp();
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || 'spice-garden';
  const tableId = unwrappedParams?.tableId || 'tbl_1';

  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  // Billing calculation
  const subtotal = cartTotal;
  const gst = Math.round(subtotal * 0.18);
  const service = Math.round(subtotal * 0.05);
  const total = subtotal + gst + service;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!activeSession?._id) {
      toast.error('Session expired or inactive. Please scan QR again.');
      return;
    }

    // Diner account registration/login is mandatory to place orders
    if (!user) {
      toast.success('Please sign in or create a diner account to place your order! 🎁');
      router.push(`/auth/customer/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    setSending(true);
    try {
      // Map global cart structure to backend item request structure (itemId, name, price, qty)
      const mappedItems = cart.map(c => ({
        itemId: c.itemId,
        name: c.name,
        price: c.price,
        qty: c.qty
      }));

      const res = await api.orders.place({
        sessionId: activeSession._id,
        items: mappedItems,
        guestNote: notes.trim()
      });

      if (res.success) {
        toast.success('🔥 Order sent to kitchen! Cooking starts now.');
        clearCart();
        router.push(`/r/${slug}/session/${tableId}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 animate-fadeIn">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <Link href={`/r/${slug}/menu`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ChevronLeft size={16} /> Menu
        </Link>
        <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Review Order</span>
        <span className="text-xs text-slate-500">Cart</span>
      </header>

      {/* Main body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        {cart.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <ShoppingBag size={24} />
            </div>
            <p className="text-slate-500 text-sm">Your order card is empty</p>
            <Link href={`/r/${slug}/menu`}>
              <Button variant="primary" size="sm">Go Back to Menu</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* List */}
            <div className="space-y-3 animate-fadeInUp">
              {cart.map(item => (
                <div key={item.itemId} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => updateCartQty(item.itemId, item.qty - 1)} 
                      className="w-8 h-8 min-w-[36px] min-h-[36px] rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-amber-400 w-5 text-center">{item.qty}</span>
                    <button 
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => updateCartQty(item.itemId, item.qty + 1)} 
                      className="w-8 h-8 min-w-[36px] min-h-[36px] rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-white w-14 text-right">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                <FileText size={12} /> Notes for Chef
              </label>
              <textarea
                className="input-base text-sm resize-none"
                rows={2}
                placeholder="Allergies, spice preference, etc..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Billing totals */}
            <Card className="p-4 bg-slate-900 border-slate-800 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>GST / Taxes (18%)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Service Charge (5%)</span>
                <span>₹{service.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2.5 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </Card>
          </>
        )}
      </main>

      {/* Sticky footer actions */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-slate-900 bg-slate-950/95 backdrop-blur-sm sticky bottom-0 z-30">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Cost</p>
              <p className="text-lg font-black text-white">₹{total.toLocaleString()}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={sending}
              className="px-6 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send size={15} /> Place Order
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
