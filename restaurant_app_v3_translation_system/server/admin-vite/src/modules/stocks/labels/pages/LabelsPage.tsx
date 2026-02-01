// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { labelsApi } from '../api/labelsApi';
import type { LabelProduct } from '../api/labelsApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './LabelsPage.css';

type LabelTemplate = 'standard' | 'minimal' | 'premium';

export const LabelsPage = () => {
  //   const { t } = useTranslation();
  const [products, setProducts] = useState<LabelProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LabelProduct | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate>('standard');
  const [batchCount, setBatchCount] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await labelsApi.fetchProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea produselor:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const generateBarcode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newBarcode = `2025"Timestamp""Random"`;
    setBarcode(newBarcode);
  }, []);

  useEffect(() => {
    generateBarcode();
  }, [generateBarcode]);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === Number(productId));
    if (product) {
      setSelectedProduct(product);
      setProductName(product.name);
      setProductPrice(product.price.toString());
      setBarcode(product.barcode || '');
    }
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '', 'width=600,height=400');
    if (!printWindow) return;

    const labelContent = document.getElementById('labelTemplate')?.outerHTML || '';

    printWindow.document.write(`
      <html>
      <head>
        <title>"eticheta produs"</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .label-template { 
            border: 1px solid #333; 
            padding: 20px; 
            text-align: center; 
            max-width: 400px;
            margin: 20px auto;
            background: white;
          }
          .barcode { 
            font-family: 'Courier New', monospace; 
            font-size: 2rem; 
            margin: 20px 0; 
            letter-spacing: 2px;
          }
          .price { 
            font-size: 2rem; 
            font-weight: 700; 
            color: #667eea; 
            margin: 15px 0;
          }
          h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        ${labelContent}
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    if (!productName || !productPrice) {
      setFeedback({ type: 'error', message: 'Completați numele și prețul produsului!' });
      return;
    }

    try {
      await labelsApi.generateLabel({
        product_id: selectedProduct?.id,
        product_name: productName,
        price: parseFloat(productPrice),
        barcode: barcode || undefined,
        additional_info: additionalInfo || undefined,
      });
      setFeedback({ type: 'success', message: 'PDF generat cu succes! (Funcționalitate în dezvoltare)' });
    } catch (err: any) {
      console.error('❌ Eroare la generare PDF:', err);
      setFeedback({ type: 'error', message: 'Eroare la generare PDF: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const handlePrintBatch = async () => {
    if (!selectedProduct) {
      setFeedback({ type: 'error', message: 'Selectați un produs!' });
      return;
    }

    try {
      const response = await labelsApi.printBatch(selectedProduct.id, batchCount);
      setFeedback({ type: 'success', message: response.message });
      handlePrintLabel(); // Deschide fereastra de print
    } catch (err: any) {
      console.error('❌ Eroare la imprimare lot:', err);
      setFeedback({ type: 'error', message: 'Eroare la imprimare lot: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const getTemplateStyles = (template: LabelTemplate) => {
    switch (template) {
      case 'minimal':
        return {
          border: '1px solid #ccc',
          padding: '15px',
          background: 'white',
        };
      case 'premium':
        return {
          border: '3px double gold',
          padding: '25px',
          background: 'linear-gradient(135deg, #fff, #f9f9f9)',
        };
      default:
        return {
          border: '1px solid #333',
          padding: '20px',
          background: 'white',
        };
    }
  };

  return (
    <div className="labels-page">
      <PageHeader
        title="🏷️ Etichete Produse"
        description="Generare etichete cu cod de bare pentru produse"
      />

      {feedback && (
        <InlineAlert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
      {error && <InlineAlert type="error" message={error} onClose={() => setError(null)} />}

      <div className="row mt-4">
        {/* Left: Configuration */}
        <div className="col-md-6">
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0"><i className="fas fa-cog me-2"></i>Configurare etichetă</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Produs *</Form.Label>
                  <Form.Select
                    value={selectedProduct?.id || ''}
                    onChange={(e) => handleProductSelect(e.target.value)}
                  >
                    <option value="">Selectează produs</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.price.toFixed(2)} RON
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nume Produs</Form.Label>
                  <Form.Control
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="nume produs"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Preț (RON)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cod de bare</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="generat automat"
                      readOnly
                    />
                    <Button variant="secondary" onClick={generateBarcode}>
                      <i className="fas fa-sync-alt"></i>Generează</Button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Informații Suplimentare</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="ex valabil pana"
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {/* Template Selection */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0"><i className="fas fa-th me-2"></i>Șabloane</h5>
            </Card.Header>
            <Card.Body>
              <div className="template-grid">
                <div
                  className={`template-card ${currentTemplate === 'standard' ? 'active' : ''}`}
                  onClick={() => setCurrentTemplate('standard')}
                >
                  <i className="fas fa-file-alt fa-3x mb-2"></i>
                  <p><strong>Standard</strong></p>
                  <small>Etichetă clasică</small>
                </div>
                <div
                  className={`template-card ${currentTemplate === 'minimal' ? 'active' : ''}`}
                  onClick={() => setCurrentTemplate('minimal')}
                >
                  <i className="fas fa-minus-square fa-3x mb-2"></i>
                  <p><strong>Minimal</strong></p>
                  <small>Design simplu</small>
                </div>
                <div
                  className={`template-card ${currentTemplate === 'premium' ? 'active' : ''}`}
                  onClick={() => setCurrentTemplate('premium')}
                >
                  <i className="fas fa-star fa-3x mb-2"></i>
                  <p><strong>Premium</strong></p>
                  <small>Design elegant</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="col-md-6">
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="fas fa-eye me-2"></i>Previzualizare</h5>
              <div className="d-flex gap-2">
                <Button variant="success" onClick={handlePrintLabel}>
                  <i className="fas fa-print me-2"></i>Imprimă</Button>
                <Button variant="primary" onClick={handleDownloadPDF}>
                  <i className="fas fa-download me-2"></i>Descarcă PDF</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="label-preview">
                <div
                  id="labelTemplate"
                  className="label-template"
                  style={getTemplateStyles(currentTemplate)}
                >
                  <h3>{productName || 'Nume Produs'}</h3>
                  <div className="barcode">*{barcode || '123456789'}*</div>
                  <div className="price">
                    {productPrice ? `${parseFloat(productPrice).toFixed(2)} RON` : '0.00 RON'}
                  </div>
                  {additionalInfo && (
                    <p className="text-muted small mb-0">{additionalInfo}</p>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Batch Printing */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0"><i className="fas fa-layer-group me-2"></i>Imprimare în lot</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Număr etichete</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                />
              </Form.Group>
              <Button variant="warning" onClick={handlePrintBatch} className="w-100">
                <i className="fas fa-print me-2"></i>Imprimă în lot</Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};




