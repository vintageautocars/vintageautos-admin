import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types/booking';

interface Row {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: Row) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

interface UserBookingSheetProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserBookingSheet({ booking, open, onOpenChange }: UserBookingSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>Booking details</SheetTitle>
          {booking && (
            <SheetDescription>
              ID: <span className="font-mono">{booking.id}</span>
            </SheetDescription>
          )}
        </SheetHeader>

        {booking && (
          <div className="px-4 pb-6 flex flex-col gap-5">
            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} />
            </div>

            <Separator />

            {/* Vehicle */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Vehicle</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{booking.vehicleName}</span>
                <Link
                  to={`/vehicles/${booking.vehicleId}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                >
                  View <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Rental period</p>
              <div className="divide-y divide-border/60">
                <InfoRow label="Start date"  value={formatDate(booking.startDate)} />
                <InfoRow label="End date"    value={formatDate(booking.endDate)} />
                <InfoRow label="Duration"    value={`${booking.totalDays} day${booking.totalDays !== 1 ? 's' : ''}`} />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Pricing</p>
              <div className="divide-y divide-border/60">
                <InfoRow label="Daily rate"    value={formatCurrency(booking.dailyRate)} />
                <InfoRow label="Total amount"  value={
                  <span className="text-primary font-semibold">{formatCurrency(booking.totalAmount)}</span>
                } />
              </div>
            </div>

            {/* Payment */}
            {booking.payment && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Payment</p>
                  <div className="divide-y divide-border/60">
                    <InfoRow label="Status"    value={<StatusBadge status={booking.payment.status} />} />
                    <InfoRow label="Mode"      value={booking.payment.mode} />
                    <InfoRow label="Reference" value={
                      <span className="font-mono text-xs">{booking.payment.reference}</span>
                    } />
                  </div>
                </div>
              </>
            )}

            {/* Owner payout */}
            {booking.ownerPaidAt && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Owner payout</p>
                  <div className="divide-y divide-border/60">
                    <InfoRow label="Paid at" value={formatDate(booking.ownerPaidAt)} />
                    {booking.ownerPaymentNotes && (
                      <InfoRow label="Notes" value={booking.ownerPaymentNotes} />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Cancel reason */}
            {booking.cancelReason && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Cancellation</p>
                  <p className="text-sm text-foreground">{booking.cancelReason}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Timeline</p>
              <div className="divide-y divide-border/60">
                <InfoRow label="Created"      value={formatDate(booking.createdAt)} />
                <InfoRow label="Last updated" value={formatDate(booking.updatedAt)} />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
