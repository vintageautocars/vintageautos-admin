export type NegotiationStatus = 'OPEN' | 'AGREED' | 'REJECTED';
export type NegotiationSenderRole = 'ADMIN' | 'OWNER';

export interface NegotiationSender {
  id:        string;
  firstName: string;
  lastName:  string;
}

export interface NegotiationMessage {
  id:            string;
  negotiationId: string;
  senderId:      string;
  sender:        NegotiationSender;
  senderRole:    NegotiationSenderRole;
  body:          string;
  createdAt:     string;
}

export interface Negotiation {
  id:           string;
  vehicleId:    string;
  status:       NegotiationStatus;
  agreedPrice:  string | null;
  rentalPrice:  string | null;
  resolvedAt:   string | null;
  createdAt:    string;
  updatedAt:    string;
  messages:     NegotiationMessage[];
}
