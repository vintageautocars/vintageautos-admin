export interface PaymentSettingsUpdatedBy {
  firstName: string;
  lastName: string;
}

export interface PaymentSettings {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  updatedAt: string;
  updatedBy: PaymentSettingsUpdatedBy | null;
}

export interface UpdatePaymentSettingsPayload {
  bankName: string;
  accountNumber: string;
  accountName: string;
  password: string;
  reason?: string;
}
