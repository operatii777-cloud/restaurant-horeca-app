import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { 
  ShoppingCart, Clock, CreditCard, Check, 
  ChefHat, Star, Heart
} from 'lucide-react';
import './KioskCustomerDisplayPage.css';

/**
 * KioskCustomerDisplayPage - Customer Display Screen (CDS)
 * Secondary display showing:
 * - Restaurant branding/logo
 * - Current order items
 * - Running total
 * - Promotional messages
 */
export const KioskCustomerDisplayPage = () => {
  const [order, setOrder] = useState(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const promotions = [
    { text: 'Bun venit! 🎉', subtext: 'Vă mulțumim pentru vizită!' },
    { text: 'Happy Hour! 🍺', subtext: 'Toate băuturile -20% între 17:00-19:00' },
    { text: 'Meniu Nou! 🍽️', subtext: 'Încercați noile preparate ale Chef-ului' },
    { text: 'Wi-Fi Gratuit 📶', subtext: 'Parolă: RestaurantGuest2024' },
    { text: 'Program Fidelitate ⭐', subtext: 'Colectează puncte la fiecare comandă!' },
  ];

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate promotions
  useEffect(() => {
    const promoTimer = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(promoTimer);
  }, []);

  // Listen for order updates (simulated)
  useEffect(() => {
    // In real implementation, this would listen to WebSocket or polling
    // For demo, show a sample order
    const demoOrder = {
      items: [
        { name: 'Burger Classic', quantity: 2, price: 35.00 },
        { name: 'Cartofi Prăjiți', quantity: 1, price: 12.00 },
        { name: 'Cola 0.5L', quantity: 2, price: 8.00 },
      ],
      subtotal: 98.00,
      discount: 0,
      total: 98.00
    };
    
    // Show demo order after 2 seconds
    const timeout = setTimeout(() => {
      setOrder(demoOrder);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="cds-page">
      {/* Header with branding */}
      <div className="cds-header">
        <div className="cds-logo">
          <ChefHat size={48} />
          <div className="cds-logo__text">
            <h1>Restaurant App</h1>
            <span>Fine Dining Experience</span>
          </div>
        </div>
        <div className="cds-time">
          <Clock size={24} />
          <span>{currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="cds-content">
        {/* Order Section */}
        {order ? (
          <div className="cds-order">
            <div className="cds-order__header">
              <ShoppingCart size={28} />
              <h2>Comanda Dvs.</h2>
            </div>
            
            <div className="cds-order__items">
              {order.items.map((item, idx) => (
                <div key={idx} className="cds-order__item">
                  <div className="cds-order__item-info">
                    <span className="cds-order__item-qty">{item.quantity}x</span>
                    <span className="cds-order__item-name">{item.name}</span>
                  </div>
                  <span className="cds-order__item-price">
                    {(item.price * item.quantity).toFixed(2)} RON
                  </span>
                </div>
              ))}
            </div>
            
            <div className="cds-order__footer">
              {order.discount > 0 && (
                <div className="cds-order__discount">
                  <span>Discount:</span>
                  <span>-{order.discount.toFixed(2)} RON</span>
                </div>
              )}
              <div className="cds-order__total">
                <span>TOTAL:</span>
                <span className="cds-order__total-value">{order.total.toFixed(2)} RON</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="cds-welcome">
            <Heart className="cds-welcome__icon" size={64} />
            <h2>Bine ați venit!</h2>
            <p>Suntem bucuroși să vă avem ca oaspete</p>
          </div>
        )}

        {/* Promotions Carousel */}
        <div className="cds-promo">
          <div className="cds-promo__content" key={promoIndex}>
            <h3>{promotions[promoIndex].text}</h3>
            <p>{promotions[promoIndex].subtext}</p>
          </div>
          <div className="cds-promo__dots">
            {promotions.map((_, idx) => (
              <span 
                key={idx} 
                className={`cds-promo__dot ${idx === promoIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cds-footer">
        <div className="cds-footer__info">
          <Star className="text-warning" size={20} fill="#fbbf24" />
          <span>Evaluați-ne pe Google!</span>
        </div>
        <div className="cds-footer__payment">
          <CreditCard size={20} />
          <span>Acceptăm: Card, Cash, Voucher</span>
        </div>
      </div>
    </div>
  );
};

export default KioskCustomerDisplayPage;

