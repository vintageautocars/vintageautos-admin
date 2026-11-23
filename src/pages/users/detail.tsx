import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Car, CalendarDays, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { UserActions } from '@/components/users/user-actions';
import { UserBookingSheet } from '@/components/users/user-booking-sheet';
import { DataTable } from '@/components/shared/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-users';
import { useVehicles } from '@/hooks/use-vehicles';
import { useBookings } from '@/hooks/use-bookings';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Column } from '@/components/shared/data-table';
import type { AdminUser } from '@/types/user';
import type { Vehicle } from '@/types/vehicle';
import type { Booking } from '@/types/booking';

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

const vehicleColumns: Column<Vehicle>[] = [
  {
    key: 'photo',
    header: '',
    className: 'w-16',
    render: (row) => {
      const photo = row.photos[0];
      return photo ? (
        <img src={photo.url} alt={row.name} className="size-12 rounded object-cover" loading="lazy" />
      ) : (
        <div className="flex size-12 items-center justify-center rounded bg-muted">
          <Car className="size-5 text-muted-foreground" />
        </div>
      );
    },
  },
  {
    key: 'name',
    header: 'Vehicle',
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.make} {row.model} · {row.year}</span>
      </div>
    ),
  },
  {
    key: 'state',
    header: 'State',
    render: (row) => <span className="text-sm">{row.state}</span>,
  },
  {
    key: 'dailyRate',
    header: 'Daily rate',
    render: (row) => <span className="text-sm">{formatCurrency(row.dailyRate)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
];

function UserVehiclesSection({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useVehicles({ ownerId: userId, pageSize: 4 });
  const vehicles = Array.isArray(data) ? data : (data as { data?: Vehicle[] } | undefined)?.data ?? [];
  const total    = Array.isArray(data) ? data.length : (data as { total?: number } | undefined)?.total ?? 0;

  return (
    <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Car className="size-4 text-muted-foreground" />
          Vehicles
          {total > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({total})</span>
          )}
        </CardTitle>
        {total > 0 && (
          <Link
            to={`/vehicles?ownerId=${userId}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <DataTable<Vehicle>
          columns={vehicleColumns}
          data={vehicles}
          total={total}
          page={1}
          pageSize={4}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
          keyExtractor={(row) => row.id}
        />
      </CardContent>
    </Card>
  );
}

function BookingRow({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left"
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight truncate">{booking.vehicleName}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusBadge status={booking.status} />
        <span className="text-xs font-medium text-foreground">{formatCurrency(booking.totalAmount)}</span>
      </div>
    </button>
  );
}

function UserBookingsSection({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<Booking | null>(null);
  const { data, isLoading } = useBookings({ customerId: userId, pageSize: 4 });
  const bookings = Array.isArray(data) ? data : (data as { data?: Booking[] } | undefined)?.data ?? [];
  const total    = Array.isArray(data) ? data.length : (data as { total?: number } | undefined)?.total ?? 0;

  return (
    <>
      <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            Bookings
            {total > 0 && (
              <span className="text-xs font-normal text-muted-foreground">({total})</span>
            )}
          </CardTitle>
          {total > 0 && (
            <Link
              to={`/bookings?customerId=${userId}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              See all <ArrowRight className="size-3" />
            </Link>
          )}
        </CardHeader>
        <CardContent className="px-2">
          {isLoading && (
            <div className="flex flex-col gap-1 px-1">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          )}

          {!isLoading && bookings.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center px-2">No bookings found.</p>
          )}

          {!isLoading && bookings.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {bookings.slice(0, 4).map((b) => (
                <BookingRow key={b.id} booking={b} onClick={() => setSelected(b)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UserBookingSheet
        booking={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      />
    </>
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
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Profile */}
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

          {/* Vehicles */}
          <UserVehiclesSection userId={user.id} />

          {/* Bookings */}
          <UserBookingsSection userId={user.id} />
        </div>

        {/* Actions */}
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
