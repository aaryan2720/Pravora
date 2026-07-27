'use client';
import { useState, useEffect } from 'react';
import { LifeBuoy, Users, Clock, CheckCircle, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, Button, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'rose', bg: 'bg-rose-500/10 border-rose-500/25', text: 'text-rose-450' },
  in_progress: { label: 'In Progress', color: 'amber', bg: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-450' },
  resolved: { label: 'Resolved', color: 'jade', bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-450' },
};

const categoryLabels = {
  service: '🛎️ Slow Service',
  food: '🍳 Food Issue',
  billing: '💵 Billing Error',
  cleanliness: '🧼 Cleanliness',
  other: '❓ Other / General',
};

export default function StaffComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filter, setFilter] = useState('all'); // all | pending | in_progress | resolved
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const res = await api.complaints.list();
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.staff.list();
      if (res.success) {
        setStaffList(res.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  useEffect(() => {
    fetchComplaints(true);
    fetchStaff();

    // 3-second auto refresher for real-time alerting
    const interval = setInterval(() => {
      fetchComplaints(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateComplaint = async (id, payload) => {
    try {
      const res = await api.complaints.update(id, payload);
      if (res.success) {
        setComplaints(prev => prev.map(c => (c._id === id || c.id === id) ? res.complaint : c));
        toast.success('Ticket updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket.');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!confirm('Are you sure you want to dismiss/delete this complaint?')) return;
    try {
      const res = await api.complaints.delete(id);
      if (res.success) {
        setComplaints(prev => prev.filter(c => (c._id !== id && c.id !== id)));
        toast.success('Ticket dismissed.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete ticket.');
    }
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Opening complaints ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-fadeIn">
      {/* Alert Banner */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">New Guest Tickets Pending</p>
            <p className="text-xs text-rose-450/70">There are {pendingCount} unresolved complaints requiring urgent staff attention.</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-rose-400">{pendingCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Pending Action</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-400">{inProgressCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">In Progress</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-400">{complaints.filter(c => c.status === 'resolved').length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs" style={{ fontFamily: 'Outfit, sans-serif' }}>Customer Care Desk</h2>
          <p className="text-xs text-slate-500">Respond to diner complaints in real-time</p>
        </div>
        
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'in_progress', 'resolved'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === opt
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {opt.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filtered.map(comp => {
          const cfg = statusConfig[comp.status] || statusConfig.pending;
          const mins = Math.floor((Date.now() - new Date(comp.createdAt)) / 60000);
          
          return (
            <Card key={comp._id || comp.id} className={`p-5 border ${cfg.bg} bg-slate-900/60`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">{comp.guestName}</span>
                    {comp.tableId && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-350 text-xs font-bold">
                        Table {comp.tableId.label}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-current bg-slate-950/40 ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{String(comp._id || comp.id).slice(-4)}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span>Category: <b>{categoryLabels[comp.category] || comp.category}</b></span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {mins >= 0 ? `${mins}m ago` : 'just now'}</span>
                    {comp.guestPhone && <span>Phone: <b>{comp.guestPhone}</b></span>}
                  </div>

                  <p className="text-sm text-slate-300 bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl leading-relaxed">
                    {comp.description}
                  </p>

                  {/* Resolution Notes */}
                  {comp.status === 'resolved' && comp.notes && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                      <b>✓ Resolution Notes:</b> {comp.notes}
                    </p>
                  )}
                </div>

                {/* Staff Actions Panel */}
                <div className="w-full sm:w-auto flex flex-col gap-2 flex-shrink-0 pt-2 sm:pt-0">
                  {/* Status buttons */}
                  {comp.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateComplaint(comp._id || comp.id, { status: 'in_progress' })}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/35 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Accept Ticket <ArrowRight size={12} />
                    </button>
                  )}

                  {comp.status !== 'resolved' && (
                    <div className="space-y-2">
                      {/* Assign staff */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Assign Ticket</label>
                        <select
                          value={comp.assignedTo?._id || comp.assignedTo || ''}
                          onChange={(e) => handleUpdateComplaint(comp._id || comp.id, { assignedTo: e.target.value || null })}
                          className="w-full input-base text-xs py-1.5 bg-slate-950"
                        >
                          <option value="">Unassigned</option>
                          {staffList.map(st => (
                            <option key={st._id} value={st._id}>{st.name} ({st.role})</option>
                          ))}
                        </select>
                      </div>

                      {/* Notes and Resolve */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Resolution Note</label>
                        <input
                          placeholder="e.g. re-served food, fixed bill"
                          value={comp.notes || ''}
                          onChange={(e) => setComplaints(prev => prev.map(c => (c._id === comp._id) ? { ...c, notes: e.target.value } : c))}
                          onBlur={(e) => handleUpdateComplaint(comp._id || comp.id, { notes: e.target.value })}
                          className="w-full input-base text-xs py-1.5 bg-slate-950 mb-1.5"
                        />
                        <button
                          onClick={() => handleUpdateComplaint(comp._id || comp.id, { status: 'resolved' })}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={13} /> Resolve Ticket
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteComplaint(comp._id || comp.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Trash2 size={13} /> Dismiss
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl text-slate-600 text-sm">
            No complaints found matching this selection.
          </div>
        )}
      </div>
    </div>
  );
}
