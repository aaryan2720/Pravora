'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Receipt, CheckCircle, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [sessions, setSessions] = useState([]);
  const [billsMap, setBillsMap] = useState({});
  const [recentlyPaid, setRecentlyPaid] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveSessions = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.sessions.listActive();
      if (res.success) {
        setSessions(res.sessions || []);
        
        // Pre-fetch bill details for any session in 'billing' state
        const billingSessions = (res.sessions || []).filter(s => s.status === 'billing');
        for (const s of billingSessions) {
          if (!billsMap[s._id]) {
            fetchBillDetails(s._id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching active sessions:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchBillDetails = async (sessionId) => {
    try {
      const res = await api.billing.get(sessionId);
      if (res.success && res.bill) {
        setBillsMap(prev => ({ ...prev, [sessionId]: res.bill }));
      }
    } catch (err) {
      console.error(`Error fetching bill details for session ${sessionId}:`, err);
    }
  };

  useEffect(() => {
    fetchActiveSessions(true);
    const interval = setInterval(() => {
      fetchActiveSessions(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateBill = async (sessionId) => {
    try {
      toast.loading('Generating tax bill receipt...', { id: 'billing' });
      const res = await api.billing.generate(sessionId);
      if (res.success) {
        toast.success('🧾 Bill receipt generated successfully!', { id: 'billing' });
        await fetchBillDetails(sessionId);
        fetchActiveSessions(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate bill.', { id: 'billing' });
    }
  };

  const handleConfirmPayment = async (billId, sessionId, method = 'cash') => {
    try {
      toast.loading('Confirming payment transaction...', { id: 'billing' });
      const res = await api.billing.pay(billId, method);
      if (res.success) {
        toast.success(`✅ Payment confirmed via ${method}! Session closed.`, { id: 'billing' });
        const billObj = billsMap[sessionId];
        if (billObj) {
          setRecentlyPaid(prev => [
            {
              id: billId,
              tableLabel: billObj.tableLabel,
              total: billObj.total,
              paidAt: new Date(),
              paymentMethod: method,
            },
            ...prev
          ]);
        }
        // Remove from map to clean up state
        setBillsMap(prev => {
          const clone = { ...prev };
          delete clone[sessionId];
          return clone;
        });
        fetchActiveSessions(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to confirm payment.', { id: 'billing' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading active tables bill tracker...</p>
      </div>
    );
  }

  const openBills = sessions.filter(s => s.status === 'active');
  const awaitingPayment = sessions.filter(s => s.status === 'billing');

  return (
    <div className="max-w-[1000px] mx-auto animate-fadeIn">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-400">{openBills.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Open Tables</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-sky-400">{awaitingPayment.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Awaiting Payment</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-400">{recentlyPaid.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Settled (Shift)</p>
        </div>
      </div>

      {/* 1. Awaiting Payment Section */}
      {awaitingPayment.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CreditCard size={15} /> 💳 Awaiting Payment ({awaitingPayment.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {awaitingPayment.map(session => {
              const bill = billsMap[session._id];
              const waitMins = Math.max(0, Math.floor((Date.now() - new Date(session.startedAt)) / 60000));
              if (!bill) {
                return (
                  <div key={session._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-sky-500 mr-2" size={16} />
                    <span className="text-xs text-slate-500">Loading bill receipt details...</span>
                  </div>
                );
              }
              return (
                <div key={session._id} className="p-4 rounded-xl border bg-sky-500/5 border-sky-500/20 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-base font-black text-white">Table {session.tableLabel}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> Active {waitMins}m · {session.guestCount} guests
                      </p>
                    </div>
                    <span className="text-xl font-black text-white">₹{(bill.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-400 mb-4 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal}</span></div>
                    <div className="flex justify-between"><span>GST ({bill.taxRate}%)</span><span>+₹{bill.taxAmount}</span></div>
                    <div className="flex justify-between"><span>Service ({bill.serviceChargeRate}%)</span><span>+₹{bill.serviceChargeAmount}</span></div>
                    <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800"><span>Grand Total</span><span>₹{bill.total}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="xs" onClick={() => handleConfirmPayment(bill._id, session._id, 'cash')} className="text-slate-300 font-semibold border-slate-700 bg-slate-800">
                      Paid Cash
                    </Button>
                    <Button variant="success" size="xs" onClick={() => handleConfirmPayment(bill._id, session._id, 'card')} className="font-semibold text-slate-950">
                      Paid Online/Card
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Open Bills Section */}
      <div className="mb-8 animate-fadeIn">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Receipt size={15} /> 🧾 Open Tables ({openBills.length})
        </h3>
        {openBills.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No open table sessions currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {openBills.map(session => {
              const waitMins = Math.max(0, Math.floor((Date.now() - new Date(session.startedAt)) / 60000));
              const subtotalEstimate = session.subtotal || 0;
              return (
                <div key={session._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm transition-all hover:border-slate-750">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-base font-bold text-slate-200">Table {session.tableLabel}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {session.orderCount || 0} order batches · {session.guestCount} guests
                      </p>
                    </div>
                    <span className="text-base font-bold text-slate-400">₹{subtotalEstimate.toLocaleString()} sub</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Clock size={11} /> Seated {waitMins}m ago</span>
                    <span className="flex items-center gap-1"><Users size={11} /> Size {session.guestCount}</span>
                  </div>
                  <Button variant="primary" size="sm" className="w-full gap-1.5" onClick={() => handleGenerateBill(session._id)}>
                    <Receipt size={14} />
                    Generate Receipt
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Settled Shifts History Section */}
      {recentlyPaid.length > 0 && (
        <div className="animate-fadeIn">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle size={15} /> Paid & Closed Shifts
          </h3>
          <div className="space-y-2">
            {recentlyPaid.map((p, i) => (
              <div key={p.id || i} className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                    {p.tableLabel}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Table {p.tableLabel} closed</p>
                    <p className="text-[10px] text-slate-500">Paid via {p.paymentMethod.toUpperCase()} · {new Date(p.paidAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-400">₹{p.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
