'use client';
import { useState, useEffect } from 'react';
import { Search, Star, Crown, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar, Badge, Card } from '@/components/ui';

const tierConfig = {
  bronze: 'slate',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum'
};

export default function CustomersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchCustomers = async () => {
    try {
      const res = await api.memberships.list();
      if (res.success) {
        setItems(res.customers || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading customers list...</p>
      </div>
    );
  }

  const filtered = items.filter(c => {
    const name = c.guestId?.name || 'Anonymous';
    const email = c.guestId?.email || '';
    const phone = c.guestId?.phone || '';
    const matchSearch = !search || 
      name.toLowerCase().includes(search.toLowerCase()) || 
      email.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search);
      
    const matchFilter = filter === 'all' || 
      (filter === 'platinum' && c.tier === 'platinum') || 
      (filter === 'gold' && c.tier === 'gold') ||
      (filter === 'silver' && c.tier === 'silver') ||
      (filter === 'bronze' && c.tier === 'bronze');
      
    return matchSearch && matchFilter;
  });

  const avgSpent = items.length > 0 ? Math.round(items.reduce((s, c) => s + c.totalSpent, 0) / items.length) : 0;

  return (
    <div className="max-w-[1000px] mx-auto animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-slate-350">{items.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Customers</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-400">{items.filter(c => c.tier === 'gold' || c.tier === 'platinum').length}</p>
          <p className="text-xs text-slate-500 mt-0.5">VIP Members</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-violet-400">{items.filter(c => c.tier === 'platinum').length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Platinum Tier</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-400">₹{avgSpent.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Avg Customer Spend</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-base pl-9 py-2 text-sm" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'bronze', 'silver', 'gold', 'platinum'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      <div className="space-y-3">
        {filtered.map(c => {
          const lastVisit = c.lastVisitAt || c.guestId?.lastVisitAt;
          return (
            <div key={c._id || c.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4 flex-wrap">
                <Avatar name={c.guestId?.name} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="text-sm font-bold text-white">{c.guestId?.name || 'Anonymous Guest'}</h4>
                    <Badge variant={tierConfig[c.tier || 'bronze']}>{c.tier || 'bronze'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{c.guestId?.email || 'No email'} · {c.guestId?.phone || 'No phone'}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Last visit: {lastVisit ? new Date(lastVisit).toLocaleString() : 'First visit today'}
                  </p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-base font-black text-amber-400">{c.visits || 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Visits</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-emerald-400">₹{(c.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Spent</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-violet-400">{c.points || 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Points</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No customers found matching this search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
