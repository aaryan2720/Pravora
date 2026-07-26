'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldAlert, User, Mail, Phone, Lock, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const roleConfig = {
  owner: 'violet',
  manager: 'violet',
  waiter: 'amber',
  kitchen: 'rose',
  front_desk: 'sky'
};

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'waiter', password: '' });

  const fetchStaff = async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const res = await api.staff.list();
      if (res.success) {
        setStaff(res.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(true);
  }, []);

  const handleCreateStaff = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required.');
      return;
    }

    try {
      const res = await api.staff.create(form);
      if (res.success) {
        toast.success(`Registered staff user: ${res.staff.name}`);
        setForm({ name: '', email: '', phone: '', role: 'waiter', password: '' });
        setShowAddForm(false);
        fetchStaff(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add staff member.');
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action is irreversible.`)) return;
    try {
      const res = await api.staff.delete(id);
      if (res.success) {
        toast.success(`Removed ${name} from staff registry.`);
        fetchStaff(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove staff member.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading staff credentials registry...</p>
      </div>
    );
  }

  const roles = ['owner', 'manager', 'waiter', 'kitchen', 'front_desk'];
  const filtered = filter === 'all' ? staff : staff.filter(s => s.role === filter);

  return (
    <div className="max-w-[900px] mx-auto animate-fadeIn pb-16">
      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center cursor-pointer hover:border-slate-700 transition-all"
             onClick={() => setFilter('all')}>
          <p className="text-2xl font-black text-white">{staff.length}</p>
          <p className="text-xs text-slate-500 capitalize">All Staff</p>
        </div>
        {roles.slice(1).map(role => (
          <div key={role} className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${filter === role ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
            onClick={() => setFilter(filter === role ? 'all' : role)}>
            <p className="text-2xl font-black text-slate-350">{staff.filter(s => s.role === role).length}</p>
            <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', ...roles].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5 cursor-pointer">
          <Plus size={14} /> Add Staff Account
        </Button>
      </div>

      {/* Add Staff Dialog */}
      {showAddForm && (
        <form onSubmit={handleCreateStaff} className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm animate-fadeIn relative">
          <button type="button" onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer">
            <X size={16} />
          </button>
          <p className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider text-[11px]">Register New Staff Member</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required className="input-base pl-9 text-sm" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required className="input-base pl-9 text-sm" placeholder="rahul@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input-base pl-9 text-sm" placeholder="+91 ..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required className="input-base pl-9 text-sm" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role Permission *</label>
              <select className="input-base text-sm select-dark" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="manager">Manager</option>
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen Staff</option>
                <option value="front_desk">Front Desk</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Account</Button>
          </div>
        </form>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(member => (
          <div key={member._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{member.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={roleConfig[member.role] || 'default'} className="text-[10px]">
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDeleteStaff(member._id, member.name)} className="p-1.5 rounded-lg text-slate-650 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Remove staff account">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-800/60 pt-3 mt-2">
                <p className="flex items-center gap-1.5 truncate"><Mail size={12} /> {member.email}</p>
                {member.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {member.phone}</p>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-550 text-sm">
            No registered staff members found for role: {filter.replace('_', ' ')}.
          </div>
        )}
      </div>
    </div>
  );
}
