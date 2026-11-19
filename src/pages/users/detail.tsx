import { Link, useParams } from 'react-router';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { UserActions } from '@/components/users/user-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-users';
import { formatDate } from '@/lib/utils';
import type { AdminUser } from '@/types/user';

function initials(user: AdminUser) {
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function UserDetailContent({ user }: { user: AdminUser }) {
  return (
    <>
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        subtitle={user.email}
        action={<StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="size-16">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                    {initials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--color-gray-text)]">
                    <Mail className="size-3.5" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-[var(--color-gray-text)]">
                      <Phone className="size-3.5" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label="User ID">
                  <span className="font-mono text-xs">{user.id}</span>
                </DetailRow>
                <DetailRow label="Account status">
                  <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </DetailRow>
                <DetailRow label="Email verified">
                  <StatusBadge status={user.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'} />
                </DetailRow>
                <DetailRow label="Joined">
                  {formatDate(user.createdAt)}
                </DetailRow>
                <DetailRow label="Last updated">
                  {formatDate(user.updatedAt)}
                </DetailRow>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions card */}
        <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActions user={user} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError, refetch } = useUser(id ?? '');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Users
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-64" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-80 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">Failed to load user details.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {user && <UserDetailContent user={user} />}
    </div>
  );
}
