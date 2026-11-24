import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  CreditCard,
  Settings,
  UserCog,
  Settings2,
  ScrollText,
  Landmark,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePendingCounts } from '@/hooks/use-pending-counts';
import type { PendingCounts } from '@/hooks/use-pending-counts';

type BadgeKey = keyof PendingCounts;

interface NavItem {
  to:       string;
  label:    string;
  icon:     React.ElementType;
  end?:     boolean;
  badgeKey?: BadgeKey;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',               label: 'Dashboard',          icon: LayoutDashboard, end: true },
  { to: '/users',          label: 'Users',              icon: UserCog },
  { to: '/bookings',       label: 'Bookings',           icon: CalendarCheck,  badgeKey: 'bookings' },
  { to: '/vehicles',       label: 'Vehicles',           icon: Car,            badgeKey: 'vehicles' },
  { to: '/payments',       label: 'Payments',           icon: CreditCard,     badgeKey: 'payments' },
  { to: '/owners/bank-requests', label: 'Bank Detail Requests', icon: Landmark, badgeKey: 'bankRequests' },
  { to: '/settings',       label: 'Settings',           icon: Settings,       end: true },
  { to: '/settings/payment',     label: 'Payment Settings',  icon: Settings2 },
  { to: '/settings/categories',  label: 'Categories',        icon: Tag },
  { to: '/audit-log',            label: 'Audit Log',         icon: ScrollText },
];

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const counts = usePendingCounts();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, badgeKey }) => {
        const count = badgeKey ? counts[badgeKey] : 0;
        return (
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
                <NavBadge count={count} />
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
