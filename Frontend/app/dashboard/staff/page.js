'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { mockStaff } from '@/lib/mockData';
import { Avatar, Badge, Button } from '@/components/ui';

const roleConfig = { manager: 'violet', waiter: 'amber', kitchen: 'rose', front_desk: 'sky' };
const statusConfig = { active: { label: 'Active', color: 'text-emerald-400', dot: 'bg-emerald-500' }, on_break: { label: 'On Break', color: 'text-amber-400', dot: 'bg-amber-500' }, off: { label: 'Off', color: 'text-slate-600', dot: 'bg-slate-700' } };

export default function StaffPage() {
  const [staff, setStaff] = useState(mockStaff);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? staff : staff.filter(s => s.role === filter);

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['manager', 'waiter', 'kitchen', 'front_desk'].map(role => (
          <div key={role} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center cursor-pointer hover:border-slate-700 transition-all"
            onClick={() => setFilter(filter === role ? 'all' : role)}>
            <p className="text-2xl font-black text-slate-300">{staff.filter(s => s.role === role).length}</p>
            <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'manager', 'waiter', 'kitchen', 'front_desk'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm"><Plus size={14} /> Add Staff</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(member => {
          const statusC = statusConfig[member.status] || statusConfig.off;
          return (
            <div key={member.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={member.name} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-white">{member.name}</p>
                    <span className={`w-2 h-2 rounded-full ${statusC.dot}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleConfig[member.role] || 'default'} className="text-[10px]">{member.role.replace('_', ' ')}</Badge>
                    <span className={`text-xs ${statusC.color}`}>{statusC.label}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p>{member.email}</p>
                <p>{member.phone}</p>
                <p className="capitalize">Shift: {member.shift}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
