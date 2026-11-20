import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Zap, Flag, Ban, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ReasonModal } from '@/components/shared/reason-modal';
import { PayoutSheet } from '@/components/shared/payout-sheet';
import {
  useConfirmBooking,
  useActivateBooking,
  useCompleteBooking,
  useCancelBooking,
  useRecordOwnerPayout,
} from '@/hooks/use-bookings';
import { bookingKeys } from '@/lib/query-keys';
import type { BookingStatus, PaymentStatus } from '@/types/common';

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus | null;
  ownerPaidAt?: string | null;
}

export function BookingActions({ bookingId, status, paymentStatus, ownerPaidAt }: BookingActionsProps) {
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUnpaidOpen, setConfirmUnpaidOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);

  const confirmMutation = useConfirmBooking();
  const activateMutation = useActivateBooking();
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();
  const payoutMutation = useRecordOwnerPayout();

  function afterMutation() {
    queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
  }

  function handleConfirmClick() {
    if (paymentStatus !== 'PAID') {
      setConfirmUnpaidOpen(true);
    } else {
      setConfirmOpen(true);
    }
  }

  function runConfirm() {
    confirmMutation.mutate(bookingId, {
      onSuccess: () => {
        setConfirmOpen(false);
        setConfirmUnpaidOpen(false);
        afterMutation();
      },
    });
  }

  if (status === 'CANCELLED') {
    return (
      <p className="text-sm text-muted-foreground">
        This booking is <span className="font-medium text-foreground">cancelled</span> and requires
        no further action.
      </p>
    );
  }

  if (status === 'COMPLETED' && ownerPaidAt) {
    return (
      <p className="text-sm text-muted-foreground">
        This booking is <span className="font-medium text-foreground">completed</span> and the owner
        payout has been recorded.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'PENDING' && (
        <>
          <Button
            variant="default"
            onClick={handleConfirmClick}
            disabled={confirmMutation.isPending}
          >
            <CheckCircle2 className="size-4" />
            Confirm Booking
          </Button>

          {/* Standard confirm (payment already made) */}
          <ConfirmModal
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirm Booking"
            description="Are you sure you want to confirm this booking? The customer will be notified."
            confirmLabel="Confirm Booking"
            variant="default"
            isLoading={confirmMutation.isPending}
            onConfirm={runConfirm}
          />

          {/* Warning confirm (no payment yet) */}
          <ConfirmModal
            open={confirmUnpaidOpen}
            onOpenChange={setConfirmUnpaidOpen}
            title="Payment not received"
            description={
              paymentStatus === 'AWAITING_VERIFICATION'
                ? 'A receipt has been submitted but not yet verified. Confirming now will bypass payment verification. Are you sure you want to proceed?'
                : 'No payment has been received for this booking. Confirming will mark it as confirmed without payment. Only proceed if you have an offline arrangement with the customer.'
            }
            confirmLabel="Confirm anyway"
            variant="destructive"
            isLoading={confirmMutation.isPending}
            onConfirm={runConfirm}
          />
        </>
      )}

      {status === 'CONFIRMED' && (
        <>
          <Button
            variant="default"
            onClick={() => setActivateOpen(true)}
            disabled={activateMutation.isPending}
          >
            <Zap className="size-4" />
            Mark as Active
          </Button>
          <ConfirmModal
            open={activateOpen}
            onOpenChange={setActivateOpen}
            title="Mark Booking as Active"
            description="This will mark the booking as active, indicating the rental has started."
            confirmLabel="Mark Active"
            variant="default"
            isLoading={activateMutation.isPending}
            onConfirm={() => {
              activateMutation.mutate(bookingId, {
                onSuccess: () => {
                  setActivateOpen(false);
                  afterMutation();
                },
              });
            }}
          />
        </>
      )}

      {status === 'ACTIVE' && (
        <>
          <Button
            variant="default"
            onClick={() => setCompleteOpen(true)}
            disabled={completeMutation.isPending}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            <Flag className="size-4" />
            Mark as Completed
          </Button>
          <ConfirmModal
            open={completeOpen}
            onOpenChange={setCompleteOpen}
            title="Complete Booking"
            description="This will mark the booking as completed. This action cannot be undone."
            confirmLabel="Complete Booking"
            variant="default"
            isLoading={completeMutation.isPending}
            onConfirm={() => {
              completeMutation.mutate(bookingId, {
                onSuccess: () => {
                  setCompleteOpen(false);
                  afterMutation();
                },
              });
            }}
          />
        </>
      )}

      {/* Cancel is available for PENDING, CONFIRMED, and ACTIVE only */}
      {status !== 'COMPLETED' && (
        <Button
          variant="destructive"
          onClick={() => setCancelOpen(true)}
          disabled={cancelMutation.isPending}
        >
          <Ban className="size-4" />
          Cancel
        </Button>
      )}
      <ReasonModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Booking"
        description="Please provide a reason for cancelling this booking. The customer will be notified."
        placeholder="e.g. Vehicle unavailable due to maintenance…"
        confirmLabel="Cancel Booking"
        isLoading={cancelMutation.isPending}
        onConfirm={(reason) => {
          cancelMutation.mutate(
            { id: bookingId, reason },
            {
              onSuccess: () => {
                setCancelOpen(false);
                afterMutation();
              },
            },
          );
        }}
      />

      {/* Owner payout — available once booking is past PENDING and not yet paid */}
      {(status === 'CONFIRMED' || status === 'ACTIVE' || status === 'COMPLETED') && !ownerPaidAt && (
        <>
          <Button
            variant="outline"
            onClick={() => setPayoutOpen(true)}
            disabled={payoutMutation.isPending}
            className="border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
          >
            <Banknote className="size-4" />
            Record Owner Payout
          </Button>
          <PayoutSheet
            open={payoutOpen}
            onOpenChange={setPayoutOpen}
            bookingId={bookingId}
            isLoading={payoutMutation.isPending}
            onConfirm={(notes) => {
              payoutMutation.mutate(
                { id: bookingId, notes },
                {
                  onSuccess: () => {
                    setPayoutOpen(false);
                    afterMutation();
                  },
                },
              );
            }}
          />
        </>
      )}
    </div>
  );
}
