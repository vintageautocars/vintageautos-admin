import { useParams, Link } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { OwnerActions } from '@/components/owners/owner-actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useOwner } from '@/hooks/use-owners';
import { formatDate } from '@/lib/utils';
import type { OwnerProfile } from '@/types/owner';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function OwnerDetailContent({ owner }: { owner: OwnerProfile }) {
  const fullName = `${owner.user?.firstName ?? ''} ${owner.user?.lastName ?? ''}`.trim() || '—';

  return (
    <>
      <PageHeader
        title={fullName}
        subtitle={`Application ID: ${owner.id}`}
        action={<StatusBadge status={owner.status} />}
      />

      {owner.status === 'REJECTED' && owner.rejectedReason && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Application Rejected</AlertTitle>
          <AlertDescription>{owner.rejectedReason}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Applicant Details</CardTitle>
              <StatusBadge status={owner.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <DetailRow label="Full Name">{fullName}</DetailRow>
              <DetailRow label="Email">{owner.user?.email ?? '—'}</DetailRow>
              <DetailRow label="Phone">{owner.phone || '—'}</DetailRow>
              <DetailRow label="State / City">
                {[owner.state, owner.city].filter(Boolean).join(', ') || '—'}
              </DetailRow>
              <DetailRow label="Bank Name">{owner.bankName || '—'}</DetailRow>
              <DetailRow label="Account Name">{owner.accountName || '—'}</DetailRow>
              <DetailRow label="Account Number">{owner.accountNumber || '—'}</DetailRow>
              <DetailRow label="Submitted">{formatDate(owner.createdAt)}</DetailRow>
              {owner.approvedAt && (
                <DetailRow label="Approved">{formatDate(owner.approvedAt)}</DetailRow>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <OwnerActions
              ownerId={owner.id}
              status={owner.status}
              rejectedReason={owner.rejectedReason}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: owner,
    isLoading,
    isError,
    refetch,
  } = useOwner(id ?? '');

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          to="/owners"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Owner Applications
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-72" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">Failed to load owner application details.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && !owner && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">Owner application not found.</p>
          <Link to="/owners">
            <Button variant="outline" size="sm">Back to applications</Button>
          </Link>
        </div>
      )}

      {owner && <OwnerDetailContent owner={owner} />}
    </div>
  );
}
