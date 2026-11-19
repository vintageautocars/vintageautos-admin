import { Link } from 'react-router';
import { formatCurrency, formatDate } from '@/lib/utils';
import { categoryLabel } from '@/lib/vehicle-utils';
import type { Vehicle } from '@/types/vehicle';

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function StatusChip({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

interface VehicleOverviewProps {
  vehicle: Vehicle;
}

export function VehicleOverview({ vehicle }: VehicleOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Left column */}
      <div className="flex flex-col gap-4">
        <DetailRow label="Category">{categoryLabel(vehicle.category)}</DetailRow>
        <DetailRow label="Description">
          <span className="whitespace-pre-wrap text-sm font-normal text-foreground">
            {vehicle.description}
          </span>
        </DetailRow>
        <DetailRow label="Transmission">
          {vehicle.transmission.charAt(0) + vehicle.transmission.slice(1).toLowerCase()}
        </DetailRow>
        <DetailRow label="Daily Rate">{formatCurrency(vehicle.dailyRate)}</DetailRow>
        <DetailRow label="Location">
          {vehicle.city}, {vehicle.state}
        </DetailRow>
        <div className="flex items-center gap-2">
          <StatusChip active={vehicle.isAvailable} activeLabel="Available" inactiveLabel="Unavailable" />
          <StatusChip active={vehicle.isFeatured} activeLabel="Featured" inactiveLabel="Not featured" />
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <DetailRow label="Owner (internal)">{vehicle.ownerName ?? '—'}</DetailRow>
        {vehicle.ownerId && (
          <DetailRow label="Owner Profile">
            <Link
              to={`/owners/${vehicle.ownerId}`}
              className="text-primary underline-offset-3 hover:underline"
            >
              View Owner
            </Link>
          </DetailRow>
        )}
        <DetailRow label="Submitted">{formatDate(vehicle.createdAt)}</DetailRow>
        <DetailRow label="Last Updated">{formatDate(vehicle.updatedAt)}</DetailRow>
      </div>
    </div>
  );
}
