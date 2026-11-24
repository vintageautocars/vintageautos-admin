import { Loader2, User, Building2, CreditCard, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOwner, useApproveOwner } from '@/hooks/use-owners';
import { useQueryClient } from '@tanstack/react-query';
import { vehicleKeys } from '@/lib/query-keys';

interface OwnerOnboardingApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerProfileId: string;
  vehicleId: string;
  onApproved: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

export function OwnerOnboardingApprovalModal({
  open,
  onOpenChange,
  ownerProfileId,
  vehicleId,
  onApproved,
}: OwnerOnboardingApprovalModalProps) {
  const qc = useQueryClient();
  const { data: profile, isLoading, isError } = useOwner(ownerProfileId);
  const approveMutation = useApproveOwner();

  function handleApprove() {
    approveMutation.mutate(ownerProfileId, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
        onOpenChange(false);
        onApproved();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Owner onboarding required</DialogTitle>
          <DialogDescription>
            This vehicle&apos;s owner has not yet been approved. Review their details and approve their
            onboarding before taking action on the listing.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">Could not load owner details.</p>
          )}

          {profile && (
            <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
              <InfoRow
                icon={User}
                label="Owner name"
                value={profile.user ? `${profile.user.firstName} ${profile.user.lastName}` : '—'}
              />
              <InfoRow icon={Phone} label="Phone number" value={profile.phone} />
              <InfoRow icon={Building2} label="Bank" value={profile.bankName} />
              <InfoRow icon={CreditCard} label="Account name" value={profile.accountName} />
              <InfoRow icon={CreditCard} label="Account number" value={profile.accountNumber} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!profile || isLoading || approveMutation.isPending}
          >
            {approveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Approve Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
