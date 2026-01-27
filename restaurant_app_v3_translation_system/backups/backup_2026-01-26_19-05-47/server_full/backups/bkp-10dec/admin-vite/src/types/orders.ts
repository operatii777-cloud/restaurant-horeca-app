export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'delivered' | 'paid' | 'cancelled';
export type OrderType = 'here' | 'takeout' | 'delivery';

export interface OrderCustomization {
  id?: number | string;
  option_name: string;
  option_name_en?: string | null;
  extra_price: number;
}

export interface OrderItem {
  itemId: string;
  productId: number | null;
  name: string | null;
  quantity: number;
  price: number;
  finalPrice: number;
  isFree: boolean;
  status: OrderStatus;
  station: 'kitchen' | 'bar' | null;
  customizations: OrderCustomization[];
  isDailyMenu?: boolean;
  isPackaging?: boolean;
}

export interface Order {
  id: number;
  table_number: number | null;
  client_identifier: string | null;
  type: OrderType;
  timestamp: string;
  status: OrderStatus;
  is_paid: number;
  paid_timestamp: string | null;
  completed_timestamp: string | null;
  delivered_timestamp: string | null;
  cancelled_timestamp: string | null;
  cancelled_reason: string | null;
  total: number;
  food_notes: string | null;
  drink_notes: string | null;
  general_notes: string | null;
  items: OrderItem[];
}

export interface OrderSummary {
  totalOrders: number;
  activeOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalCancelledValue: number;
}

export interface OrderFilter {
  status: 'all' | 'paid' | 'unpaid' | 'cancelled';
  startDate: string | null;
  endDate: string | null;
}

export interface OrderVisit {
  key: string;
  tableNumber: number | null;
  clientIdentifier: string | null;
  orders: Order[];
  isPaid: boolean;
  totalAmount: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  allItems: OrderItem[];
  notes: {
    food?: string | null;
    drink?: string | null;
    general?: string | null;
  };
}

export interface CancelledOrderItem {
  itemId: string;
  productId: number | null;
  name: string;
  quantity: number;
  customizations: OrderCustomization[];
  station: 'kitchen' | 'bar' | null;
}

export interface CancelledOrder {
  id: number;
  table_number: number | null;
  client_identifier: string | null;
  type: OrderType;
  timestamp: string;
  status: 'cancelled';
  cancelled_timestamp: string;
  cancelled_reason: string | null;
  total: number;
  items: CancelledOrderItem[];
}

export interface CancellationGeneralStats {
  total_orders: number;
  cancelled_orders: number;
  cancellation_rate: number;
  cancelled_value: number;
  avg_cancel_time_minutes: number;
}

export interface CancellationHourlyBucket {
  hour: number;
  count: number;
}

export interface CancellationReasonBucket {
  reason: string | null;
  count: number;
}

export interface CancellationTrendPoint {
  date: string;
  count: number;
}

export interface CancellationAnalytics {
  general_stats: CancellationGeneralStats;
  hourly_distribution: CancellationHourlyBucket[];
  cancellation_reasons: CancellationReasonBucket[];
  top_cancelled_products: { name: string; cancellation_count: number }[];
  trends: CancellationTrendPoint[];
  period: string;
  timestamp: string;
}

export interface CancellationPredictionAlert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  [key: string]: unknown;
}

export interface CancellationPredictionResult {
  analysis_period: {
    start: string;
    end: string;
    days_analyzed: number;
  };
  trend_analysis: {
    current_rate: string;
    previous_rate: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    change_percentage: string;
    trend_description: string;
  };
  predictions: {
    next_week_rate: string;
    confidence: 'high' | 'medium' | 'low';
  };
  alerts: CancellationPredictionAlert[];
  recommendations: string[];
}

export interface StockCancellationCorrelationItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  total_cancellations: number;
  stock_related_cancellations: number;
  cancelled_value: number;
  stock_ratio: number;
  stock_related_rate: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendation: string | null;
}

export interface StockCancellationCorrelation {
  generated_at: string;
  items: StockCancellationCorrelationItem[];
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  total_quantity: number;
  total_value: number;
}

export interface TopProductsResponse {
  products: TopProduct[];
  stats: {
    total_quantity: number;
    total_value: number;
  };
}

export interface OrdersArchiveStats {
  activeOrders: number;
  archivedOrders: number;
  oldestArchive: string | null;
  totalSize: number;
}

