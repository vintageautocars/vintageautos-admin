import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Banknote, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useOwnerPayoutDetails } from '@/hooks/use-bookings';

interface FormValues {
  notes: string;
}

interface PayoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  isLoading?: boolean;
  onConfirm: (notes?: string) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function PayoutSheet({ open, onOpenChange, bookingId, isLoading, onConfirm }: PayoutSheetProps) {
  const { data: details, isLoading: detailsLoading, isError } = useOwnerPayoutDetails(bookingId, open);

  const { register, handleSubmit, reset, watch } = useForm<FormValues>({ defaultValues: { notes: '' } });
  // oxlint-disable-next-line react/incompatible-library -- react-hook-form watch() is standard
  const notes = watch('notes', '');

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  function onSubmit(values: FormValues) {
    onConfirm(values.notes.trim() || undefined);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Banknote className="size-5 text-amber-600" />
            Record Partner Payout
          </SheetTitle>
          <SheetDescription>
            Verify the partner's bank details below before confirming that payment has been made.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Partner Bank Details
          </p>

          {detailsLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {isError && !detailsLoading && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              Could not load partner bank details. Please try again.
            </div>
          )}

          {details && (
            <div className="flex flex-col divide-y rounded-lg border bg-muted/40">
              <div className="px-4 py-3"><DetailRow label="Partner Name"   value={details.ownerName} /></div>
              <div className="px-4 py-3"><DetailRow label="Bank Name"      value={details.bankName} /></div>
              <div className="px-4 py-3"><DetailRow label="Account Name"   value={details.accountName} /></div>
              <div className="px-4 py-3"><DetailRow label="Account Number" value={details.accountNumber} /></div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 border-t px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payout-notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="payout-notes"
              placeholder="e.g. Paid via bank transfer — ref: TXN1234567…"
              rows={3}
              {...register('notes')}
            />
            <span className="text-right text-xs text-muted-foreground">{notes.length} chars</span>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || detailsLoading || isError || !details}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Record Payout
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
