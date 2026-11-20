import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { VehicleDocument } from '@/types/vehicle';

interface DocumentRowProps {
  vehicleId: string;
  doc: VehicleDocument;
}

function DocumentRow({ vehicleId, doc }: DocumentRowProps) {
  const [loading, setLoading] = useState(false);

  async function handleView() {
    setLoading(true);
    // Open the tab immediately while still in the user-gesture context.
    // noopener makes Chrome return null, so omit it here — the Cloudinary
    // page has no way back to us anyway once we navigate it.
    const tab = window.open('', '_blank');
    try {
      const res = await api.get<{ url: string }>(
        `/vehicles/admin/${vehicleId}/documents/${doc.id}/url`,
      );
      const signedUrl = res.data.url;
      if (tab) {
        tab.location.href = signedUrl;
      }
    } catch {
      tab?.close();
      toast.error('Could not open document.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">{doc.name}</span>
          <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleView}
        className="shrink-0"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
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
