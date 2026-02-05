// import { useTranslation } from '@/i18n/I18nContext';
import axios from 'axios';

// Create axios instance for HACCP API
const httpClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TypeScript Interfaces
export interface Process {
  id: number;
  name: string;
  description?: string;
  category: 'receiving' | 'storage' | 'preparation' | 'cooking' | 'serving';
  flow_chart_url?: string;
  created_at: string;
}

export interface CCP {
  id: number;
  process_id: number;
  ccp_number: string;
  hazard_type: 'biological' | 'chemical' | 'physical';
  hazard_description: string;
  control_measure: string;
  created_at: string;
}

export interface Limit {
  id: number;
  ccp_id: number;
  parameter_name: string;
  min_value: number;
  max_value: number;
  unit: string;
  target_value?: number;
  monitoring_frequency: string;
  created_at: string;
}

export interface Monitoring {
  id: number;
  ccp_id: number;
  monitored_at: string;
  monitored_by: number;
  parameter_name: string;
  measured_value: number;
  unit: string;
  status: 'ok' | 'warning' | 'critical';
  notes?: string;
  corrective_action_id?: number;
  ccp_number?: string;
  hazard_description?: string;
  process_name?: string;
}

export interface CorrectiveAction {
  id: number;
  ccp_id: number;
  monitoring_id?: number;
  action_taken: string;
  taken_by: number;
  taken_at: string;
  resolved: boolean;
  verification_notes?: string;
  created_at: string;
}

export interface DashboardKPIs {
  monitoringsToday: number;
  criticalAlerts: number;
  pendingActions: number;
  complianceRate: number;
}

export interface MonitoringFilters {
  ccp_id?: number;
  status?: 'ok' | 'warning' | 'critical';
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// API Service Class
class HACCPService {
  private baseUrl = '/api/compliance/haccp';

  async getAllProcesses(): Promise<Process[]> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/processes`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching HACCP processes:', error);
      throw error;
    }
  }

  async getCCPsByProcess(processId: number): Promise<CCP[]> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/processes/${processId}/ccps`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching CCPs:', error);
      throw error;
    }
  }

  async getLimitsByCCP(ccpId: number): Promise<Limit[]> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/ccps/${ccpId}/limits`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching limits:', error);
      throw error;
    }
  }

  async recordMonitoring(data: {
    ccp_id: number;
    parameter_name: string;
    measured_value: number;
    monitored_by?: number;
    notes?: string;
  }): Promise<Monitoring> {
    try {
      const response = await httpClient.post(`${this.baseUrl}/monitoring`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error recording monitoring:', error);
      throw error;
    }
  }

  async getMonitoring(filters?: MonitoringFilters): Promise<Monitoring[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.ccp_id) params.append('ccp_id', filters.ccp_id.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}/monitoring?${queryString}` : `${this.baseUrl}/monitoring`;

      const response = await httpClient.get(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching monitoring records:', error);
      throw error;
    }
  }

  async getDashboardKPIs(): Promise<DashboardKPIs> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/kpis`);
      return response.data?.data || {
        monitoringsToday: 0,
        criticalAlerts: 0,
        pendingActions: 0,
        complianceRate: 0
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  }

  async createCorrectiveAction(data: {
    ccp_id: number;
    monitoring_id?: number;
    action_taken: string;
    taken_by?: number;
  }): Promise<CorrectiveAction> {
    try {
      const response = await httpClient.post(`${this.baseUrl}/corrective-actions`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating corrective action:', error);
      throw error;
    }
  }

  async resolveCorrectiveAction(actionId: number, verificationNotes: string): Promise<CorrectiveAction> {
    try {
      const response = await httpClient.put(`${this.baseUrl}/corrective-actions/${actionId}/resolve`, {
        verification_notes: verificationNotes
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error resolving corrective action:', error);
      throw error;
    }
  }

  async getAllCorrectiveActions(filters?: {
    resolved?: boolean;
    ccp_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<CorrectiveAction[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.resolved !== undefined) params.append('resolved', filters.resolved ? '1' : '0');
      if (filters?.ccp_id) params.append('ccp_id', filters.ccp_id.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}/corrective-actions?${queryString}` : `${this.baseUrl}/corrective-actions`;

      const response = await httpClient.get(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching corrective actions:', error);
      throw error;
    }
  }
}

export const haccpService = new HACCPService();

