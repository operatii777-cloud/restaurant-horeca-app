// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Track Order Page
 * Public page for tracking delivery orders
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '@/shared/api/httpClient';
import { TrackOrderMap } from '../components/TrackOrderMap';

interface OrderStatus {
  id: number;
  order_number?: string;
  type: string;
  status: string;
  total: number;
  payment_method?: string;
  is_paid: boolean;
  paid_timestamp?: string;
  created_at: string;
  delivery_address?: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  courier_id?: number | null;
}

export function TrackOrderPage() {
//   const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState<string>(searchParams.ge[orderId] || '');
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    if (!id || !/^\d+$/.test(id)) {
      setError('ID comandă invalid');
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get(`/api/orders/"Id"`);
      if (response.data && response.data.id) {
        setOrder(response.data);
        setSearchParams({ orderId: id });
      } else {
        setError('Comandă negăsită');
        setOrder(null);
      }
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError('Eroare la încărcarea comenzii. Verifică ID-ul și încearcă din nou.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId) {
      loadOrder(orderId);
    }
  };

  const handleDownloadPDF = () => {
    if (order) {
      window.open(`/api/orders/${order.id}/receipt?lang=ro`, '_blank');
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'În așteptare',
      'CONFIRMED': 'Confirmată',
      'PREPARING': 'În pregătire',
      'READY': 'Gata pentru livrare',
      'ASSIGNED': 'Preluată de curier',
      'IN_TRANSIT': 'Curier în drum',
      'DELIVERED': 'Livrată',
      'CANCELLED': 'Anulată'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string): string => {
    const iconMap: Record<string, string> = {
      'PENDING': '⏳',
      'CONFIRMED': '✅',
      'PREPARING': '👨‍🍳',
      'READY': '📦',
      'ASSIGNED': '🚴',
      'IN_TRANSIT': '🚚',
      'DELIVERED': '✓',
      'CANCELLED': '❌'
    };
    return iconMap[status] || '❓';
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-300',
      'PREPARING': 'bg-orange-100 text-orange-800 border-orange-300',
      'READY': 'bg-purple-100 text-purple-800 border-purple-300',
      'ASSIGNED': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'IN_TRANSIT': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <i className="fas fa-search-location mr-2 text-[#FF6B35]"></i>"urmareste comanda ta"</h1>
          <p className="text-gray-600">"introdu numarul comenzii pentru a vedea statusul"</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-[15px] p-6 shadow-lg mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Introdu ID-ul comenzii (ex: 123)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
            />
            <button
              type="submit"
              disabled={loading || !orderId}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                loading || !orderId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>"Caută..."</>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Caută
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-800">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-[15px] p-6 shadow-lg space-y-6">
            {/* Order Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  Comandă #{order.id}
                </h2>
                <span className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                </span>
              </div>
              {order.order_number && (
                <p className="text-sm text-gray-600">Număr comandă: {order.order_number}</p>
              )}
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Total</label>
                <div className="text-xl font-bold text-[#FF6B35]">{order.total.toFixed(2)} RON</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">"metoda plata"</label>
                <div className="text-lg font-semibold text-gray-800">
                  {order.payment_method === 'cash' ? (
                    <>
                      <i className="fas fa-money-bill-wave mr-1"></i>
                      Cash {order.is_paid ? '(Achitată)' : '(Se achită la livrare)'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card mr-1"></i>
                      Card {order.is_paid ? '(Achitată)' : '(Neachitată)'}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Data comandă</label>
                <div className="text-gray-800">
                  {new Date(order.created_at).toLocaleString('ro-RO')}
                </div>
              </div>
              {order.paid_timestamp && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">"achitata la"</label>
                  <div className="text-gray-800">
                    {new Date(order.paid_timestamp).toLocaleString('ro-RO')}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info */}
            {order.customer_name && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Date client</h3>
                <div className="space-y-1 text-gray-700">
                  <div><i className="fas fa-user mr-2"></i>{order.customer_name}</div>
                  {order.customer_phone && (
                    <div><i className="fas fa-phone mr-2"></i>{order.customer_phone}</div>
                  )}
                  {order.delivery_address && (
                    <div><i className="fas fa-map-marker-alt mr-2"></i>{order.delivery_address}</div>
                  )}
                </div>
              </div>
            )}

            {/* FAZA 2.B - Live Tracking Map */}
            {order.type === "Delivery" && (order.delivery_lat && order.delivery_lng || order.delivery_address) && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">"urmarire live"</h3>
                <TrackOrderMap
                  orderId={order.id}
                  deliveryAddress={order.delivery_address}
                  deliveryLat={order.delivery_lat}
                  deliveryLng={order.delivery_lng}
                  courierId={order.courier_id}
                />
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-4 flex gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all"
              >
                <i className="fas fa-file-pdf mr-2"></i>"descarca dovada pdf"</button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !loading && !error && (
          <div className="bg-white rounded-[15px] p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600">"introdu id ul comenzii pentru a vedea statusul"</p>
          </div>
        )}
      </div>
    </div>
  );
}




