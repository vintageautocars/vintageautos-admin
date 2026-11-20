// action is a string — open enum since the set will grow over time.
export type AuditLogAction = string;

/**
 * Central registry of every known audit action. Mirrors AUDIT_ACTIONS in the backend.
 * Use these constants in filter UIs and display helpers — never inline string literals.
 */
export const AUDIT_ACTIONS = {
  // Payment Settings
  PAYMENT_SETTINGS_UPDATED:       'PAYMENT_SETTINGS_UPDATED',
  PAYMENT_SETTINGS_UPDATE_FAILED: 'PAYMENT_SETTINGS_UPDATE_FAILED',

  // Vehicles
  VEHICLE_APPROVED:               'VEHICLE_APPROVED',
  VEHICLE_REJECTED:               'VEHICLE_REJECTED',
  VEHICLE_AVAILABILITY_TOGGLED:   'VEHICLE_AVAILABILITY_TOGGLED',
  VEHICLE_FEATURED_TOGGLED:       'VEHICLE_FEATURED_TOGGLED',

  // Bookings
  BOOKING_CONFIRMED:              'BOOKING_CONFIRMED',
  BOOKING_MARKED_ACTIVE:          'BOOKING_MARKED_ACTIVE',
  BOOKING_COMPLETED:              'BOOKING_COMPLETED',
  BOOKING_CANCELLED:              'BOOKING_CANCELLED',

  // Owner Applications
  OWNER_APPLICATION_APPROVED:     'OWNER_APPLICATION_APPROVED',
  OWNER_APPLICATION_REJECTED:     'OWNER_APPLICATION_REJECTED',

  // Users
  ADMIN_USER_CREATED:             'ADMIN_USER_CREATED',
  USER_ACTIVATED:                 'USER_ACTIVATED',
  USER_DEACTIVATED:               'USER_DEACTIVATED',
  USER_ROLES_UPDATED:             'USER_ROLES_UPDATED',
  USER_DELETED:                   'USER_DELETED',

  // Payments (manual verification)
  PAYMENT_VERIFIED:               'PAYMENT_VERIFIED',
  PAYMENT_REJECTED:               'PAYMENT_REJECTED',
} as const;

export interface AuditLogActor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // The backend DTO exposes `roles` (array) not `role`.
  roles: string[];
}

export interface AuditLog {
  id: string;
  action: AuditLogAction;
  actorId: string;
  actor: AuditLogActor;
  entityType: string | null;
  entityId: string | null;
  before: unknown | null;
  after: unknown | null;
  metadata: unknown | null;
  createdAt: string;
}

// Backend returns { items: AuditLog[], total: number } (no page/pageSize in the envelope).
export interface PaginatedAuditLog {
  items: AuditLog[];
  total: number;
}

export interface AuditLogFilters {
  action?: string;
  actorId?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

type ActionTone = 'green' | 'red' | 'amber' | 'blue';

/**
 * Maps an action string to a colour tone for pill rendering.
 * green  → approved / confirmed / verified / activated / completed
 * red    → rejected / cancelled / deactivated / deleted / failed
 * amber  → toggled / updated
 * blue   → created / marked_active
 */
export function getActionTone(action: string): ActionTone {
  const a = action.toUpperCase();
  if (
    a.includes('APPROVED') ||
    a.includes('CONFIRMED') ||
    a.includes('VERIFIED') ||
    a.includes('ACTIVATED') ||
    a.includes('COMPLETED')
  ) return 'green';

  if (
    a.includes('REJECTED') ||
    a.includes('CANCELLED') ||
    a.includes('DEACTIVATED') ||
    a.includes('DELETED') ||
    a.includes('FAILED')
  ) return 'red';

  if (a.includes('TOGGLED') || a.includes('UPDATED')) return 'amber';

  return 'blue';
}

/**
 * Returns a human-readable label for a known action value.
 * Falls back to the raw action string (title-cased) for unknown actions.
 */
const ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.PAYMENT_SETTINGS_UPDATED]:       'Payment settings updated',
  [AUDIT_ACTIONS.PAYMENT_SETTINGS_UPDATE_FAILED]: 'Payment settings update failed',
  [AUDIT_ACTIONS.VEHICLE_APPROVED]:               'Vehicle approved',
  [AUDIT_ACTIONS.VEHICLE_REJECTED]:               'Vehicle rejected',
  [AUDIT_ACTIONS.VEHICLE_AVAILABILITY_TOGGLED]:   'Vehicle availability toggled',
  [AUDIT_ACTIONS.VEHICLE_FEATURED_TOGGLED]:       'Vehicle featured toggled',
  [AUDIT_ACTIONS.BOOKING_CONFIRMED]:              'Booking confirmed',
  [AUDIT_ACTIONS.BOOKING_MARKED_ACTIVE]:          'Booking marked active',
  [AUDIT_ACTIONS.BOOKING_COMPLETED]:              'Booking completed',
  [AUDIT_ACTIONS.BOOKING_CANCELLED]:              'Booking cancelled',
  [AUDIT_ACTIONS.OWNER_APPLICATION_APPROVED]:     'Owner application approved',
  [AUDIT_ACTIONS.OWNER_APPLICATION_REJECTED]:     'Owner application rejected',
  [AUDIT_ACTIONS.ADMIN_USER_CREATED]:             'Admin user created',
  [AUDIT_ACTIONS.USER_ACTIVATED]:                 'User activated',
  [AUDIT_ACTIONS.USER_DEACTIVATED]:               'User deactivated',
  [AUDIT_ACTIONS.USER_ROLES_UPDATED]:             'User roles updated',
  [AUDIT_ACTIONS.USER_DELETED]:                   'User deleted',
  [AUDIT_ACTIONS.PAYMENT_VERIFIED]:               'Payment verified',
  [AUDIT_ACTIONS.PAYMENT_REJECTED]:               'Payment rejected',
};

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
