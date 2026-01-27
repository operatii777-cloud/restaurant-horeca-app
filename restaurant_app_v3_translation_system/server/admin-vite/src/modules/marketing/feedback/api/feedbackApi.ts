// import { useTranslation } from '@/i18n/I18nContext';
import { httpClient } from '@/shared/api/httpClient';

export interface Feedback {
  id: number;
  order_id?: number;
  customer_token?: string;
  rating: number;
  comment?: string;
  timestamp: string;
  category?: string;
}

export interface FeedbackStats {
  total_feedback: number;
  avg_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
  }[];
}

export interface FeedbackRecentResponse {
  success: boolean;
  recentFeedback: Feedback[];
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const feedbackApi = {
  // Listă feedback-uri
  async getAll(params?: { limit?: number; rating?: number; period?: string }): Promise<Feedback[]> {
    const response = await httpClient.get<Feedback[]>('/api/feedback', { params });
    return response.data;
  },

  // Statistici feedback
  async getStats(): Promise<FeedbackStats> {
    const response = await httpClient.get<FeedbackStats>('/api/feedback/stats');
    return response.data;
  },

  // Feedback recent cu statistici complete
  async getRecent(params?: { limit?: number; rating?: number; period?: string }): Promise<FeedbackRecentResponse> {
    const response = await httpClient.get<FeedbackRecentResponse>('/api/feedback/recent', {
      params: params || { limit: 100, period: 'overall' },
    });
    return response.data;
  },

  // Feedback pentru dashboard
  async getDashboard(): Promise<any> {
    const response = await httpClient.get('/api/dashboard/feedback');
    return response.data;
  },
};

