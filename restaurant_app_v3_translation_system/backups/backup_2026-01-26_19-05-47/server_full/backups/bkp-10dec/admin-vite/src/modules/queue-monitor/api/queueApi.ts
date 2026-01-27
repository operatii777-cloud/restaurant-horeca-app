import { httpClient } from '@/shared/api/httpClient';

export interface QueueStats {
  processed: number;
  failed: number;
  queued: number;
  currentQueueSize: number;
  retried: number;
  avgProcessingTime?: number;
  todayTotal?: number;
  ordersByStatus?: {
    pending?: number;
    processing?: number;
    completed?: number;
    failed?: number;
  };
}

export interface QueueItem {
  id: string;
  orderId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  addedAt: number;
  retries?: number;
}

export interface FailedJob {
  jobId: string;
  orderId: number;
  error: string;
  failedAt: string;
  retries: number;
}

export interface QueueMonitorData {
  success: boolean;
  queueType: 'memory' | 'redis' | 'none';
  stats?: QueueStats;
  queueItems?: QueueItem[];
  failedJobs?: FailedJob[];
  message?: string;
}

/**
 * Fetch queue monitor data from /api/queue/monitor
 */
export async function fetchQueueMonitor(): Promise<QueueMonitorData> {
  const response = await httpClient.get<QueueMonitorData>('/api/queue/monitor');
  return response.data;
}

/**
 * Fetch queue stats from /api/queue/stats
 */
export async function fetchQueueStats(): Promise<{ success: boolean; queueType: string; stats?: QueueStats }> {
  const response = await httpClient.get<{ success: boolean; queueType: string; stats?: QueueStats }>('/api/queue/stats');
  return response.data;
}

