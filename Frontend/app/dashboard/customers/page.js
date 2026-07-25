'use client';
import { useState } from 'react';
import { Search, Star, Crown, Users } from 'lucide-react';
import { mockCustomers } from '@/lib/mockData';
import { Avatar, Badge, Card } from '@/components/ui';

const tierConfig = { Gold: 'gold', Silver: 'silver', Platinum: 'platinum' };

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const customers = mockCustomers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search);
    const matchFilter = filter === 'all' || (filter === 'members' && c.isMember) || (filter === 'non-members' && !c.isMember);
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Total Customers', mockCustomers.length, 'text-slate-300'], ['Members', mockCustomers.filter(c => c.isMember).length, 'text-amber-400'], ['Platinum', mockCustomers.filter(c => c.tier === 'Platinum').length, 'text-violet-400'], ['Avg Spend', `₹${Math.round(mockCustomers.reduce((s, c) => s + c.totalSpent, 0) / mockCustomers.length)}`, 'text-emerald-400']].filter((_, i, a) => i < 3).map(([label, val, color]) => (
          <div key={label} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-2xl font-black text-emerald-400">₹{Math.round(mockCustomers.reduce((s, c) => s + c.totalSpent, 0) / mockCustomers.length / 100) * 100}</p>
          <p className="text-xs text-slate-500">Avg Total Spend</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-base pl-9 py-2 text-sm" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'members', 'non-members'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {customers.map(c => (
          <div key={c.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar name={c.name} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h4 className="text-base font-bold text-white">{c.name}</h4>
                  {c.isMember && c.tier && <Badge variant={tierConfig[c.tier] || 'amber'}>{c.tier}</Badge>}
                  {!c.isMember && <span className="text-xs text-slate-600">Guest</span>}
                </div>
                <p className="text-xs text-slate-500">{c.email} · {c.phone}</p>
                <p className="text-xs text-slate-600 mt-0.5">Last visit: {c.lastVisit}</p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-lg font-black text-amber-400">{c.visits}</p>
                  <p className="text-xs text-slate-600">Visits</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-400">₹{(c.totalSpent/1000).toFixed(1)}k</p>
                  <p className="text-xs text-slate-600">Spent</p>
                </div>
                {c.isMember && (
                  <div>
                    <p className="text-lg font-black text-violet-400">{c.points}</p>
                    <p className="text-xs text-slate-600">Points</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && <div className="text-center py-12 text-slate-600">No customers found</div>}
      </div>
    </div>
  );
}
