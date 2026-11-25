import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ReasonModal } from '@/components/shared/reason-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePendingBankDetailRequests,
  useApproveBankDetailRequest,
  useRejectBankDetailRequest,
  type BankDetailChangeRequest,
} from '@/hooks/use-owners';
import { formatDate } from '@/lib/utils';

function DetailField({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || '—'}</span>
    </div>
  );
}

function RequestRow({ request }: { request: BankDetailChangeRequest }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const approve = useApproveBankDetailRequest();
  const reject = useRejectBankDetailRequest();

  function handleApprove() {
    approve.mutate(request.id, {
      onSuccess: () => setApproveOpen(false),
    });
  }

  function handleReject(reason: string) {
    reject.mutate({ id: request.id, reason }, {
      onSuccess: () => setRejectOpen(false),
    });
  }

  return (
    <>
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Owner + date */}
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-semibold text-foreground truncate">
                {request.ownerName || 'Unknown Partner'}
              </span>
              <span className="text-xs text-muted-foreground">
                Submitted {formatDate(request.createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => setApproveOpen(true)}
                disabled={approve.isPending || reject.isPending}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setRejectOpen(true)}
                disabled={approve.isPending || reject.isPending}
              >
                Reject
              </Button>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Current details */}
            <div className="rounded-md border border-border bg-muted/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current Details
              </p>
              <div className="flex flex-col gap-3">
                <DetailField label="Bank Name" value={request.currentBankName} />
                <DetailField label="Account Name" value={request.currentAccountName} />
                <DetailField label="Account Number" value={request.currentAccountNumber} />
              </div>
            </div>

            {/* Proposed details */}
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Proposed Details
              </p>
              <div className="flex flex-col gap-3">
                <DetailField label="Bank Name" value={request.bankName} />
                <DetailField label="Account Name" value={request.accountName} />
                <DetailField label="Account Number" value={request.accountNumber} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Bank Detail Change"
        description="Are you sure you want to approve this change? The partner's bank details will be updated immediately."
        confirmLabel="Approve"
        isLoading={approve.isPending}
        onConfirm={handleApprove}
      />

      <ReasonModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Bank Detail Change"
        description="Provide a reason for rejecting this bank detail change request."
        placeholder="e.g. Account details do not match KYC documents…"
        confirmLabel="Reject"
        isLoading={reject.isPending}
        onConfirm={handleReject}
      />
    </>
  );
}

export default function BankRequestsPage() {
  const { data, isLoading } = usePendingBankDetailRequests();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bank Detail Requests"
        subtitle="Review and approve partner bank account update requests."
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      )}

      {!isLoading && Array.isArray(data) && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-muted-foreground">No pending bank detail change requests.</p>
        </div>
      )}

      {!isLoading && Array.isArray(data) && data.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
