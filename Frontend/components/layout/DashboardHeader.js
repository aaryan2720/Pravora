'use client';
import { Bell, Search, Zap, Menu } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useApp } from '@/lib/context/AppContext';
import { mockPulse } from '@/lib/mockData';

export default function DashboardHeader({ title = 'Dashboard', subtitle }) {
  const { user, sidebarOpen, setSidebarOpen } = useApp();
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center px-4 sm:px-6 gap-3 sm:gap-4 flex-shrink-0">
      {/* Mobile Hamburger toggle */}
      <button 
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close sidebar navigation' : 'Open sidebar navigation'}
        aria-expanded={sidebarOpen}
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-brand-orange"
        title="Toggle Menu"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-200 truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h1>
        {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {/* Rush indicator */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
        <Zap size={13} className={mockPulse.rushLevel > 70 ? 'text-rose-400' : mockPulse.rushLevel > 40 ? 'text-amber-400' : 'text-emerald-400'} />
        <span className="text-xs font-semibold text-slate-300">Rush</span>
        <span className={`text-xs font-bold ${mockPulse.rushLevel > 70 ? 'text-rose-400' : mockPulse.rushLevel > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {mockPulse.rushLevel}%
        </span>
      </div>

      {/* Alerts */}
      <div className="flex items-center gap-1">
        {mockPulse.criticalItems > 0 && (
          <Badge variant="rose" className="text-xs hidden sm:inline-flex">
            {mockPulse.criticalItems} alerts
          </Badge>
        )}
      </div>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all focus-visible:outline-brand-orange cursor-pointer"
      >
        <Bell size={18} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full shadow-xs" />
      </button>

      {/* User */}
      <div className="flex items-center gap-2.5">
        <Avatar name={user?.name} size={34} />
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-500 leading-tight capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
