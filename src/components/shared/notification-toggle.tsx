import { Bell, BellOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';

export function NotificationToggle() {
  const { permission, isSubscribed, isLoading, requestAndSubscribe, unsubscribe } = usePushNotifications();

  if (permission === 'unsupported' || permission === 'denied') return null;

  const isActive = permission === 'granted' && isSubscribed;

  const handleClick = () => {
    if (isLoading) return;
    if (isActive) {
      void unsubscribe();
    } else {
      void requestAndSubscribe();
    }
  };

  const label = isActive ? 'Disable push notifications' : 'Enable push notifications';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            aria-label={label}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50',
              isActive
                ? 'text-primary hover:text-primary/80 hover:bg-white/5'
                : 'text-[var(--color-gray-text)] hover:text-white hover:bg-white/5',
            )}
          >
            {isActive ? <Bell className="size-5 shrink-0" /> : <BellOff className="size-5 shrink-0" />}
            <span>{isActive ? 'Notifications on' : 'Enable notifications'}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
