/**
 * S17.H - Delivery KPI Hooks
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchDeliveryOverview,
  fetchDeliveryByCourier,
  fetchDeliveryTimeseries,
  fetchDeliveryHourlyHeatmap,
  DeliveryKpiFilters
} from '../api/deliveryKpi.api';

export function useDeliveryOverview(filters: DeliveryKpiFilters = {}) {
  return useQuery({
    queryKey: ['delivery-kpi', 'overview', filters],
    queryFn: () => fetchDeliveryOverview(filters),
    staleTime: 30000 // 30 seconds
  });
}

export function useDeliveryByCourier(filters: DeliveryKpiFilters = {}) {
  return useQuery({
    queryKey: ['delivery-kpi', 'by-courier', filters],
    queryFn: () => fetchDeliveryByCourier(filters),
    staleTime: 30000
  });
}

export function useDeliveryTimeseries(filters: DeliveryKpiFilters = {}) {
  return useQuery({
    queryKey: ['delivery-kpi', 'timeseries', filters],
    queryFn: () => fetchDeliveryTimeseries(filters),
    staleTime: 30000
  });
}

export function useDeliveryHeatmap(filters: DeliveryKpiFilters = {}) {
  return useQuery({
    queryKey: ['delivery-kpi', 'heatmap', filters],
    queryFn: () => fetchDeliveryHourlyHeatmap(filters),
    staleTime: 30000
  });
}

