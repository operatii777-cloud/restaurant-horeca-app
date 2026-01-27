import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import './WelcomePage.css';

export function WelcomePage() {
  const [categories, setCategories] = useState<Array<{ name: string; productCount: number }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await httpClient.get('/api/catalog/products');
      if (response.data && Array.isArray(response.data)) {
        // Group by category and count products
        const categoryMap = new Map<string, number>();
        response.data.forEach((product: any) => {
          const cat = product.category || 'Fără categorie';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
        const cats = Array.from(categoryMap.entries()).map(([name, productCount]) => ({
          name,
          productCount
        })).sort((a, b) => b.productCount - a.productCount).slice(0, 6);
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const features = [
    {
      icon: '📊',
      title: 'Dashboard',
      description: 'Vizualizează KPI-uri, vânzări și performanță',
      link: '/dashboard',
      color: 'primary'
    },
    {
      icon: '🍽️',
      title: 'Meniu',
      description: 'Gestionează produse, categorii și prețuri',
      link: '/menu',
      color: 'success'
    },
    {
      icon: '📝',
      title: 'Rețete',
      description: 'Creează și editează rețete pentru produse',
      link: '/recipes',
      color: 'info'
    },
    {
      icon: '📦',
      title: 'Stocuri',
      description: 'Gestionează inventarul și ingredientele',
      link: '/stocks',
      color: 'warning'
    },
    {
      icon: '🛒',
      title: 'Comenzi',
      description: 'Urmărește și gestionează comenzile',
      link: '/orders',
      color: 'danger'
    },
    {
      icon: '📅',
      title: 'Rezervări',
      description: 'Gestionează rezervările clienților',
      link: '/reservations',
      color: 'secondary'
    },
    {
      icon: '💰',
      title: 'Rapoarte',
      description: 'Generează rapoarte financiare și de vânzări',
      link: '/reports',
      color: 'primary'
    },
    {
      icon: '⚙️',
      title: 'Setări',
      description: 'Configurează aplicația și utilizatorii',
      link: '/settings',
      color: 'warning'
    },
    {
      icon: '📚',
      title: 'Manual Instrucțiuni',
      description: 'Ghid complet pentru utilizarea aplicației',
      link: '/settings/manual-instructiuni',
      color: 'info'
    }
  ];

  return (
    <div className="welcome-page">
      <PageHeader
        title="Bun venit în Restaurant App"
        description="Sistem complet de gestionare pentru restaurante"
      />

      <div className="welcome-hero mb-5">
        <div className="text-center">
          <h1 className="display-4 mb-3">🍽️ Restaurant App</h1>
          <p className="lead text-muted mb-4">Soluție completă pentru gestionarea restaurantului tău</p>
          <div className="d-flex gap-3 justify-content-center">
            <Button variant="primary" size="lg" as={Link} to="/dashboard">
              <i className="fas fa-tachometer-alt me-2"></i>Accesează Dashboard</Button>
            <Button variant="outline-primary" size="lg" as={Link} to="/menu">
              <i className="fas fa-utensils me-2"></i>Gestionează Meniul</Button>
          </div>
        </div>
      </div>

      <div className="welcome-features">
        <h2 className="text-center mb-4">Funcționalități Principale</h2>
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={3}>
              <Card className="h-100 feature-card shadow-sm">
                <Card.Body className="text-center">
                  <div className="feature-icon mb-3" style={{ fontSize: '3rem' }}>
                    {feature.icon}
                  </div>
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text className="text-muted">{feature.description}</Card.Text>
                  <Button
                    variant={feature.color as 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary'}
                    as={Link}
                    to={feature.link}
                    className="mt-auto"
                  >Accesează<i className="fas fa-arrow-right ms-2"></i>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Quick Catalog Section */}
      <div className="welcome-quick-catalog mt-5">
        <h2 className="text-center mb-4">📦 Catalog Rapid</h2>
        {loadingCategories ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Se încarcă categoriile...</p>
          </div>
        ) : categories.length > 0 ? (
          <Row className="g-3">
            {categories.map((category, index) => (
              <Col key={index} md={4} lg={2}>
                <Card className="h-100 category-card shadow-sm" style={{ cursor: 'pointer' }}>
                  <Card.Body className="text-center">
                    <div className="category-icon mb-2" style={{ fontSize: '2rem' }}>
                      📁
                    </div>
                    <Card.Title className="h6 mb-1">{category.name}</Card.Title>
                    <Card.Text className="text-muted small mb-0">
                      {category.productCount} {category.productCount === 1 ? 'produs' : 'produse'}
                    </Card.Text>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={Link}
                      to={`/menu?category=${encodeURIComponent(category.name)}`}
                      className="mt-2"
                    >
                      Vezi produse
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4 text-muted">
            <p>Nu există categorii disponibile.</p>
            <Button variant="primary" as={Link} to="/menu">
              <i className="fas fa-plus me-2"></i>Adaugă produse</Button>
          </div>
        )}
      </div>

      <div className="welcome-stats mt-5">
        <Row className="g-4">
          <Col md={4}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div className="display-4 mb-2">🚀</div>
                <h5>Performanță</h5>
                <p className="text-muted">Sistem optimizat pentru viteză și eficiență</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div className="display-4 mb-2">🔒</div>
                <h5>Securitate</h5>
                <p className="text-muted">Date protejate și acces controlat</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div className="display-4 mb-2">📱</div>
                <h5>Accesibil</h5>
                <p className="text-muted">Funcționează pe orice dispozitiv</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}




