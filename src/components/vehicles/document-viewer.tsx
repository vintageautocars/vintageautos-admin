import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { useFetchDocumentUrl } from '@/hooks/use-vehicles';
import { formatDate } from '@/lib/utils';
import type { VehicleDocument } from '@/types/vehicle';

interface DocumentRowProps {
  vehicleId: string;
  doc: VehicleDocument;
}

function DocumentRow({ vehicleId, doc }: DocumentRowProps) {
  const fetchUrl = useFetchDocumentUrl();
  const isLoading = fetchUrl.isPending;

  function handleView() {
    fetchUrl.mutate(
      { vehicleId, docId: doc.id },
      {
        onSuccess: (url) => {
          window.open(url, '_blank', 'noopener,noreferrer');
        },
      },
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">{doc.filename}</span>
          <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={handleView}
        className="shrink-0"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        View
      </Button>
    </div>
  );
}

interface DocumentViewerProps {
  vehicleId: string;
  documents: VehicleDocument[];
}

export function DocumentViewer({ vehicleId, documents }: DocumentViewerProps) {
  if (!documents || documents.length === 0) {
    return <EmptyState icon={FileText} title="No documents uploaded" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => (
        <DocumentRow key={doc.id} vehicleId={vehicleId} doc={doc} />
      ))}
    </div>
  );
}
