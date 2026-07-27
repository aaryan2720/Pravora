'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Grid3x3, UtensilsCrossed, Tag, CalendarDays, Users2, Package, CreditCard, BarChart3, UserCog, Settings, ChevronLeft, ChevronRight, LogOut, QrCode, LifeBuoy } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Avatar } from '@/components/ui';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Pulse', section: 'main' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Chef Board', section: 'main', badge: 3 },
  { href: '/dashboard/tables', icon: Grid3x3, label: 'Tables', section: 'main' },
  { href: '/dashboard/qr', icon: QrCode, label: 'QR Codes', section: 'operations' },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu', section: 'operations' },
  { href: '/dashboard/pricing', icon: Tag, label: 'Pricing & Specials', section: 'operations' },
  { href: '/dashboard/reservations', icon: CalendarDays, label: 'Reservations', section: 'operations' },
  { href: '/dashboard/queue', icon: Users2, label: 'Queue', section: 'operations' },
  { href: '/dashboard/complaints', icon: LifeBuoy, label: 'Complaints Desk', section: 'operations' },
  { href: '/dashboard/inventory', icon: Package, label: 'Inventory', section: 'operations' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing & Payments', section: 'finance' },
  { href: '/dashboard/customers', icon: UserCog, label: 'Customers', section: 'finance' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', section: 'finance' },
  { href: '/dashboard/staff', icon: Users2, label: 'Staff', section: 'admin' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', section: 'admin' },
];

const sections = [
  { key: 'main', label: null },
  { key: 'operations', label: 'Operations' },
  { key: 'finance', label: 'Finance' },
  { key: 'admin', label: 'Admin' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, user, activeRestaurant, signOut } = useApp();

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const currentSections = user?.role === 'admin'
    ? [{ key: 'saas', label: 'Platform Oversight' }]
    : sections;

  const currentNavItems = user?.role === 'admin'
    ? [
        { href: '/dashboard/saas', icon: LayoutDashboard, label: 'SaaS Console', section: 'saas' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings', section: 'saas' },
      ]
    : navItems;

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-30 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 flex flex-col h-full border-r border-slate-800 bg-slate-900 transition-all duration-300 
          ${sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full md:translate-x-0'} 
          ${!sidebarOpen ? 'md:w-[64px]' : 'md:w-[240px]'}
        `}
      >
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-slate-800 flex-shrink-0">
        <img src="/favicon.svg" alt="ServeLoop" className="w-8 h-8 object-contain flex-shrink-0" />
        {sidebarOpen && (
          <span className="font-bold text-base text-slate-900 truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-brand-orange">Serve</span><span className="text-brand-yellow">Loop</span>
          </span>
        )}
      </div>

      {/* Restaurant badge */}
      {sidebarOpen && activeRestaurant && user?.role !== 'admin' && (
        <div className="mx-3 my-3 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
          <p className="text-xs text-slate-500 mb-0.5">Restaurant</p>
          <p className="text-sm font-semibold text-slate-100 truncate">{activeRestaurant.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="status-dot live" style={{ width: 6, height: 6 }} />
            <span className="text-xs text-emerald-400">Live</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {currentSections.map(section => {
          const items = currentNavItems.filter(n => n.section === section.key);
          return (
            <div key={section.key} className="mb-1">
              {section.label && sidebarOpen && (
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-4 pb-1">
                  {section.label}
                </p>
              )}
              {section.label && !sidebarOpen && <div className="border-t border-slate-800 my-2" />}
              {items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`sidebar-item relative ${isActive(item.href) ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-0' : ''}`}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {sidebarOpen && <span className="flex-1">{item.label}</span>}
                  {sidebarOpen && item.badge && (
                    <span className="bg-amber-500 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-slate-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar name={user?.name} size={32} />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all z-10"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
    </>
  );
}
