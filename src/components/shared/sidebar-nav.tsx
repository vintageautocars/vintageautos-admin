import { NavLink } from 'react-router';
import { LayoutDashboard, Users, Car, CalendarCheck, Settings, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',          icon: LayoutDashboard, end: true },
  { to: '/owners',   label: 'Owner Applications',  icon: Users },
  { to: '/vehicles', label: 'Vehicles',            icon: Car },
  { to: '/bookings', label: 'Bookings',            icon: CalendarCheck },
  { to: '/users',    label: 'Users',               icon: UserCog },
  { to: '/settings', label: 'Settings',            icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-gradient-to-r from-[#202120] from-10% to-[#3b3c3c] to-90% text-white'
                : 'text-[var(--color-gray-text)] hover:text-white hover:bg-white/5',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('size-5 shrink-0', isActive ? 'text-primary' : '')} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
