import { useState } from 'react';
import { Loader2, Shield, ShieldOff, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import {
  useActivateUser,
  useDeactivateUser,
  useDeleteUser,
  useUpdateUserRoles,
} from '@/hooks/use-users';
import { useAuth } from '@/app/auth-context';
import type { AdminUser } from '@/types/user';
import type { UserRole } from '@/types/common';
import { useNavigate } from 'react-router';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  OWNER:       'Vehicle Owner',
  CUSTOMER:    'Customer',
};

function RoleBadge({ role }: { role: UserRole }) {
  const colours: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    ADMIN:       'bg-blue-500/15 text-blue-400 border-blue-500/30',
    OWNER:       'bg-primary/15 text-primary border-primary/30',
    CUSTOMER:    'bg-white/10 text-[var(--color-gray-text)] border-white/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colours[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

interface UserActionsProps {
  user: AdminUser;
}

export function UserActions({ user }: UserActionsProps) {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const activate   = useActivateUser();
  const deactivate = useDeactivateUser();
  const updateRoles = useUpdateUserRoles();
  const deleteUser = useDeleteUser();

  const isSelf        = me?.id === user.id;
  const isSuperAdmin  = user.roles.includes('SUPER_ADMIN');
  const isProtected   = isSelf || isSuperAdmin;

  function toggleRole(role: UserRole) {
    const hasRole = user.roles.includes(role);
    const next = hasRole
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role];
    updateRoles.mutate({ id: user.id, roles: next });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current roles */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[var(--color-gray-text)] uppercase tracking-wide font-medium">Roles</p>
        <div className="flex flex-wrap gap-2">
          {user.roles.map(r => <RoleBadge key={r} role={r} />)}
        </div>
      </div>

      {/* Role management — only for non-super-admin, non-self */}
      {!isProtected && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[var(--color-gray-text)] uppercase tracking-wide font-medium">Toggle roles</p>
          <div className="flex flex-wrap gap-2">
            {(['ADMIN', 'OWNER', 'CUSTOMER'] as UserRole[]).map(role => {
              const has = user.roles.includes(role);
              const pending = updateRoles.isPending;
              return (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => toggleRole(role)}
                  className={has ? 'border-primary/40 text-primary' : ''}
                >
                  {pending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : (
                    has ? <ShieldOff className="size-3.5 mr-1" /> : <Shield className="size-3.5 mr-1" />
                  )}
                  {has ? `Remove ${ROLE_LABELS[role]}` : `Add ${ROLE_LABELS[role]}`}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activate / Deactivate */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[var(--color-gray-text)] uppercase tracking-wide font-medium">Account status</p>
        <div className="flex flex-wrap gap-2">
          {user.isActive ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isProtected || deactivate.isPending}
              onClick={() => setConfirmDeactivate(true)}
              className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
            >
              {deactivate.isPending
                ? <Loader2 className="size-3.5 animate-spin mr-1" />
                : <UserX className="size-3.5 mr-1" />}
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isProtected || activate.isPending}
              onClick={() => activate.mutate(user.id)}
              className="text-green-400 border-green-500/30 hover:bg-green-500/10"
            >
              {activate.isPending
                ? <Loader2 className="size-3.5 animate-spin mr-1" />
                : <UserCheck className="size-3.5 mr-1" />}
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Delete */}
      {!isProtected && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[var(--color-gray-text)] uppercase tracking-wide font-medium">Danger zone</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="w-fit text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5 mr-1" />
            Delete user
          </Button>
        </div>
      )}

      {isProtected && (
        <p className="text-xs text-[var(--color-gray-text)]">
          {isSelf ? 'You cannot modify your own account here.' : 'Super admin accounts are protected.'}
        </p>
      )}

      <ConfirmModal
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="Deactivate user?"
        description={`${user.firstName} ${user.lastName} will no longer be able to log in.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={() => deactivate.mutate(user.id)}
      />

      <ConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete user?"
        description={`This will permanently delete ${user.firstName} ${user.lastName} and all their data. This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          deleteUser.mutate(user.id, {
            onSuccess: () => navigate('/users'),
          });
        }}
      />
    </div>
  );
}
