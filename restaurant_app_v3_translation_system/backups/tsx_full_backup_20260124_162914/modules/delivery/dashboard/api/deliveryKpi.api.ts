// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S17.H - Delivery KPI API Client
 */

import { httpClient } from '@/shared/api/httpClient';

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

export async function fetchDeliveryOverview(filters: DeliveryKpiFilters = {}): Promise<DeliveryOverview> {
  const response = await httpClient.get('/api/delivery/kpi/overview', { params: filters });
  return response.data.data;
}

export async function fetchDeliveryByCourier(filters: DeliveryKpiFilters = {}): Promise<CourierKpi[]> {
  const response = await httpClient.get('/api/delivery/kpi/by-courier', { params: filters });
  return response.data.data;
}

export async function fetchDeliveryTimeseries(filters: DeliveryKpiFilters = {}): Promise<TimeseriesData[]> {
  const response = await httpClient.get('/api/delivery/kpi/timeseries', { params: filters });
  return response.data.data;
}

export async function fetchDeliveryHourlyHeatmap(filters: DeliveryKpiFilters = {}): Promise<HeatmapData[]> {
  const response = await httpClient.get('/api/delivery/kpi/hourly-heatmap', { params: filters });
  return response.data.data;
}

