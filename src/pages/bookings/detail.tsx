import { useParams, Link } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { BookingActions } from '@/components/bookings/booking-actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/hooks/use-bookings';
import { formatDate, formatCurrency } from '@/lib/utils';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, isError, refetch } = useBooking(id ?? '');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All Bookings
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">Failed to load booking details.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {booking && (
        <>
          <PageHeader
            title={`Booking — ${booking.vehicleName}`}
            subtitle={`ID: ${booking.id}`}
          />

          {/* Cancel reason alert */}
          {booking.cancelReason && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Booking Cancelled</AlertTitle>
              <AlertDescription>{booking.cancelReason}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Left column */}
                  <div className="flex flex-col gap-4">
                    <DetailRow label="Vehicle">
                      <Link
                        to={`/vehicles/${booking.vehicleId}`}
                        className="text-primary underline-offset-3 hover:underline"
                      >
                        {booking.vehicleName}
                      </Link>
                    </DetailRow>

                    <DetailRow label="Customer (internal)">
                      <span>{booking.customerName}</span>
                      {booking.customerEmail && (
                        <span className="block text-xs text-muted-foreground">
                          {booking.customerEmail}
                        </span>
                      )}
                    </DetailRow>

                    <DetailRow label="Start Date">{formatDate(booking.startDate)}</DetailRow>
                    <DetailRow label="End Date">{formatDate(booking.endDate)}</DetailRow>
                    <DetailRow label="Duration">
                      {booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}
                    </DetailRow>
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-4">
                    <DetailRow label="Daily Rate">
                      {formatCurrency(booking.dailyRate)} × {booking.totalDays} day
                      {booking.totalDays !== 1 ? 's' : ''}
                    </DetailRow>
                    <DetailRow label="Total Amount">
                      <span className="text-base font-semibold">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </DetailRow>
                    <DetailRow label="Status">
                      <StatusBadge status={booking.status} />
                    </DetailRow>
                    <DetailRow label="Created">{formatDate(booking.createdAt)}</DetailRow>
                    <DetailRow label="Last Updated">{formatDate(booking.updatedAt)}</DetailRow>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingActions bookingId={booking.id} status={booking.status} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
