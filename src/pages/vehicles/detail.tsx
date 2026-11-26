import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VehicleOverview } from '@/components/vehicles/vehicle-overview';
import { PhotoGallery } from '@/components/vehicles/photo-gallery';
import { DocumentViewer } from '@/components/vehicles/document-viewer';
import { VehicleActions } from '@/components/vehicles/vehicle-actions';
import { NegotiationPanel } from '@/components/vehicles/negotiation-panel';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { useVehicle, useAdminDeleteVehicle } from '@/hooks/use-vehicles';

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-72" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id ?? '');
  const deleteMutation = useAdminDeleteVehicle();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/vehicles"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Vehicles
      </Link>

      {isLoading && <LoadingSkeleton />}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">Failed to load vehicle details.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {vehicle && (
        <>
          {/* Header row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-semibold text-foreground">{vehicle.name}</h1>
              <p className="text-sm text-muted-foreground">
                {vehicle.make} {vehicle.model} · {vehicle.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={vehicle.status} className="w-fit" />
              <Button asChild size="sm" variant="outline">
                <Link to={`/vehicles/${vehicle.id}/edit`}>
                  <Pencil className="size-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>

          {/* Action bar */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleActions vehicle={vehicle} />
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="negotiation">
                Negotiation
                {vehicle.status === 'PENDING_REVIEW' && (
                  <span className="ml-1.5 inline-flex size-2 rounded-full bg-yellow-400" />
                )}
              </TabsTrigger>
              <TabsTrigger value="photos">
                Photos{vehicle.photos.length > 0 ? ` (${vehicle.photos.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documents{vehicle.documents && vehicle.documents.length > 0 ? ` (${vehicle.documents.length})` : ''}
              </TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <VehicleOverview vehicle={vehicle} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="negotiation" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <NegotiationPanel
                    vehicleId={vehicle.id}
                    vehicleStatus={vehicle.status}
                    dailyRate={vehicle.dailyRate}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <PhotoGallery photos={vehicle.photos} vehicleName={vehicle.name} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <DocumentViewer
                    vehicleId={vehicle.id}
                    documents={vehicle.documents ?? []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <ConfirmModal
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Vehicle"
            description={`Permanently delete "${vehicle.name}"? All photos and documents stored in Cloudinary will also be removed. This cannot be undone.`}
            confirmLabel="Delete"
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              deleteMutation.mutate(vehicle.id, {
                onSuccess: () => navigate('/vehicles'),
              });
            }}
          />
        </>
      )}
    </div>
  );
}
