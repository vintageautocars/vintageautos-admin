import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { LayoutDashboard, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/app/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { ForcePasswordChangeModal } from '@/components/auth/force-password-change-modal';
import type { LoginFormValues } from '@/components/auth/login-form';

const FEATURES = [
  { icon: LayoutDashboard, label: 'Full platform oversight and reporting' },
  { icon: MapPin,          label: 'Operations across all 36 states + FCT' },
  { icon: ShieldCheck,     label: 'Manage approvals, users and access' },
] as const;

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-between h-full relative overflow-hidden">
      {/* Vehicle background */}
      <img
        src="/vintagecar-login.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark gradient overlay — heavier at top and bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/85" />

      {/* Logo */}
      <div className="relative p-10 flex flex-col">
        <span className="font-heading text-lg font-semibold leading-tight">
          <span className="text-primary">Vintage Cars</span>
          <span className="text-white"> of Nigeria</span>
        </span>
        <span className="mt-0.5 text-xs font-medium uppercase tracking-widest text-white/45">
          Admin
        </span>
      </div>

      {/* Headline + feature list */}
      <div className="relative p-10 space-y-8">
        <div className="space-y-4">
          <div className="w-8 h-px bg-primary" />
          <h2 className="font-heading text-4xl font-bold leading-tight">
            <span className="text-white">Manage the </span>
            <span className="text-primary">platform.</span>
          </h2>
          <p className="text-sm text-white/65 leading-relaxed max-w-xs">
            Centralised control over Nigeria's premier vintage car rental platform — vehicles, bookings, and operations nationwide.
          </p>
        </div>

        <ul className="space-y-3.5">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <Icon className="size-4 text-primary shrink-0" />
              <span className="text-sm text-white/65">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <p className="relative p-10 text-xs text-white/30">
        &copy; {new Date().getFullYear()} Vintage Cars of Nigeria
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { user, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, setIsPending] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (!authLoading && user && !user.mustChangePassword) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  async function handleSubmit(values: LoginFormValues) {
    setIsPending(true);
    try {
      const me = await login(values.email, values.password);
      if (me.mustChangePassword) {
        setShowPasswordChange(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  function handlePasswordChanged() {
    setShowPasswordChange(false);
    navigate(from, { replace: true });
  }

  return (
    <>
    <ForcePasswordChangeModal
      open={showPasswordChange}
      onPasswordChanged={handlePasswordChanged}
    />
    <div className="flex h-screen">
      <LeftPanel />

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex flex-col lg:hidden">
            <span className="font-heading text-lg font-semibold leading-tight">
              <span className="text-primary">Vintage Cars</span>
              <span className="text-foreground"> of Nigeria</span>
            </span>
            <span className="mt-0.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Admin
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          <LoginForm onSubmit={handleSubmit} isLoading={isPending} />
        </div>
      </div>
    </div>
    </>
  );
}
