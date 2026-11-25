import { useState } from 'react';
import { Outlet, Link } from 'react-router';
import { Menu, Settings, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Logo } from './logo';
import { SidebarNav } from './sidebar-nav';
import { NotificationToggle } from './notification-toggle';
import { useAuth } from '@/app/auth-context';

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-5">
        <Logo />
      </div>
      <Separator className="bg-[#FFFFFF1A]" />
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <Separator className="bg-[#FFFFFF1A]" />
      <div className="mx-3 mt-2">
        <NotificationToggle />
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-md text-sm font-medium text-[var(--color-gray-text)] hover:text-white hover:bg-white/5 transition-colors"
      >
        <LogOut className="size-5" />
        <span>Log out</span>
      </button>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-[#FFFFFF1A] bg-background shrink-0">
      <SidebarContent />
    </aside>
  );
}

function Topbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-[#FFFFFF1A] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14">

        {/* Mobile: hamburger + wordmark */}
        <div className="flex items-center gap-3 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-md text-white hover:bg-white/5 transition"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <SheetContent side="left" className="p-0 bg-background border-r border-[#FFFFFF1A] w-64">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Logo compact />
        </div>

        <div className="hidden md:block" />

        {/* Right: user dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-white/5 transition outline-none">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {user ? initials(user.firstName, user.lastName) : 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm text-foreground font-medium">
              {user?.firstName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="size-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void logout()} className="text-destructive focus:text-destructive">
              <LogOut className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
