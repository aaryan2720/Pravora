'use client';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { usePathname } from 'next/navigation';

const pageTitles = {
  '/dashboard': 'Pulse Dashboard',
  '/dashboard/orders': 'Chef Board (Kitchen)',
  '/dashboard/tables': 'Tables Board',
  '/dashboard/menu': 'Menu Management',
  '/dashboard/pricing': 'Pricing & Specials',
  '/dashboard/reservations': 'Reservations',
  '/dashboard/queue': 'Queue Board',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/billing': 'Billing & Payments',
  '/dashboard/customers': 'Customers & Membership',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/staff': 'Staff Management',
  '/dashboard/settings': 'Settings',
};

function DashboardShell({ children }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';
  return (
    <div className="flex h-screen overflow-hidden dashboard-mesh">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
