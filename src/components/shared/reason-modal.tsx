import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters.'),
});

type FormValues = z.infer<typeof schema>;

interface ReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
}

export function ReasonModal({
  open,
  onOpenChange,
  title,
  description,
  placeholder = 'Please provide a reason…',
  confirmLabel = 'Confirm',
  isLoading,
  onConfirm,
}: ReasonModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const reason = watch('reason', '');

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  function onSubmit(values: FormValues) {
    onConfirm(values.reason);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder={placeholder}
              rows={4}
              {...register('reason')}
              aria-invalid={!!errors.reason}
            />
            <div className="flex items-center justify-between">
              {errors.reason ? (
                <p className="text-xs text-destructive">{errors.reason.message}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">{reason?.length ?? 0} chars</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
