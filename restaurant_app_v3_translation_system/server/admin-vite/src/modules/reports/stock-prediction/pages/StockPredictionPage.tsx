// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Alert, Spinner, Form, Badge } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { stockPredictionApi, type StockPrediction } from '../api/stockPredictionApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './StockPredictionPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const StockPredictionPage = () => {
  //   const { t } = useTranslation();
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [daysAhead, setDaysAhead] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockPredictionApi.getPrediction(daysAhead);
      setPredictions(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea predicției:', err);
      setError(err?.response?.data?.error || err?.message || 'Eroare la încărcarea predicției');
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    void loadPrediction();
  }, [loadPrediction]);

  const chartData = {
    labels: predictions.slice(0, 20).map((p) => p.ingredient_name),
    datasets: [
      {
        label: 'Stoc Curent',
        data: predictions.slice(0, 20).map((p) => p.current_stock),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Consum Predicție',
        data: predictions.slice(0, 20).map((p) => p.predicted_consumption),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  const getRecommendationBadge = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('urgent')) {
      return <Badge bg="danger">URGENT</Badge>;
    }
    if (recommendation.toLowerCase().includes('recomandat')) {
      return <Badge bg="warning">Recomandat</Badge>;
    }
    return <Badge bg="success">OK</Badge>;
  };

  return (
    <div className="stock-prediction-page" data-page-ready="true">
      <div className="page-header">
        <div>
          <h1>predicție stoc</h1>
          <p>predicție stocuri bazată pe analiza ABC și viteză</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void loadPrediction()}>
          ↻ Reîmprospătare
        </button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filtre */}
      <Card className="mt-4 mb-4">
        <Card.Body>
          <div className="row align-items-end">
            <div className="col-md-4">
              <Form.Label>zile în viitor pentru predicție</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="90"
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value) || 14)}
              />
            </div>
            <div className="col-md-4">
              <Button variant="primary" onClick={() => void loadPrediction()} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>se calculează...&lpar;</>
                ) : (
                  <>
                    <i className="fas fa-bolt me-2"></i>rulează predicția</>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">se calculează predicția...</p>
        </div>
      )}

      {!loading && predictions.length > 0 && (
        <>
          {/* Grafic */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Grafic Predicție (Top 20 Ingrediente)</h6>
            </Card.Header>
            <Card.Body>
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Card.Body>
          </Card>

          {/* Tabel Predicții */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">predicții detaliate</h6>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Unit</th>
                    <th className="text-end">Stoc Curent</th>
                    <th className="text-end">Stoc Minim</th>
                    <th className="text-end">consum predicție</th>
                    <th className="text-center">zile până la minim</th>
                    <th className="text-center">zile până la zero</th>
                    <th>Recomandare</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred) => (
                    <tr key={pred.ingredient_id}>
                      <td>{pred.ingredient_name}</td>
                      <td>{pred.unit}</td>
                      <td className="text-end">{pred.current_stock.toFixed(2)}</td>
                      <td className="text-end">{pred.min_stock.toFixed(2)}</td>
                      <td className="text-end">{pred.predicted_consumption.toFixed(2)}</td>
                      <td className="text-center">
                        {pred.predicted_days_until_min !== null ? (
                          <Badge bg={pred.predicted_days_until_min < 7 ? 'danger' : pred.predicted_days_until_min < 14 ? 'warning' : 'success'}>
                            {pred.predicted_days_until_min}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        {pred.predicted_days_until_zero !== null ? (
                          <Badge bg={pred.predicted_days_until_zero < 7 ? 'danger' : pred.predicted_days_until_zero < 14 ? 'warning' : 'success'}>
                            {pred.predicted_days_until_zero}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{getRecommendationBadge(pred.recommendation)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}

      {!loading && predictions.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-chart-line fa-3x mb-3 opacity-50"></i>
          <p>nu există predicții disponibile, rulează predicția</p>
        </div>
      )}
    </div>
  );
};




