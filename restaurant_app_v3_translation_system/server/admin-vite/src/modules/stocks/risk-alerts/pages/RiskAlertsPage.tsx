// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
// AG Grid CSS imported globally with theme="legacy"
import './RiskAlertsPage.css';

interface RiskProduct {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  stock_ratio: string;
  total_cancellations: number;
  stock_related_cancellations: number;
  cancelled_value: number;
  risk_level: string;
}

interface RiskSummary {
  total_products_analyzed: number;
  high_risk_products: number;
  medium_risk_products: number;
  low_risk_products: number;
  total_cancelled_value: number;
  avg_stock_related_rate: string;
}

export const RiskAlertsPage: React.FC = () => {
  //   const { t } = useTranslation();
  const [products, setProducts] = useState<RiskProduct[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/stock-cancellation-correlation');
      if (!response.ok) throw new Error('Failed to load risk data');

      const data = await response.json();
      setProducts(data.products || []);
      setSummary(data.summary || null);

      // Generate recommendations
      const recs: string[] = [];
      if (data.summary?.high_risk_products > 0) {
        recs.push(`Urgent: ${data.summary.high_risk_products} produse cu risc ridicat necesită reabastecere imediată`);
      }
      if (data.summary?.total_cancelled_value > 1000) {
        recs.push(`Valoare pierdută semnificativă: ${data.summary.total_cancelled_value.toFixed(2)} RON din anulări`);
      }
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { field: 'name' as any, headerName: 'Produs', width: 200 },
    { field: 'category' as any, headerName: 'Categorie', width: 150 },
    { field: 'current_stock' as any, headerName: 'Stoc Actual', width: 120 },
    { field: 'min_stock' as any, headerName: 'Stoc Min', width: 120 },
    { field: 'stock_ratio' as any, headerName: 'Rate Stoc', width: 120 },
    { field: 'total_cancellations' as any, headerName: 'Anulări Totale', width: 150 },
    { field: 'stock_related_cancellations' as any, headerName: 'Anulări Stoc', width: 150 },
    { field: 'cancelled_value' as any, headerName: 'Valoare Pierdută', width: 150, valueFormatter: (params: any) => `${params.value.toFixed(2)} RON` },
    {
      field: 'risk_level' as any,
      headerName: 'Risc' as any,
      width: 120,
      cellRenderer: (params: any) => {
        const level = params.value;
        const colors: Record<string, string> = {
          'high': 'danger',
          'medium': 'warning',
          'low': 'success'
        };
        return <span className={`badge bg-${colors[level] || 'secondary'}`}>{level}</span>;
      }
    }
  ];

  return (
    <div className="risk-alerts-page">
      <div className="risk-alerts-page-header">
        <h1><i className="fas fa-exclamation-triangle me-2"></i>Stock & Risk Alerts</h1>
        <button className="btn btn-primary" onClick={loadRiskData}>
          <i className="fas fa-sync me-1"></i>"Reîncarcă"</button>
      </div>

      {summary && (
        <div className="card mb-4">
          <div className="card-header bg-danger text-white">
            <h5><i className="fas fa-chart-line me-2"></i>"sumar analiza"</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <p><strong>"produse cu risc ridicat"</strong> {summary.high_risk_products}</p>
              </div>
              <div className="col-md-3">
                <p><strong>Valoare Totală Pierdută:</strong> <span className="text-danger">{summary.total_cancelled_value.toFixed(2)} RON</span></p>
              </div>
              <div className="col-md-3">
                <p><strong>Produse Analizate:</strong> {summary.total_products_analyzed}</p>
              </div>
              <div className="col-md-3">
                <p><strong>Rate Medie Stoc:</strong> {summary.avg_stock_related_rate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="card mb-4">
          <div className="card-header bg-warning">
            <h5><i className="fas fa-lightbulb me-2"></i>"recomandari operationale"</h5>
          </div>
          <div className="card-body">
            <ul className="list-group">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="list-group-item">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-exclamation-circle me-2"></i>Produse cu Risc (Top 10)</h5>
        </div>
        <div className="card-body">
          <div className="ag-theme-alpine-dark risk-alerts-grid">
            <AgGridReact
              theme="legacy"
              rowData={products}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, filter: true }}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};






