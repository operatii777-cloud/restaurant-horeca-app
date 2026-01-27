/**
 * PHASE S12 - POS Customer Panel Component
 * 
 * Inputs for customer information (name, phone, email).
 */

import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import './PosCustomerPanel.css';

export function PosCustomerPanel() {
  const { customer, setCustomer } = usePosStore();
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');

  const handleSave = () => {
    setCustomer({
      name: name || undefined,
      phone: phone || undefined,
      email: email || undefined,
    });
  };

  const handleClear = () => {
    setName('');
    setPhone('');
    setEmail('');
    setCustomer(null);
  };

  return (
    <div className="pos-customer-panel">
      <h4 className="pos-customer-panel-title">Informații Client</h4>
      <div className="pos-customer-inputs">
        <div className="pos-customer-input-group">
          <label>Nume:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume client"
          />
        </div>
        <div className="pos-customer-input-group">
          <label>Telefon:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xx xxx xxx"
          />
        </div>
        <div className="pos-customer-input-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      </div>
      <div className="pos-customer-actions">
        <button className="pos-customer-btn pos-customer-btn--save" onClick={handleSave}>
          Salvează
        </button>
        <button className="pos-customer-btn pos-customer-btn--clear" onClick={handleClear}>
          Șterge
        </button>
      </div>
    </div>
  );
}

