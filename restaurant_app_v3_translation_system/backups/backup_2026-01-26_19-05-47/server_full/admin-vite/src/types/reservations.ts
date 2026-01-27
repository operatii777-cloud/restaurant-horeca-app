export type ReservationStatus = "Pending:" | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation {
  id: number;
  table_id: number;
  table_number?: string | null;
  capacity?: number | null;
  location?: string | null;
  confirmation_code?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  reservation_date: string;
  reservation_time: string;
  duration_minutes: number;
  party_size: number;
  special_requests?: string | null;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationFilters {
  startDate?: string;
  endDate?: string;
  statuses?: ReservationStatus[];
  includeCancelled?: boolean;
  tableId?: number | null;
  search?: string;
}

export interface ReservationListMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ReservationTableOption {
  id: number;
  tableNumber: string;
  capacity: number;
  location?: string | null;
  isAvailable?: boolean;
}

export interface ReservationMetrics {
  stats: {
    total_reservations: number;
    confirmed_reservations: number;
    completed_reservations: number;
    cancelled_reservations: number;
    no_show_reservations: number;
    avg_party_size: number;
    total_guests: number;
  };
  today: {
    total: number;
    confirmed: number;
    cancelled: number;
    noShow: number;
  };
  occupancy: {
    percentage: number;
    totalTables: number;
    reservationsToday: number;
  };
}

export interface ReservationTimelineEventPayload {
  [key: string]: unknown;
}

export interface ReservationTimelineEvent {
  id: string | number;
  eventType: string;
  createdAt: string;
  createdBy?: string | null;
  payload?: ReservationTimelineEventPayload | null;
}


