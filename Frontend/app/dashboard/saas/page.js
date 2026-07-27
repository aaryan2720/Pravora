'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, Grid3x3, ChefHat, Store, Clock, CalendarDays, ShieldCheck, Activity, HeartHandshake, Eye, MapPin, Tag, CheckCircle2, MessageSquare, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';
import { Card, Button, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

function MetricCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    jade: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  return (
    <Card className="p-4 flex items-center justify-between border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all">
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-xl font-black text-white mt-1">{value}</h3>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color] || colors.amber}`}>
        <Icon size={18} />
      </div>
    </Card>
  );
}

export default function SaaSAdminPage() {
  const router = useRouter();
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', latency: '0ms', uptime: '0s' });
  const [activeTab, setActiveTab] = useState('cafes'); // cafes | orders | complaints

  // Redirect if user is not a global admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Unauthorized access. Admins only.');
      router.push('/dashboard');
    }
  }, [user]);

  const fetchSaaSMetrics = async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const res = await api.analytics.getSaaS();
      if (res.success) {
        setData(res.saas);
      }
    } catch (err) {
      console.error('Failed to load SaaS metrics:', err);
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  const pingHealth = async () => {
    const start = Date.now();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/health`);
      const body = await res.json();
      const latency = `${Date.now() - start}ms`;
      if (res.ok && body.status === 'LIVE') {
        setHealthStatus({ status: 'LIVE', latency, uptime: body.uptime });
      } else {
        setHealthStatus({ status: 'ERR', latency, uptime: '0s' });
      }
    } catch (e) {
      setHealthStatus({ status: 'ERR', latency: 'timeout', uptime: '0s' });
    }
  };

  useEffect(() => {
    fetchSaaSMetrics(true);
    pingHealth();

    // 3-second auto-refresher
    const interval = setInterval(() => {
      fetchSaaSMetrics(false);
      pingHealth();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading global SaaS analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const totalComplaints = data.complaints?.length || 0;
  const pendingComplaints = data.complaints?.filter(c => c.status === 'pending').length || 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fadeIn">
      {/* Top Console Panel */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch gap-4">
        {/* Welcome */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs" style={{ fontFamily: 'Outfit, sans-serif' }}>Super-Admin Command Console</h2>
            <p className="text-xs text-slate-450 mt-0.5">Real-time overview of the ServeLoop multi-tenant platform.</p>
          </div>
        </div>

        {/* Live System Health Monitor */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4 min-w-[320px]">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Live Platform Health</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`status-dot ${healthStatus.status === 'LIVE' ? 'live' : 'bg-rose-500'}`} />
              <span className="text-sm font-bold text-white">{healthStatus.status === 'LIVE' ? 'API Functional' : 'System Degraded'}</span>
            </div>
          </div>
          <div className="border-l border-slate-800 h-8 hidden sm:block" />
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Ping Latency</span>
            <span className="text-xs text-slate-300 font-mono font-bold mt-0.5 block">{healthStatus.latency}</span>
          </div>
          <div className="border-l border-slate-800 h-8 hidden sm:block" />
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Server Uptime</span>
            <span className="text-xs text-slate-355 font-mono font-bold mt-0.5 block">{healthStatus.uptime}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Partner Cafes" value={data.totalRestaurants} icon={Store} color="amber" sub="Registered tenants" />
        <MetricCard label="Cumulative Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="jade" sub="Global transacted total" />
        <MetricCard label="Active Table Sessions" value={data.activeSessionsCount} icon={ChefHat} color="sky" sub="Currently dining" />
        <MetricCard label="Total Tables Managed" value={data.totalTables} icon={Grid3x3} color="rose" sub="Active table QR codes" />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1">
        {[
          { key: 'cafes', label: `🏢 Partner Cafes (${data.partnerCafes?.length || 0})` },
          { key: 'orders', label: `🍳 Live Order Feed (${data.recentOrders?.length || 0})` },
          { key: 'complaints', label: `🛎️ Help Tickets (${totalComplaints})`, alert: pendingComplaints > 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold transition-all relative cursor-pointer border-b-2 -mb-1.5 ${
              activeTab === tab.key
                ? 'border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.alert && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Main Tab Renderers */}
      {activeTab === 'cafes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.partnerCafes.map(cafe => (
            <Card key={cafe._id} className="overflow-hidden border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between">
              {/* Cover Banner */}
              <div className="h-28 w-full bg-slate-800 relative">
                {cafe.coverImage ? (
                  <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-slate-800 flex items-center justify-center text-slate-600 font-bold text-xs uppercase tracking-widest">
                    No Cover Image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={cafe.isOnboarded ? 'jade' : 'rose'} className="text-[9px] uppercase font-bold">
                    {cafe.isOnboarded ? 'Live' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Cafe Profile Meta */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-2.5">
                    {cafe.logo ? (
                      <img src={cafe.logo} alt="Logo" className="w-9 h-9 rounded-lg border border-slate-800 object-contain flex-shrink-0 bg-slate-950" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                        {cafe.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{cafe.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{cafe.tagline || 'ServeLoop onboarded tenant'}</p>
                    </div>
                  </div>

                  {/* Cuisines */}
                  <div className="flex gap-1 flex-wrap mt-2.5">
                    {cafe.cuisine.slice(0, 3).map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-850 text-slate-400 text-[9px] font-medium">
                        {c}
                      </span>
                    ))}
                    {cafe.cuisine.length === 0 && (
                      <span className="text-[9px] text-slate-600">No cuisines registered</span>
                    )}
                  </div>
                </div>

                {/* Location and metrics */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-450">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin size={11} className="text-slate-500 flex-shrink-0" />
                    <span className="truncate">{cafe.city}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-white">{cafe.activeTables}</span> active tables
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {data.partnerCafes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl text-slate-600 text-xs">
              No partner cafes onboarded yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Platform Live Order Timeline</h3>
              <p className="text-xs text-slate-500">Chronological feed of guest checkouts across all restaurants</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 font-semibold uppercase">
                  <th className="py-2.5">Restaurant</th>
                  <th className="py-2.5">Table</th>
                  <th className="py-2.5">Items Ordered</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Value</th>
                  <th className="py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {data.recentOrders.map(ord => (
                  <tr key={ord._id || ord.id} className="text-slate-350 hover:bg-slate-800/10 transition-all">
                    <td className="py-3 font-semibold text-white">{ord.restaurantId?.name || 'Cafe'}</td>
                    <td className="py-3">Table {ord.tableLabel || ord.tableId?.label || 'T'}</td>
                    <td className="py-3">
                      <span className="font-mono text-[11px] block truncate max-w-[280px]">
                        {ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={
                        ord.status === 'served' ? 'jade' :
                        ord.status === 'preparing' ? 'sky' :
                        ord.status === 'cancelled' ? 'rose' : 'amber'
                      } className="text-[9px] uppercase font-bold">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-200">₹{(ord.subtotal || ord.total || 0).toLocaleString()}</td>
                    <td className="py-3 text-right text-slate-500">{new Date(ord.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.recentOrders?.length === 0 && (
            <div className="text-center py-20 text-slate-600 text-xs">No customer orders recorded yet.</div>
          )}
        </Card>
      )}

      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {data.complaints.map(comp => (
            <Card key={comp._id || comp.id} className="p-4 border border-slate-800 bg-slate-900/60">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Target:</span>
                    <span className="text-xs font-black text-amber-400">{comp.restaurantId?.name || 'Cafe'}</span>
                    {comp.tableId && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                        Table {comp.tableId.label}
                      </span>
                    )}
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      comp.status === 'resolved' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-450' :
                      comp.status === 'in_progress' ? 'border-amber-500/25 bg-amber-500/10 text-amber-450' :
                      'border-rose-500/25 bg-rose-500/10 text-rose-450'
                    }`}>
                      {comp.status}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">#{String(comp._id || comp.id).slice(-4)}</span>
                  </div>

                  <div className="text-xs text-slate-450 flex items-center gap-2 flex-wrap">
                    <span>Filed by: <b>{comp.guestName}</b></span>
                    <span>•</span>
                    <span>Category: <b>{comp.category.toUpperCase()}</b></span>
                    <span>•</span>
                    <span>Reported: <b>{new Date(comp.createdAt).toLocaleString()}</b></span>
                  </div>

                  <p className="text-xs text-slate-350 bg-slate-950/45 p-3 rounded-lg border border-slate-800">
                    {comp.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          {data.complaints.length === 0 && (
            <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl text-slate-600 text-xs">
              No guest complaints logged across the platform.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
