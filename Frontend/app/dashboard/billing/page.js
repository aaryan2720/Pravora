'use client';
import { mockTables, mockOrders } from '@/lib/mockData';
import { CreditCard, Receipt, CheckCircle } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [bills, setBills] = useState(
    mockTables.filter(t => t.status === 'occupied' || t.status === 'paying').map(t => ({
      ...t,
      paymentStatus: t.status === 'paying' ? 'pending_payment' : 'open',
    }))
  );

  const markPaid = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'paid' } : b));
    toast.success('✅ Payment confirmed!');
  };

  const open = bills.filter(b => b.paymentStatus === 'open');
  const paying = bills.filter(b => b.paymentStatus === 'pending_payment');
  const paid = bills.filter(b => b.paymentStatus === 'paid');

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Open Bills', open.length, 'text-amber-400'], ['Awaiting Payment', paying.length, 'text-sky-400'], ['Paid Today', paid.length, 'text-emerald-400']].map(([label, val, color]) => (
          <div key={label} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {['pending_payment', 'open', 'paid'].map(status => {
        const section = bills.filter(b => b.paymentStatus === status);
        if (section.length === 0) return null;
        const labels = { pending_payment: '💳 Awaiting Payment', open: '🧾 Open Bills', paid: '✅ Paid' };
        return (
          <div key={status} className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 mb-3">{labels[status]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.map(bill => (
                <div key={bill.id} className={`p-4 rounded-xl border ${status === 'pending_payment' ? 'bg-sky-500/8 border-sky-500/25' : status === 'paid' ? 'bg-emerald-500/8 border-emerald-500/20 opacity-70' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">Table {bill.label}</span>
                      {status === 'pending_payment' && <span className="text-xs text-sky-400 font-semibold">Paying</span>}
                      {status === 'paid' && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <span className="text-xl font-black text-white">₹{bill.billTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>{bill.ordersCount} orders</span>
                    <span>{bill.seats} guests</span>
                    <span>{bill.waitTime}m session</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-500 mb-3 p-2 bg-slate-800 rounded-lg">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{Math.round(bill.billTotal * 0.83).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>GST (18%)</span><span>₹{Math.round(bill.billTotal * 0.12).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Service (5%)</span><span>₹{Math.round(bill.billTotal * 0.05).toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-slate-300 pt-1 border-t border-slate-700"><span>Total</span><span>₹{bill.billTotal.toLocaleString()}</span></div>
                  </div>
                  {status === 'pending_payment' && (
                    <Button variant="success" size="sm" className="w-full" onClick={() => markPaid(bill.id)}>
                      <CheckCircle size={14} />
                      Mark as Paid
                    </Button>
                  )}
                  {status === 'open' && (
                    <Button variant="outline" size="sm" className="w-full">
                      <Receipt size={14} />
                      Generate Bill
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
