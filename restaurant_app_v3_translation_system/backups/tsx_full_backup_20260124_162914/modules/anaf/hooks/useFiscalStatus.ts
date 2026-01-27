/**
 * FAZA 1.6 - useFiscalStatus Hook
 * 
 * React hook for getting fiscal status of an order
 */

import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchFiscalStatus(orderId: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/pos/fiscal/status/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch fiscal status: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export function useFiscalStatus(orderId: number | null) {
  return useQuery({
    queryKey: ['fiscal', 'status', orderId],
    queryFn: () => fetchFiscalStatus(orderId!),
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!orderId && orderId > 0,
    staleTime: 2000, // Consider data stale after 2 seconds
  });
}

