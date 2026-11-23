import { useState } from 'react';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { VehicleDocument } from '@/types/vehicle';

const DOC_TYPE_LABELS: Record<string, string> = {
  REGISTRATION_PAPER: 'Registration Paper',
  INSURANCE:          'Insurance Certificate',
  ROADWORTHINESS:     'Roadworthiness Certificate',
  OTHER:              'Other Document',
};

interface DocumentRowProps {
  vehicleId: string;
  doc:       VehicleDocument;
}

function DocumentRow({ vehicleId, doc }: DocumentRowProps) {
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [docUrl, setDocUrl]     = useState<string | null>(null);

  async function handleView() {
    if (docUrl) { setOpen(true); return; }
    setLoading(true);
    try {
      const res = await api.get<{ url: string }>(
        `/vehicles/admin/${vehicleId}/documents/${doc.id}/url`,
      );
      setDocUrl(res.data.url);
      setOpen(true);
    } catch {
      toast.error('Could not load document.');
    } finally {
      setLoading(false);
    }
  }

  const typeLabel = DOC_TYPE_LABELS[doc.type] ?? doc.type;

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-foreground">{doc.name}</span>
            <span className="text-xs text-muted-foreground">
              {typeLabel} · {formatDate(doc.createdAt)}
            </span>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-3 px-5 py-3 border-b shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="overflow-hidden">
                <DialogTitle className="truncate">{doc.name}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{typeLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {docUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={docUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4 mr-1.5" />
                    Open tab
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {docUrl ? (
              <iframe
                src={docUrl}
                title={doc.name}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
