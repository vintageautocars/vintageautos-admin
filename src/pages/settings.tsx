import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { PasswordInput } from '@/components/auth/password-input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/app/auth-context';
import api from '@/lib/api';

// ─── Profile schema ────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Password schema ───────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// ─── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  // Pre-populate when user data is available
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await api.patch('/auth/profile', data);
      toast.success('Profile updated.');
      window.location.reload();
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="First name"
                aria-invalid={!!errors.firstName}
                disabled={isSubmitting}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Last name"
                aria-invalid={!!errors.lastName}
                disabled={isSubmitting}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              aria-invalid={!!errors.phone}
              disabled={isSubmitting}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Change Password Card ──────────────────────────────────────────────────────

function ChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(data: PasswordFormValues) {
    try {
      await api.patch('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed.');
      reset();
    } catch {
      toast.error('Failed to change password. Check your current password and try again.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              placeholder="Current password"
              aria-invalid={!!errors.currentPassword}
              disabled={isSubmitting}
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              placeholder="New password (min 8 characters)"
              aria-invalid={!!errors.newPassword}
              disabled={isSubmitting}
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm new password"
              aria-invalid={!!errors.confirmPassword}
              disabled={isSubmitting}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Change password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your admin profile" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileCard />
        <ChangePasswordCard />
      </div>
    </div>
  );
}
