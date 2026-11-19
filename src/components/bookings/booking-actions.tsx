import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Zap, Flag, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ReasonModal } from '@/components/shared/reason-modal';
import {
  useConfirmBooking,
  useActivateBooking,
  useCompleteBooking,
  useCancelBooking,
} from '@/hooks/use-bookings';
import { bookingKeys } from '@/lib/query-keys';
import type { BookingStatus } from '@/types/common';

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const confirmMutation = useConfirmBooking();
  const activateMutation = useActivateBooking();
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();

  function afterMutation() {
    queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
  }

  if (status === 'COMPLETED' || status === 'CANCELLED') {
    return (
      <p className="text-sm text-muted-foreground">
        This booking is <span className="font-medium text-foreground">{status.toLowerCase()}</span>{' '}
        and requires no further action.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'PENDING' && (
        <>
          <Button
            variant="default"
            onClick={() => setConfirmOpen(true)}
            disabled={confirmMutation.isPending}
          >
            <CheckCircle2 className="size-4" />
            Confirm Booking
          </Button>
          <ConfirmModal
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirm Booking"
            description="Are you sure you want to confirm this booking? The customer will be notified."
            confirmLabel="Confirm Booking"
            variant="default"
            isLoading={confirmMutation.isPending}
            onConfirm={() => {
              confirmMutation.mutate(bookingId, {
                onSuccess: () => {
                  setConfirmOpen(false);
                  afterMutation();
                },
              });
            }}
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

      {/* Cancel is available for PENDING, CONFIRMED, and ACTIVE */}
      <Button
        variant="destructive"
        onClick={() => setCancelOpen(true)}
        disabled={cancelMutation.isPending}
      >
        <Ban className="size-4" />
        Cancel
      </Button>
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
    </div>
  );
}
