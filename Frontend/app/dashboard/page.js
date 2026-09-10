'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Zap, ShoppingBag, Grid3x3, Package, TrendingUp, AlertTriangle, ChefHat, Clock, ArrowRight, Star } from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { api } from '@/lib/api';

function MetricCard({ label, value, sub, icon: Icon, color = 'amber', trend, href }) {
  const colorMap = {
    amber: { bg: 'rgba(233,106,10,0.06)', border: 'rgba(233,106,10,0.15)', text: '#E96A0A' },
    jade: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', text: '#10b981' },
    sky: { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    rose: { bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.15)', text: '#ef4444' },
    violet: { bg: 'rgba(245,138,31,0.06)', border: 'rgba(245,138,31,0.15)', text: '#F58A1F' },
  };
  const c = colorMap[color];
  const content = (
    <div className="metric-card card-hover p-5" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}>
          <Icon size={18} style={{ color: c.text }} />
        </div>
        {trend !== undefined && <span className={`text-xs font-medium px-2 py-0.5 rounded-full tabular-nums ${trend > 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-500'}`}>{trend > 0 ? '+' : ''}{trend}%</span>}
      </div>
      <p className="text-2xl font-black text-slate-100 mb-0.5 tabular-nums" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</p>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function OrderCard({ order }) {
  const statusMap = {
    pending: { label: 'Pending', color: 'text-brand-orange', bg: 'bg-brand-light-orange/15 border-brand-orange/20' },
    preparing: { label: 'Preparing', color: 'text-sky-500', bg: 'bg-sky-500/5 border-sky-500/15' },
    ready: { label: 'Ready', color: 'text-emerald-600', bg: 'bg-emerald-500/5 border-emerald-500/15' },
    served: { label: 'Served', color: 'text-slate-400', bg: 'bg-slate-200/5 border-slate-700' },
    cancelled: { label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/5 border-rose-500/15' },
  };
  const s = statusMap[order.status] || statusMap.pending;
  const mins = Math.floor((Date.now() - new Date(order.placedAt)) / 60000);
  return (
    <div className={`p-3.5 rounded-xl border ${s.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-100">{order.tableLabel}</span>
          <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 tabular-nums">
          <Clock size={11} />
          {mins >= 0 ? `${mins}m` : '0m'}
        </div>
      </div>
      <div className="text-xs text-slate-500 space-y-0.5">
        {order.items.slice(0, 2).map((item, i) => (
          <p key={i}><span className="tabular-nums font-medium">{item.qty}×</span> {item.name}</p>
        ))}
        {order.items.length > 2 && <p>+{order.items.length - 2} more items</p>}
      </div>
      <p className="text-sm font-semibold text-slate-200 mt-2">₹{order.subtotal?.toLocaleString() || 0}</p>
    </div>
  );
}

export default function PulseDashboard() {
  const [pulse, setPulse] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [weekChart, setWeekChart] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPulseData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch operational pulse, active orders and table states
      const [pulseRes, ordersRes, tablesRes] = await Promise.all([
        api.analytics.getPulse(),
        api.orders.list('limit=10'),
        api.tables.list(),
      ]);

      if (pulseRes.success) setPulse(pulseRes.pulse);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (tablesRes.success) setTables(tablesRes.tables || []);
    } catch (err) {
      console.error('Failed to load pulse metrics:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadAnalyticsCharts = async () => {
    try {
      const [weekRes, todayRes] = await Promise.all([
        api.analytics.getWeek(),
        api.analytics.getToday()
      ]);
      if (todayRes.success) setTodayStats(todayRes.today);
      if (weekRes.success && weekRes.week) {
        const formatted = weekRes.week.labels.map((label, i) => ({
          label,
          revenue: weekRes.week.revenue[i] || 0
        }));
        setWeekChart(formatted);
      }
    } catch (err) {
      console.error('Failed to load analytics summaries:', err);
    }
  };

  useEffect(() => {
    loadPulseData(true);
    loadAnalyticsCharts();

    let pulseInterval = null;
    let chartInterval = null;

    const startPolling = () => {
      if (!pulseInterval) {
        pulseInterval = setInterval(() => {
          if (typeof document !== 'undefined' && !document.hidden) {
            loadPulseData(false);
          }
        }, 3000);
      }
      if (!chartInterval) {
        chartInterval = setInterval(() => {
          if (typeof document !== 'undefined' && !document.hidden) {
            loadAnalyticsCharts();
          }
        }, 60000); // Refresh slow-changing analytics charts once a minute
      }
    };

    const stopPolling = () => {
      if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
      }
      if (chartInterval) {
        clearInterval(chartInterval);
        chartInterval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadPulseData(false);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading real-time pulse metrics...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeTables = tables.filter(t => t.status === 'occupied' || t.status === 'paying');
  const freeTables = tables.filter(t => t.status === 'free');
  
  const rushVal = pulse?.rushLevel ?? 0;
  const rushColor = rushVal > 70 ? 'rose' : rushVal > 40 ? 'amber' : 'jade';
  const revenueTotal = pulse?.todayRevenue ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Rush Level" value={`${rushVal}%`} icon={Zap} color={rushColor} sub={rushVal > 70 ? 'Critical high traffic' : 'Stable operations'} />
        <MetricCard label="Active Orders" value={activeOrders.length} icon={ShoppingBag} color="sky" sub={`${pendingOrders.length} pending action`} href="/dashboard/orders" />
        <MetricCard label="Active Tables" value={`${activeTables.length}/${tables.length}`} icon={Grid3x3} color="amber" sub={`${freeTables.length} tables free`} href="/dashboard/tables" />
        <MetricCard label="Today's Revenue" value={`₹${(revenueTotal / 1000).toFixed(1)}k`} icon={TrendingUp} color="jade" sub="Target: ₹60k" />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Low Stock Items" value={pulse?.lowStockItems || 0} icon={Package} color="rose" sub="Check Inventory" href="/dashboard/inventory" />
        <MetricCard label="Avg Wait Time" value={`${pulse?.avgWaitTime || 0}m`} icon={Clock} color="violet" sub="Estimated wait" />
        <MetricCard label="Tables Turned" value={pulse?.tablesTurnedToday || 0} icon={ChefHat} color="jade" sub="Today so far" />
        <MetricCard label="Revenue Progress" value={`${Math.round(Math.min(100, (revenueTotal / 60000) * 100))}%`} icon={TrendingUp} color="amber" sub="of daily target" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-200 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Weekly Revenue</h3>
              <p className="text-sm text-slate-500">Past 7 days</p>
            </div>
          </div>
          <div className="h-48">
            {weekChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekChart} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E96A0A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E96A0A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #ECECEC', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={v => [`₹${(v/1000).toFixed(1)}k`, 'Revenue']}
                    labelStyle={{ color: '#1F1F1F' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E96A0A" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600 text-sm">No revenue data recorded yet.</div>
            )}
          </div>
        </Card>

        {/* Top items */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Items Today</h3>
            <Star size={16} className="text-brand-orange" />
          </div>
          <div className="space-y-3">
            {todayStats?.topItems && todayStats.topItems.length > 0 ? (
              todayStats.topItems.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 font-medium truncate flex-1 mr-2">{item.name}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0">{item.count} orders</span>
                  </div>
                  <ProgressBar value={item.count} max={todayStats.topItems[0].count || 1} color="amber" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-600 text-sm">No orders processed today yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Live orders + table status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Live orders */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-200 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Orders</h3>
              <span className="status-dot live" />
            </div>
            <Link href="/dashboard/orders" className="text-xs text-brand-orange hover:text-brand-yellow flex items-center gap-1">
              All orders <ArrowRight size={12} />
            </Link>
          </div>
          {activeOrders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeOrders.slice(0, 4).map(o => <OrderCard key={o._id} order={o} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600 text-sm">No live orders. Tables are clear!</div>
          )}
        </Card>

        {/* Table status overview */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Table Status</h3>
            <Link href="/dashboard/tables" className="text-xs text-brand-orange hover:text-brand-yellow flex items-center gap-1">
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

          {tables.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {tables.map(t => {
                const colorMap = { free: 'border-emerald-500/40 bg-emerald-500/8', occupied: 'border-amber-500/40 bg-amber-500/8', reserved: 'border-violet-500/40 bg-violet-500/8', paying: 'border-sky-500/40 bg-sky-500/8', dirty: 'border-rose-500/40 bg-rose-500/8' };
                const textMap = { free: 'text-emerald-400', occupied: 'text-amber-400', reserved: 'text-violet-400', paying: 'text-sky-400', dirty: 'text-rose-400' };
                return (
                  <Link key={t._id} href="/dashboard/tables">
                    <div className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:opacity-80 transition-all ${colorMap[t.status]}`}>
                      <span className={`text-xs font-bold ${textMap[t.status]}`}>{t.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-600 text-sm">
              No tables configured yet. Configure tables in your Settings.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
