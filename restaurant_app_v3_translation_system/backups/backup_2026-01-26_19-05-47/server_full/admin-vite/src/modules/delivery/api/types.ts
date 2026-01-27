/**
 * Delivery Module Types
 * Extracted from deliveryKpi.api.ts
 */

export interface DeliveryOverview {
  totalDeliveries: number;
  avgDeliveryMinutes: number;
  onTimeRate: number;
  cancelRate: number;
  avgPreparationMinutes: number;
  avgAssignMinutes: number;
  avgTransitMinutes: number;
  platformMix: Array<{
    platform: string;
    count: number;
    share: number;
  }>;
}

export interface CourierKpi {
  courierId: number;
  name: string;
  totalDeliveries: number;
  avgDeliveryMinutes: number;
  onTimeRate: number;
  cancelRate: number;
  distanceKmTotal: number;
  score: number;
}

export interface TimeseriesData {
  day: string;
  totalDeliveries: number;
  avgDeliveryMinutes: number;
  onTimeRate: number;
  cancelRate: number;
}

export interface HeatmapData {
  weekday: number;
  hour: number;
  totalDeliveries: number;
  avgDeliveryMinutes: number;
}

export interface DeliveryKpiFilters {
  dateFrom?: string;
  dateTo?: string;
  locationId?: number;
}

