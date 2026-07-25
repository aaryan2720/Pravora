'use client';
import Link from 'next/link';
import { Zap, ShoppingBag, Grid3x3, Package, TrendingUp, AlertTriangle, ChefHat, Clock, ArrowRight, Star } from 'lucide-react';
import { mockPulse, mockOrders, mockTables, mockAnalytics, mockMenuItems } from '@/lib/mockData';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const weekData = mockAnalytics.week.labels.map((label, i) => ({ label, revenue: mockAnalytics.week.revenue[i] }));

function MetricCard({ label, value, sub, icon: Icon, color = 'amber', trend, href }) {
  const colorMap = {
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', text: '#fbbf24', icon: 'text-amber-400' },
    jade: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', text: '#34d399', icon: 'text-emerald-400' },
    sky: { bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.15)', text: '#38bdf8', icon: 'text-sky-400' },
    rose: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.15)', text: '#fb7185', icon: 'text-rose-400' },
    violet: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)', text: '#a78bfa', icon: 'text-violet-400' },
  };
  const c = colorMap[color];
  const content = (
    <div className="metric-card card-hover p-5" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}>
          <Icon size={18} style={{ color: c.text }} />
        </div>
        {trend && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>{trend > 0 ? '+' : ''}{trend}%</span>}
      </div>
      <p className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</p>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function OrderCard({ order }) {
  const statusMap = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    preparing: { label: 'Preparing', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    served: { label: 'Served', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  };
  const s = statusMap[order.status];
  const mins = Math.floor((Date.now() - order.createdAt) / 60000);
  return (
    <div className={`p-3.5 rounded-xl border ${s.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white">{order.tableLabel}</span>
          <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={11} />
          {mins}m
        </div>
      </div>
      <div className="text-xs text-slate-500 space-y-0.5">
        {order.items.slice(0, 2).map((item, i) => (
          <p key={i}>{item.qty}× {item.name}</p>
        ))}
        {order.items.length > 2 && <p>+{order.items.length - 2} more items</p>}
      </div>
      <p className="text-sm font-semibold text-slate-200 mt-2">₹{order.total.toLocaleString()}</p>
    </div>
  );
}

export default function PulseDashboard() {
  const activeOrders = mockOrders.filter(o => o.status !== 'served');
  const pendingOrders = mockOrders.filter(o => o.status === 'pending');
  const activeTables = mockTables.filter(t => t.status === 'occupied' || t.status === 'paying');
  const freeTables = mockTables.filter(t => t.status === 'free');
  const rushColor = mockPulse.rushLevel > 70 ? 'rose' : mockPulse.rushLevel > 40 ? 'amber' : 'jade';

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Alerts bar */}
      {(mockPulse.criticalItems > 0 || mockPulse.delayedOrders > 0) && (
        <div className="flex flex-wrap gap-3">
          {mockPulse.criticalItems > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-400">
              <AlertTriangle size={14} />
              <span>{mockPulse.criticalItems} items critically low — Ginger-Garlic Paste, Mango Pulp</span>
            </div>
          )}
          {mockPulse.delayedOrders > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-sm text-amber-400">
              <Clock size={14} />
              <span>{mockPulse.delayedOrders} order delayed — T15 · 60+ min</span>
            </div>
          )}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Rush Level" value={`${mockPulse.rushLevel}%`} icon={Zap} color={rushColor} sub="High traffic right now" trend={12} />
        <MetricCard label="Active Orders" value={activeOrders.length} icon={ShoppingBag} color="sky" sub={`${pendingOrders.length} pending action`} href="/dashboard/orders" />
        <MetricCard label="Active Tables" value={`${activeTables.length}/${mockTables.length}`} icon={Grid3x3} color="amber" sub={`${freeTables.length} tables free`} href="/dashboard/tables" />
        <MetricCard label="Today's Revenue" value={`₹${(mockPulse.todayRevenue / 1000).toFixed(1)}k`} icon={TrendingUp} color="jade" sub="Target: ₹60k" trend={8} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Low Stock Items" value={mockPulse.lowStockItems + mockPulse.criticalItems} icon={Package} color="rose" sub={`${mockPulse.criticalItems} critical`} href="/dashboard/inventory" />
        <MetricCard label="Avg Wait Time" value={`${mockPulse.avgWaitTime}m`} icon={Clock} color="violet" sub="Target: <15 min" />
        <MetricCard label="Tables Turned" value={mockPulse.tablesTurnedToday} icon={ChefHat} color="jade" sub="Today so far" />
        <MetricCard label="Revenue Progress" value={`${Math.round((mockPulse.todayRevenue / mockPulse.targetRevenue) * 100)}%`} icon={TrendingUp} color="amber" sub="of daily target" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Weekly Revenue</h3>
              <p className="text-sm text-slate-500">Past 7 days</p>
            </div>
            <Badge variant="jade">+8% vs last week</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  formatter={v => [`₹${(v/1000).toFixed(1)}k`, 'Revenue']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top items */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Items Today</h3>
            <Star size={16} className="text-amber-400" />
          </div>
          <div className="space-y-3">
            {mockAnalytics.today.topItems.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 font-medium truncate flex-1 mr-2">{item.name}</span>
                  <span className="text-xs text-slate-500 flex-shrink-0">{item.count} orders</span>
                </div>
                <ProgressBar value={item.count} max={mockAnalytics.today.topItems[0].count} color="amber" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live orders + table status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Live orders */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Orders</h3>
              <span className="status-dot live" />
            </div>
            <Link href="/dashboard/orders" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              All orders <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeOrders.slice(0, 4).map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </Card>

        {/* Table status overview */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Table Status</h3>
            <Link href="/dashboard/tables" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {[['bg-emerald-500', 'Free'], ['bg-amber-500', 'Occupied'], ['bg-violet-500', 'Reserved'], ['bg-sky-500', 'Paying'], ['bg-rose-500', 'Dirty']].map(([bg, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-slate-500">
                <span className={`w-2.5 h-2.5 rounded-full ${bg}`} />{label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {mockTables.map(t => {
              const colorMap = { free: 'border-emerald-500/40 bg-emerald-500/8', occupied: 'border-amber-500/40 bg-amber-500/8', reserved: 'border-violet-500/40 bg-violet-500/8', paying: 'border-sky-500/40 bg-sky-500/8', dirty: 'border-rose-500/40 bg-rose-500/8' };
              const textMap = { free: 'text-emerald-400', occupied: 'text-amber-400', reserved: 'text-violet-400', paying: 'text-sky-400', dirty: 'text-rose-400' };
              return (
                <Link key={t.id} href="/dashboard/tables">
                  <div className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:opacity-80 transition-all ${colorMap[t.status]}`}>
                    <span className={`text-xs font-bold ${textMap[t.status]}`}>{t.label}</span>
                    {t.status === 'occupied' && t.billTotal > 0 && (
                      <span className="text-[9px] text-slate-500">₹{(t.billTotal/1000).toFixed(1)}k</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
