import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldAlert } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/password-input';
import api from '@/lib/api';

const schema = z.object({
  currentPassword: z.string().min(1, 'Enter your temporary password'),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/\d/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

interface ForcePasswordChangeModalProps {
  open: boolean;
  onPasswordChanged: () => void;
}

export function ForcePasswordChangeModal({ open, onPasswordChanged }: ForcePasswordChangeModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      onPasswordChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Failed to change password. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="size-5 text-primary shrink-0" />
            <DialogTitle>Set a new password</DialogTitle>
          </div>
          <DialogDescription>
            Your account was created with a temporary password. You must set a permanent password before continuing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-current">Temporary password</Label>
            <PasswordInput id="fp-current" {...register('currentPassword')} disabled={isSubmitting} />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-new">New password</Label>
            <PasswordInput id="fp-new" {...register('newPassword')} disabled={isSubmitting} />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-confirm">Confirm new password</Label>
            <PasswordInput id="fp-confirm" {...register('confirmPassword')} disabled={isSubmitting} />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? <><Loader2 className="size-4 mr-2 animate-spin" />Updating password…</>
              : 'Set new password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
