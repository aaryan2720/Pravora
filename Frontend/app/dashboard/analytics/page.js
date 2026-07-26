'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Grid3x3, AlertCircle } from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '@/lib/api';

const tooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 };

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [todayRes, weekRes, monthRes] = await Promise.all([
        api.analytics.getToday(),
        api.analytics.getWeek(),
        api.analytics.getMonth()
      ]);

      if (todayRes.success && weekRes.success && monthRes.success) {
        setData({
          today: todayRes.today,
          week: weekRes.week,
          month: monthRes.month
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Generating analytics reports...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-2">
        <AlertCircle size={24} className="text-amber-500" />
        <p>No analytics data available yet. Please complete some orders first!</p>
      </div>
    );
  }

  const { today, week, month } = data;

  const weekData = (week.labels || []).map((label, i) => ({
    label,
    revenue: week.revenue[i] || 0
  }));

  const peakData = today.peakHours || [];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fadeIn">
      {/* Header metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `₹${(today.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-amber-400' },
          { label: "Today's Orders", value: today.orders || 0, icon: ShoppingBag, color: 'text-sky-400' },
          { label: 'Avg Order Value', value: `₹${(today.avgOrderValue || 0).toLocaleString()}`, icon: ShoppingBag, color: 'text-emerald-400' },
          { label: 'Tables Turned', value: today.tablesTurned || 0, icon: Grid3x3, color: 'text-violet-400' },
        ].map(m => (
          <Card key={m.label} className="p-4 shadow-sm border border-slate-800 bg-slate-900/60">
            <m.icon size={18} className={`${m.color} mb-2`} />
            <p className="text-2xl font-black text-white">{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Monthly Revenue', `₹${(month.revenue || 0).toLocaleString()}`, 'text-amber-400'],
          ['Total Orders', (month.ordersTotal || 0).toLocaleString(), 'text-sky-400'],
          ['New Customers', month.newCustomers || 0, 'text-emerald-400'],
          ['Repeat Rate', `${month.newCustomers > 0 ? Math.round(((month.ordersTotal - month.newCustomers) / month.ordersTotal) * 100) : 0}%`, 'text-violet-400'],
        ].map(([label, val, color]) => (
          <div key={label} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly revenue */}
        <Card className="p-5 border border-slate-800 bg-slate-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Weekly Revenue Trend</h3>
            <Badge variant="jade">Sales Active</Badge>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="wkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#wkGrad)" dot={{ fill: '#f59e0b', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peak hours */}
        <Card className="p-5 border border-slate-800 bg-slate-900/60 shadow-sm">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Today's Peak Hours</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakData} barSize={18}>
                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={h => `${h}h`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Orders']} labelStyle={{ color: '#94a3b8' }} labelFormatter={h => `${h}:00`} />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {peakData.map((entry, i) => (
                    <Cell key={i} fill={entry.orders > 15 ? '#f59e0b' : entry.orders > 5 ? '#fbbf24aa' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top items */}
      <Card className="p-5 border border-slate-800 bg-slate-900/60 shadow-sm">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Items Today</h3>
        <div className="space-y-3">
          {(today.topItems || []).map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-650 w-5">#{i+1}</span>
              <span className="text-sm text-slate-305 font-semibold flex-1 truncate">{item.name}</span>
              <span className="text-xs text-slate-500 flex-shrink-0">{item.count} orders</span>
              <ProgressBar value={item.count} max={today.topItems[0]?.count || 1} color="amber" className="w-32 flex-shrink-0" />
              <span className="text-xs text-emerald-400 flex-shrink-0 w-20 text-right font-bold">₹{item.revenue.toLocaleString()}</span>
            </div>
          ))}
          {(!today.topItems || today.topItems.length === 0) && (
            <div className="text-center py-6 text-slate-500 text-sm">
              No orders placed today to calculate top items.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
