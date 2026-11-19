import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import type { VehiclePhoto } from '@/types/vehicle';

interface PhotoGalleryProps {
  photos: VehiclePhoto[];
  vehicleName: string;
}

interface LightboxProps {
  photos: VehiclePhoto[];
  currentIndex: number;
  vehicleName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ photos, currentIndex, vehicleName, onClose, onPrev, onNext }: LightboxProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPrev, onNext]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl" showCloseButton>
        <div className="relative flex items-center justify-center">
          <img
            src={photos[currentIndex].url}
            alt={`${vehicleName} — photo ${currentIndex + 1}`}
            className="max-h-[70vh] w-full rounded-lg object-contain"
            loading="lazy"
          />
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background"
                onClick={onPrev}
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background"
                onClick={onNext}
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {currentIndex + 1} / {photos.length}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function PhotoGallery({ photos, vehicleName }: PhotoGalleryProps) {
  const sorted = [...photos].sort((a, b) => a.order - b.order);
  const primaryIndex = sorted.findIndex((p) => p.isPrimary);
  const initial = primaryIndex >= 0 ? primaryIndex : 0;

  const [mainIndex, setMainIndex] = useState(initial);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (sorted.length === 0) {
    return <EmptyState icon={ImageOff} title="No photos uploaded" />;
  }

  const main = sorted[mainIndex];

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function lightboxPrev() {
    setLightboxIndex((i) => (i - 1 + sorted.length) % sorted.length);
  }

  function lightboxNext() {
    setLightboxIndex((i) => (i + 1) % sorted.length);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <button
        className="relative w-full overflow-hidden rounded-lg border bg-muted"
        style={{ aspectRatio: '16/9' }}
        onClick={() => openLightbox(mainIndex)}
        aria-label="Open lightbox"
      >
        <img
          src={main.url}
          alt={`${vehicleName} — main photo`}
          className="size-full object-cover"
          loading="lazy"
        />
      </button>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setMainIndex(i)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded border-2 transition-colors',
                i === mainIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground/40',
              )}
              aria-label={`View photo ${i + 1}`}
            >
              <img
                src={photo.url}
                alt={`${vehicleName} — thumbnail ${i + 1}`}
                className="size-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          photos={sorted}
          currentIndex={lightboxIndex}
          vehicleName={vehicleName}
          onClose={() => setLightboxOpen(false)}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
        />
      )}
    </div>
  );
}
