import { Navigate, Outlet } from 'react-router';
import { useAuth } from './auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function FullPageSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col gap-4 w-64">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function AdminRoute() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <FullPageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
        <h1 className="text-2xl font-heading font-semibold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Hi {user.firstName}, your account does not have administrator access to this dashboard.
        </p>
        <Button variant="outline" onClick={() => void logout()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
