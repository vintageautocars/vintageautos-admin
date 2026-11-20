import { useAdminStats } from './use-admin-stats';
import { useAwaitingVerification } from './use-payments';
import { usePendingBankDetailRequests } from './use-owners';

export interface PendingCounts {
  owners: number;
  vehicles: number;
  bookings: number;
  payments: number;
  bankRequests: number;
}

export function usePendingCounts(): PendingCounts {
  const { data: stats } = useAdminStats();
  const { data: awaitingPayments } = useAwaitingVerification();
  const { data: bankRequests } = usePendingBankDetailRequests();

  return {
    owners:       stats?.owners.pending   ?? 0,
    vehicles:     stats?.vehicles.pending ?? 0,
    bookings:     stats?.bookings.pending ?? 0,
    payments:     Array.isArray(awaitingPayments) ? awaitingPayments.length : 0,
    bankRequests: Array.isArray(bankRequests) ? bankRequests.length : 0,
  };
}
