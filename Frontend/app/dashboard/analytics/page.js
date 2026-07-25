'use client';
import { mockAnalytics } from '@/lib/mockData';
import { TrendingUp, ShoppingBag, Users, Grid3x3 } from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const weekData = mockAnalytics.week.labels.map((label, i) => ({ label, revenue: mockAnalytics.week.revenue[i] }));
const peakData = mockAnalytics.today.peakHours;

const tooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 };

export default function AnalyticsPage() {
  const { today, month } = mockAnalytics;
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `₹${(today.revenue/1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-amber-400' },
          { label: "Today's Orders", value: today.orders, icon: ShoppingBag, color: 'text-sky-400' },
          { label: 'Avg Order Value', value: `₹${today.avgOrderValue}`, icon: ShoppingBag, color: 'text-emerald-400' },
          { label: 'Tables Turned', value: today.tablesTurned, icon: Grid3x3, color: 'text-violet-400' },
        ].map(m => (
          <Card key={m.label} className="p-4">
            <m.icon size={18} className={`${m.color} mb-2`} />
            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Monthly Revenue', `₹${(month.revenue/100000).toFixed(2)}L`, 'text-amber-400'],
          ['Total Orders', month.ordersTotal.toLocaleString(), 'text-sky-400'],
          ['New Customers', month.newCustomers, 'text-emerald-400'],
          ['Returning', month.repeatCustomers, 'text-violet-400'],
        ].map(([label, val, color]) => (
          <div key={label} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly revenue */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Weekly Revenue Trend</h3>
            <Badge variant="jade">+8% vs last week</Badge>
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
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${(v/1000).toFixed(1)}k`, 'Revenue']} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#wkGrad)" dot={{ fill: '#f59e0b', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peak hours */}
        <Card className="p-5">
          <h3 className="font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Today's Peak Hours</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakData} barSize={18}>
                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={h => `${h}h`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Orders']} labelStyle={{ color: '#94a3b8' }} labelFormatter={h => `${h}:00`} />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {peakData.map((entry, i) => (
                    <Cell key={i} fill={entry.orders > 20 ? '#f59e0b' : entry.orders > 10 ? '#fbbf24aa' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top items */}
      <Card className="p-5">
        <h3 className="font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Items Today</h3>
        <div className="space-y-3">
          {today.topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-600 w-5">#{i+1}</span>
              <span className="text-sm text-slate-300 font-medium flex-1 truncate">{item.name}</span>
              <span className="text-xs text-slate-500 flex-shrink-0">{item.count} orders</span>
              <ProgressBar value={item.count} max={today.topItems[0].count} color="amber" className="w-32 flex-shrink-0" />
              <span className="text-xs text-emerald-400 flex-shrink-0 w-20 text-right font-semibold">₹{item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
