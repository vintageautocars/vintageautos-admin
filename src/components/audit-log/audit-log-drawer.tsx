// Exports both the drawer component and helper utilities used elsewhere.
/* eslint-disable react-refresh/only-export-components */
/* oxlint-disable react/only-export-components */

import { formatDistanceToNow, parseISO } from 'date-fns';
import { formatDate } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLogEntry } from '@/hooks/use-audit-log';
import type { AuditLog } from '@/types/audit-log';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_DISPLAY: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  OWNER:       'Partner',
  CUSTOMER:    'Client',
};

function rolePill(role: string) {
  const isSuperAdmin = role === 'SUPER_ADMIN';
  return (
    <span
      key={role}
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        isSuperAdmin
          ? 'bg-primary/15 text-primary border-primary/30'
          : 'bg-muted text-muted-foreground border-white/10',
      ].join(' ')}
    >
      {ROLE_DISPLAY[role] ?? role.replace('_', ' ')}
    </span>
  );
}

function actionPill(action: string) {
  const isFailed = action.includes('FAILED');
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium font-mono',
        isFailed
          ? 'bg-red-500/15 text-red-400 border-red-500/30'
          : 'bg-primary/15 text-primary border-primary/30',
      ].join(' ')}
    >
      {action}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

// ─── Minimal inline diff ──────────────────────────────────────────────────────

type JsonObject = Record<string, unknown>;

function isObject(val: unknown): val is JsonObject {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function DiffView({ before, after }: { before: unknown; after: unknown }) {
  if (!isObject(before) && !isObject(after)) {
    return (
      <p className="text-xs text-muted-foreground">No structured diff available.</p>
    );
  }

  const beforeObj = isObject(before) ? before : {};
  const afterObj = isObject(after) ? after : {};
  const keys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]));

  return (
    <div className="rounded-lg border overflow-hidden text-xs font-mono">
      <div className="grid grid-cols-2 bg-muted/40 px-3 py-1.5 font-sans font-medium text-muted-foreground uppercase tracking-wide text-xs">
        <span>Before</span>
        <span>After</span>
      </div>
      {keys.map((key) => {
        const bVal = JSON.stringify(beforeObj[key]);
        const aVal = JSON.stringify(afterObj[key]);
        const added = !(key in beforeObj);
        const removed = !(key in afterObj);
        const changed = !added && !removed && bVal !== aVal;

        return (
          <div
            key={key}
            className={[
              'grid grid-cols-2 gap-2 px-3 py-1.5 border-t',
              added ? 'bg-primary/10' : removed ? 'bg-red-500/10' : changed ? 'bg-amber-500/10' : '',
            ].join(' ')}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-sans text-muted-foreground not-italic">{key}</span>
              <span
                className={[
                  'break-all',
                  removed ? 'line-through text-red-400' : changed ? 'line-through text-red-400' : 'text-foreground',
                ].join(' ')}
              >
                {added ? '' : bVal ?? '—'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-sans text-muted-foreground not-italic">&nbsp;</span>
              <span
                className={[
                  'break-all',
                  added ? 'text-primary font-semibold' : changed ? 'text-primary font-semibold' : 'text-foreground',
                ].join(' ')}
              >
                {removed ? '' : aVal ?? '—'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Drawer body ──────────────────────────────────────────────────────────────

function DrawerBody({ entryId, onClose }: { entryId: string; onClose: () => void }) {
  const { data: entry, isLoading, isError, refetch } = useAuditLogEntry(entryId);

  void onClose;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !entry) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
        <p className="text-sm text-muted-foreground">Failed to load audit log entry.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const metadata = isObject(entry.metadata) ? entry.metadata : null;
  const ip = typeof metadata?.ip === 'string' ? metadata.ip : null;
  const userAgent = typeof metadata?.userAgent === 'string' ? metadata.userAgent : null;
  const reason = typeof metadata?.reason === 'string' ? metadata.reason : null;

  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-2 pt-1">
        {actionPill(entry.action)}
        <p className="text-xs text-muted-foreground font-mono">{entry.id}</p>
      </div>

      {/* Core details */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <DetailRow label="Timestamp">
          {formatDate(entry.createdAt, 'dd MMM yyyy, HH:mm:ss')}
          <span className="ml-1.5 text-muted-foreground text-xs">
            ({formatDistanceToNow(parseISO(entry.createdAt), { addSuffix: true })})
          </span>
        </DetailRow>

        <DetailRow label="Actor">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>
              {entry.actor.firstName} {entry.actor.lastName}
            </span>
            {entry.actor.roles.map((r) => rolePill(r))}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{entry.actor.email}</p>
        </DetailRow>

        {entry.entityType && (
          <DetailRow label="Entity">
            <span>{entry.entityType}</span>
            {entry.entityId && (
              <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                {entry.entityId}
              </span>
            )}
          </DetailRow>
        )}

        {ip && (
          <DetailRow label="Source IP">
            <span className="font-mono text-muted-foreground">{ip}</span>
          </DetailRow>
        )}

        {userAgent && (
          <DetailRow label="User agent">
            <span className="font-mono text-xs text-muted-foreground break-all">{userAgent}</span>
          </DetailRow>
        )}

        {reason && (
          <DetailRow label="Reason">
            <span className="text-muted-foreground">{reason}</span>
          </DetailRow>
        )}
      </div>

      {/* Diff view */}
      {(entry.before !== null || entry.after !== null) && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Changes</p>
          <DiffView before={entry.before} after={entry.after} />
        </div>
      )}

      {/* Raw JSON (collapsible) */}
      <details className="group rounded-lg border">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground select-none">
          Raw JSON
          <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
          <span className="text-xs text-muted-foreground hidden group-open:block">Hide</span>
        </summary>
        <div className="border-t px-4 pb-4 pt-3 flex flex-col gap-3">
          {entry.before !== null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">before</p>
              <pre className="text-xs font-mono bg-muted/30 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(entry.before, null, 2)}
              </pre>
            </div>
          )}
          {entry.after !== null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">after</p>
              <pre className="text-xs font-mono bg-muted/30 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(entry.after, null, 2)}
              </pre>
            </div>
          )}
          {entry.metadata !== null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">metadata</p>
              <pre className="text-xs font-mono bg-muted/30 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

// ─── Exported drawer ──────────────────────────────────────────────────────────

interface AuditLogDrawerProps {
  entryId: string | null;
  onClose: () => void;
}

export function AuditLogDrawer({ entryId, onClose }: AuditLogDrawerProps) {
  return (
    <Sheet open={!!entryId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <SheetTitle>Audit log entry</SheetTitle>
          <SheetDescription>Full detail of this audit event.</SheetDescription>
        </SheetHeader>
        {entryId && <DrawerBody entryId={entryId} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}

// Re-export helpers for use in the list page
export { rolePill, actionPill };

// Re-export StatusBadge type usage
export type { AuditLog };
