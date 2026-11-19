import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ReasonModal } from '@/components/shared/reason-modal';
import {
  useApproveVehicle,
  useRejectVehicle,
  useToggleFeatured,
  useToggleAvailability,
} from '@/hooks/use-vehicles';
import { vehicleKeys } from '@/lib/query-keys';
import type { Vehicle } from '@/types/vehicle';

interface VehicleActionsProps {
  vehicle: Vehicle;
}

export function VehicleActions({ vehicle }: VehicleActionsProps) {
  const qc = useQueryClient();
  const { id, status, isFeatured, isAvailable } = vehicle;

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reinstateOpen, setReinstateOpen] = useState(false);

  const approveMutation = useApproveVehicle();
  const rejectMutation = useRejectVehicle();
  const featureMutation = useToggleFeatured();
  const availMutation = useToggleAvailability();

  function invalidate() {
    qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
  }

  if (status === 'REJECTED') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Vehicle Rejected</AlertTitle>
        <AlertDescription>
          {vehicle.rejectedReason ?? 'No reason provided.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === 'PENDING_REVIEW' && (
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <AlertCircle className="size-4 text-yellow-400" />
          <AlertTitle className="text-yellow-400">Pending Price Negotiation</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Use the <strong>Negotiation</strong> tab to discuss pricing with the owner, then agree terms to approve or reject.
          </AlertDescription>
        </Alert>
      )}

      {status === 'APPROVED' && (
        <>
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={isFeatured}
              disabled={featureMutation.isPending}
              onCheckedChange={(val) =>
                featureMutation.mutate({ id, isFeatured: val }, { onSuccess: invalidate })
              }
              aria-label="Toggle featured"
            />
            <span className="text-sm text-muted-foreground">Featured</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={isAvailable}
              disabled={availMutation.isPending}
              onCheckedChange={(val) =>
                availMutation.mutate({ id, isAvailable: val }, { onSuccess: invalidate })
              }
              aria-label="Toggle availability"
            />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>

          <Button variant="destructive" onClick={() => setSuspendOpen(true)} disabled={rejectMutation.isPending}>
            <XCircle className="size-4" />
            Suspend
          </Button>
          <ReasonModal
            open={suspendOpen}
            onOpenChange={setSuspendOpen}
            title="Suspend Vehicle"
            description="This vehicle will be hidden from public listings. Provide a reason."
            placeholder="e.g. Policy violation…"
            confirmLabel="Suspend"
            isLoading={rejectMutation.isPending}
            onConfirm={(reason) =>
              rejectMutation.mutate(
                { id, reason },
                { onSuccess: () => { setSuspendOpen(false); invalidate(); } },
              )
            }
          />
        </>
      )}

      {status === 'UNAVAILABLE' && (
        <>
          <Button variant="default" onClick={() => setReinstateOpen(true)} disabled={approveMutation.isPending}>
            <RefreshCw className="size-4" />
            Reinstate
          </Button>
          <ConfirmModal
            open={reinstateOpen}
            onOpenChange={setReinstateOpen}
            title="Reinstate Vehicle"
            description="This will re-approve the vehicle and make it visible on the public listing."
            confirmLabel="Reinstate"
            variant="default"
            isLoading={approveMutation.isPending}
            onConfirm={() =>
              approveMutation.mutate(id, {
                onSuccess: () => { setReinstateOpen(false); invalidate(); },
              })
            }
          />
        </>
      )}
    </div>
  );
}
