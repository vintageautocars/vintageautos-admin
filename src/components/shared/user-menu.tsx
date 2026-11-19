import { useNavigate } from 'react-router';
import { LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/auth-context';
import type { User } from '@/types/auth';

function roleBadgeLabel(user: User) {
  if (user.roles.includes('SUPER_ADMIN')) return 'Super Admin';
  if (user.roles.includes('ADMIN')) return 'Admin';
  return user.roles[0] ?? '';
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors text-left">
          <Avatar className="h-8 w-8 shrink-0">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{fullName}</span>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary w-fit px-1.5 py-0">
              {roleBadgeLabel(user)}
            </Badge>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => void navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void logout()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
