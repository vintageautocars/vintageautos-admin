import { useParams, Link } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { BookingActions } from '@/components/bookings/booking-actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/hooks/use-bookings';
import { formatDate, formatCurrency, slotLabel, slotHours, formatSlotCount } from '@/lib/utils';
import type { BookingSlotEntry } from '@/types/booking';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function SlotRow({ entry }: { entry: BookingSlotEntry }) {
  const Icon = entry.slot === 'DAY' ? Sun : Moon;
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="size-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {formatDate(entry.date)}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">· {slotLabel(entry.slot)}</span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{slotHours(entry.slot)}</span>
    </li>
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

                    <DetailRow label="Slots">
                      {formatSlotCount(booking.slotCount)}
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                      </span>
                    </DetailRow>
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-4">
                    <DetailRow label="Rate per Slot">
                      {formatCurrency(booking.dailyRate)} × {formatSlotCount(booking.slotCount)}
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
                    <DetailRow label="Owner Payout">
                      {booking.ownerPaidAt ? (
                        <span className="inline-flex items-center gap-1 text-teal-700">
                          <CheckCircle2 className="size-3.5" />
                          Paid on {formatDate(booking.ownerPaidAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not yet recorded</span>
                      )}
                    </DetailRow>
                    {booking.ownerPaymentNotes && (
                      <DetailRow label="Payout Notes">{booking.ownerPaymentNotes}</DetailRow>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booked Slots Card */}
            <Card>
              <CardHeader>
                <CardTitle>Booked Slots</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.slotEntries.length > 0 ? (
                  <ul className="divide-y divide-border/60">
                    {booking.slotEntries.map((entry) => (
                      <SlotRow key={entry.id} entry={entry} />
                    ))}
                  </ul>
                ) : booking.slot ? (
                  // Legacy single-slot booking (pre-slotEntries migration)
                  <ul className="divide-y divide-border/60">
                    <SlotRow entry={{ id: booking.id, date: booking.startDate, slot: booking.slot }} />
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No slot details recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Booking Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingActions
                  bookingId={booking.id}
                  status={booking.status}
                  paymentStatus={booking.payment?.status}
                  ownerPaidAt={booking.ownerPaidAt}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
