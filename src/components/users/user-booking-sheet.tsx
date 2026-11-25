import { ExternalLink, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, formatCurrency, slotLabel, formatSlotCount } from '@/lib/utils';
import type { Booking, BookingSlotEntry } from '@/types/booking';

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

            {/* Slots */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Booked slots · {formatSlotCount(booking.slotCount)}
              </p>
              {booking.slotEntries.length > 0 ? (
                <ul className="divide-y divide-border/60">
                  {booking.slotEntries.map((entry: BookingSlotEntry) => {
                    const Icon = entry.slot === 'DAY' ? Sun : Moon;
                    return (
                      <li key={entry.id} className="flex items-center gap-2 py-2">
                        <Icon className="size-3.5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {formatDate(entry.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">· {slotLabel(entry.slot)}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : booking.slot ? (
                <ul className="divide-y divide-border/60">
                  <li className="flex items-center gap-2 py-2">
                    {booking.slot === 'DAY' ? (
                      <Sun className="size-3.5 text-primary shrink-0" />
                    ) : (
                      <Moon className="size-3.5 text-primary shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {formatDate(booking.startDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">· {slotLabel(booking.slot)}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No slot details recorded.</p>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Pricing</p>
              <div className="divide-y divide-border/60">
                <InfoRow label="Rate per slot" value={formatCurrency(booking.dailyRate)} />
                <InfoRow label="Slots"         value={formatSlotCount(booking.slotCount)} />
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
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Partner payout</p>
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
