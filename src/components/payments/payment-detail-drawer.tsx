import { useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, CheckCircle2, XCircle, Loader2, FileText, AlertCircle, Eye } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { ReasonModal } from '@/components/shared/reason-modal';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { usePayment, useVerifyPayment, useRejectPayment } from '@/hooks/use-payments';

interface PaymentDetailDrawerProps {
  paymentId: string | null;
  onClose: () => void;
}

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function DrawerBody({ paymentId, onClose }: { paymentId: string; onClose: () => void }) {
  const { data: payment, isLoading, isError, refetch } = usePayment(paymentId);
  const verifyMutation = useVerifyPayment();
  const rejectMutation = useRejectPayment();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
        <p className="text-sm text-muted-foreground">Failed to load payment details.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const isManual = payment.mode === 'MANUAL';
  const isAwaitingVerification = payment.status === 'AWAITING_VERIFICATION';

  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs text-muted-foreground font-mono break-all">{payment.reference}</p>
          <StatusBadge status={payment.status} className="w-fit mt-0.5" />
        </div>
        <span className="text-lg font-semibold text-foreground shrink-0">
          {formatCurrency(payment.amount, payment.currency)}
        </span>
      </div>

      {/* Core fields */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <DetailRow label="Booking">
          <Link
            to={`/bookings/${payment.bookingId}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
            onClick={onClose}
          >
            {payment.bookingId.slice(0, 12)}…
            <ExternalLink className="size-3" />
          </Link>
        </DetailRow>
        <DetailRow label="Mode">{payment.mode}</DetailRow>
        {payment.provider && (
          <DetailRow label="Provider">
            <span className="capitalize">{payment.provider}</span>
          </DetailRow>
        )}
        <DetailRow label="Created">{formatDate(payment.createdAt)}</DetailRow>
        <DetailRow label="Updated">{formatDate(payment.updatedAt)}</DetailRow>
      </div>

      {/* Manual mode — awaiting verification */}
      {isManual && isAwaitingVerification && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Receipt</p>
          {payment.signedReceiptUrl ? (
            <div className="rounded-lg border overflow-hidden bg-muted">
              <img
                src={payment.signedReceiptUrl}
                alt="Payment receipt"
                className="w-full max-h-72 object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-4">
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Receipt uploaded — no preview available.
              </p>
            </div>
          )}

          {payment.receiptUploadedAt && (
            <p className="text-xs text-muted-foreground">
              Submitted {formatDate(payment.receiptUploadedAt)}
            </p>
          )}

          {payment.signedReceiptUrl && (
            <a href={payment.signedReceiptUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Eye className="size-4" />
                View receipt
              </Button>
            </a>
          )}

          <div className="flex items-center gap-2 mt-1">
            <Button
              className="flex-1"
              onClick={() => setVerifyOpen(true)}
              disabled={verifyMutation.isPending || rejectMutation.isPending}
            >
              {verifyMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              <CheckCircle2 className="size-4" />
              Verify payment
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setRejectOpen(true)}
              disabled={verifyMutation.isPending || rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              <XCircle className="size-4" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Manual mode — verified */}
      {isManual && payment.status === 'PAID' && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground">Payment verified</p>
          </div>
          {payment.verifiedAt && (
            <p className="text-xs text-muted-foreground">
              Verified {formatDate(payment.verifiedAt)}
            </p>
          )}
          {payment.signedReceiptUrl && (
            <a href={payment.signedReceiptUrl} target="_blank" rel="noopener noreferrer" className="mt-1">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Eye className="size-4" />
                View receipt
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Manual mode — rejected */}
      {isManual && payment.status === 'FAILED' && payment.rejectionReason && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-400 shrink-0" />
            <p className="text-sm font-medium text-foreground">Receipt rejected</p>
          </div>
          <p className="text-xs text-muted-foreground">{payment.rejectionReason}</p>
        </div>
      )}

      {/* Automatic mode — provider info */}
      {!isManual && (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Provider details</p>
          {payment.providerRef && (
            <DetailRow label="Provider reference">
              <span className="font-mono text-xs break-all">{payment.providerRef}</span>
            </DetailRow>
          )}
          {!payment.providerRef && (
            <p className="text-xs text-muted-foreground">No provider reference — payment may not have been initiated.</p>
          )}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        title="Verify payment"
        description="Confirm this receipt is genuine and the correct amount was transferred. The booking will be confirmed and the customer notified."
        confirmLabel="Verify"
        variant="default"
        isLoading={verifyMutation.isPending}
        onConfirm={() =>
          verifyMutation.mutate(payment.id, {
            onSuccess: () => setVerifyOpen(false),
          })
        }
      />
      <ReasonModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject receipt"
        description="Provide a reason. The customer will be notified and can re-upload a corrected receipt."
        placeholder="e.g. Amount transferred does not match the booking total…"
        confirmLabel="Reject"
        isLoading={rejectMutation.isPending}
        onConfirm={(reason) =>
          rejectMutation.mutate(
            { id: payment.id, reason },
            { onSuccess: () => setRejectOpen(false) },
          )
        }
      />
    </div>
  );
}

export function PaymentDetailDrawer({ paymentId, onClose }: PaymentDetailDrawerProps) {
  return (
    <Sheet open={!!paymentId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <SheetTitle>Payment detail</SheetTitle>
          <SheetDescription>Review and act on this payment record.</SheetDescription>
        </SheetHeader>
        {paymentId && <DrawerBody paymentId={paymentId} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}
