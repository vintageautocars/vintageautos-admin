import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ReasonModal } from '@/components/shared/reason-modal';
import { useApproveOwner, useRejectOwner } from '@/hooks/use-owners';
import type { OwnerStatus } from '@/types/common';

interface OwnerActionsProps {
  ownerId: string;
  status: OwnerStatus;
  rejectedReason?: string | null;
}

export function OwnerActions({ ownerId, status, rejectedReason }: OwnerActionsProps) {
  const navigate = useNavigate();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const approveMutation = useApproveOwner();
  const rejectMutation = useRejectOwner();

  if (status === 'APPROVED') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>Application approved</span>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="size-4 shrink-0" />
          <span>Application rejected</span>
        </div>
        {rejectedReason && (
          <p className="text-xs text-muted-foreground">{rejectedReason}</p>
        )}
      </div>
    );
  }

  // PENDING
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="default"
        onClick={() => setApproveOpen(true)}
        disabled={approveMutation.isPending}
      >
        <CheckCircle2 className="size-4" />
        Approve Application
      </Button>

      <Button
        variant="destructive"
        onClick={() => setRejectOpen(true)}
        disabled={rejectMutation.isPending}
      >
        <XCircle className="size-4" />
        Reject Application
      </Button>

      <ConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Application"
        description="Are you sure you want to approve this partner application? The partner will be notified and will be able to list vehicles."
        confirmLabel="Approve"
        variant="default"
        isLoading={approveMutation.isPending}
        onConfirm={() => {
          approveMutation.mutate(ownerId, {
            onSuccess: () => {
              setApproveOpen(false);
              navigate('/owners');
            },
          });
        }}
      />

      <ReasonModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Application"
        description="Please provide a reason for rejecting this partner application. The applicant will be notified."
        placeholder="e.g. Incomplete documentation, invalid KYC details…"
        confirmLabel="Reject Application"
        isLoading={rejectMutation.isPending}
        onConfirm={(reason) => {
          rejectMutation.mutate(
            { id: ownerId, reason },
            {
              onSuccess: () => {
                setRejectOpen(false);
                navigate('/owners');
              },
            },
          );
        }}
      />
    </div>
  );
}
