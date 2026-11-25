import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, X, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordInput } from '@/components/auth/password-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/app/auth-context';
import {
  usePaymentSettings,
  useUpdatePaymentSettings,
  classifyUpdateError,
} from '@/hooks/use-payment-settings';

// ─── Schema ───────────────────────────────────────────────────────────────────

const editSchema = z.object({
  bankName: z.string().min(2, 'Min 2 characters').max(100, 'Max 100 characters'),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, 'Must be exactly 10 digits'),
  accountName: z.string().min(2, 'Min 2 characters').max(100, 'Max 100 characters'),
});

const confirmSchema = z.object({
  reason: z.string().max(300, 'Max 300 characters').optional(),
  password: z.string().min(1, 'Password is required'),
});

type EditValues = z.infer<typeof editSchema>;
type ConfirmValues = z.infer<typeof confirmSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

// ─── Confirmation modal ───────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: EditValues;
  current: EditValues;
  onConfirmed: (password: string, reason?: string) => void;
  isSubmitting: boolean;
  passwordError: string | null;
}

function ConfirmModal({
  open,
  onOpenChange,
  pending,
  current,
  onConfirmed,
  isSubmitting,
  passwordError,
}: ConfirmModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
  });

  // Surface server-side password error into the form
  useEffect(() => {
    if (passwordError) {
      setError('password', { message: passwordError });
    }
  }, [passwordError, setError]);

  // Clear form when modal closes
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const fields: Array<{ label: string; key: keyof EditValues }> = [
    { label: 'Bank name', key: 'bankName' },
    { label: 'Account number', key: 'accountNumber' },
    { label: 'Account name', key: 'accountName' },
  ];

  const hasChanges = fields.some((f) => current[f.key] !== pending[f.key]);

  function onSubmit(values: ConfirmValues) {
    onConfirmed(values.password, values.reason || undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Confirm bank detail changes</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Before / after comparison */}
          {hasChanges && (
            <div className="rounded-lg border overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-muted/40 px-3 py-1.5 font-medium text-muted-foreground uppercase tracking-wide">
                <span>Before</span>
                <span>After</span>
              </div>
              {fields.map(({ label, key }) => {
                const changed = current[key] !== pending[key];
                return (
                  <div
                    key={key}
                    className={[
                      'grid grid-cols-2 gap-2 px-3 py-2 border-t',
                      changed ? 'bg-amber-500/10' : '',
                    ].join(' ')}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">{label}</span>
                      <span
                        className={[
                          'font-mono break-all',
                          changed ? 'line-through text-red-400' : 'text-foreground',
                        ].join(' ')}
                      >
                        {current[key] || '—'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">&nbsp;</span>
                      <span
                        className={[
                          'font-mono break-all',
                          changed ? 'text-primary font-semibold' : 'text-foreground',
                        ].join(' ')}
                      >
                        {pending[key] || '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
            <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200">
              All super admins will be emailed about this change.
            </p>
          </div>

          {/* Optional reason */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">
              Reason <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Briefly explain why these details are changing…"
              disabled={isSubmitting}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Your password</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="current-password"
              placeholder="Enter your password to confirm"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Confirm changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentSettingsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;

  const { data: settings, isLoading, isError, refetch } = usePaymentSettings();
  const updateMutation = useUpdatePaymentSettings();

  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditValues | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Rate-limit cooldown — soft client-side: disabled for 5 minutes after 429
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // rateLimitedUntil is cleared via setTimeout after 5 minutes, so presence
  // alone is sufficient to know we're still in the cooldown window.
  const isRateLimited = rateLimitedUntil !== null;

  // Countdown display for the banner
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  useEffect(() => {
    if (!isRateLimited) return;
    const tick = () => {
      const left = Math.ceil(((rateLimitedUntil ?? 0) - Date.now()) / 1000);
      setCooldownSecondsLeft(Math.max(left, 0));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitedUntil]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { bankName: '', accountNumber: '', accountName: '' },
  });

  // Populate form when settings load or when switching to edit mode
  useEffect(() => {
    if (settings && editing) {
      reset({
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        accountName: settings.accountName,
      });
    }
  }, [settings, editing, reset]);

  function handleEditClick() {
    if (!settings) return;
    reset({
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      accountName: settings.accountName,
    });
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    reset();
  }

  // Step 1: form validation passes → open confirm modal
  function onFormSubmit(values: EditValues) {
    setPendingValues(values);
    setPasswordError(null);
    setConfirmOpen(true);
  }

  // Step 2: modal confirmed with password
  function handleConfirmed(password: string, reason?: string) {
    if (!pendingValues) return;
    setPasswordError(null);

    updateMutation.mutate(
      { ...pendingValues, password, reason },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setEditing(false);
          reset();
          toast.success('Bank details updated.');
        },
        onError: (err) => {
          const classified = classifyUpdateError(err);
          if (classified.kind === 'bad_password') {
            // Modal stays open; show inline error
            setPasswordError('Incorrect password.');
          } else if (classified.kind === 'rate_limited') {
            setConfirmOpen(false);
            setEditing(false);
            const until = Date.now() + 5 * 60 * 1000; // 5 minutes
            setRateLimitedUntil(until);
            if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
            cooldownTimer.current = setTimeout(() => setRateLimitedUntil(null), 5 * 60 * 1000);
            toast.error('Too many attempts. Try again later.');
          } else {
            toast.error(classified.message || 'Failed to update bank details.');
          }
        },
      },
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const updatedByName =
    settings?.updatedBy
      ? `${settings.updatedBy.firstName} ${settings.updatedBy.lastName}`
      : null;

  const lastUpdatedCaption =
    settings?.updatedAt
      ? updatedByName
        ? `Last updated by ${updatedByName} on ${formatDate(settings.updatedAt, 'dd MMM yyyy, HH:mm')}`
        : `Last updated on ${formatDate(settings.updatedAt, 'dd MMM yyyy, HH:mm')}`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Settings"
        subtitle="Bank account details used for manual payments."
      />

      {/* Rate-limited banner */}
      {isRateLimited && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <ShieldAlert className="size-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-200">
            Too many failed attempts. Editing is disabled for{' '}
            <span className="font-semibold">
              {Math.floor(cooldownSecondsLeft / 60)}:
              {String(cooldownSecondsLeft % 60).padStart(2, '0')}
            </span>
            .
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <CardTitle>Bank Account</CardTitle>
          {isSuperAdmin && !editing && !isRateLimited && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditClick}
              disabled={isLoading || isError}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
          {editing && (
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="size-4" />
              Cancel
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {isLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">Failed to load payment settings.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {settings && !editing && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <DetailRow label="Bank name" value={settings.bankName} />
                <DetailRow label="Account number" value={settings.accountNumber} />
                <DetailRow label="Account name" value={settings.accountName} />
              </div>
              {lastUpdatedCaption && (
                <p className="text-xs text-muted-foreground">{lastUpdatedCaption}</p>
              )}
            </>
          )}

          {settings && editing && (
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bankName">Bank name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. First Bank"
                    aria-invalid={!!errors.bankName}
                    {...register('bankName')}
                  />
                  {errors.bankName && (
                    <p className="text-xs text-destructive">{errors.bankName.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="accountNumber">Account number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="10-digit number"
                    maxLength={10}
                    aria-invalid={!!errors.accountNumber}
                    {...register('accountNumber')}
                  />
                  {errors.accountNumber && (
                    <p className="text-xs text-destructive">{errors.accountNumber.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="accountName">Account name</Label>
                  <Input
                    id="accountName"
                    placeholder="Account holder name"
                    aria-invalid={!!errors.accountName}
                    {...register('accountName')}
                  />
                  {errors.accountName && (
                    <p className="text-xs text-destructive">{errors.accountName.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!isDirty}>
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Confirmation modal */}
      {pendingValues && settings && (
        <ConfirmModal
          open={confirmOpen}
          onOpenChange={(open) => {
            if (!open && !updateMutation.isPending) {
              setConfirmOpen(false);
              setPasswordError(null);
            }
          }}
          current={{
            bankName: settings.bankName,
            accountNumber: settings.accountNumber,
            accountName: settings.accountName,
          }}
          pending={pendingValues}
          onConfirmed={handleConfirmed}
          isSubmitting={updateMutation.isPending}
          passwordError={passwordError}
        />
      )}
    </div>
  );
}
