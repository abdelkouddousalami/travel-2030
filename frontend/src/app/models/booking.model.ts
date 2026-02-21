export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface BookingRequest {
  destinationId: number;
  startDate: string;
  endDate: string;
  status?: BookingStatus;
}

export interface BookingResponse {
  id: number;
  userId: number;
  username: string;
  destinationId: number;
  destinationName: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée'
};
