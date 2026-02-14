import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Customer Panel Component
 * 
 * Inputs for customer information (name, phone, email).
 */

import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import './PosCustomerPanel.css';

export function PosCustomerPanel() {
  const { t } = useTranslation();
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
      <h4 className="pos-customer-panel-title">{t('pos.customer.title')}</h4>
      <div className="pos-customer-inputs">
        <div className="pos-customer-input-group">
          <label>{t('pos.customer.name')}:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('pos.customer.name')}
          />
        </div>
        <div className="pos-customer-input-group">
          <label>{t('pos.customer.phone')}:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xx xxx xxx"
          />
        </div>
        <div className="pos-customer-input-group">
          <label>{t('pos.customer.email')}:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="[email protected]"
          />
        </div>
      </div>
      <div className="pos-customer-actions">
        <button className="pos-customer-btn pos-customer-btn--save" onClick={handleSave}>
          {t('actions.save')}
        </button>
        <button className="pos-customer-btn pos-customer-btn--clear" onClick={handleClear}>
          {t('actions.delete')}
        </button>
      </div>
    </div>
  );
}




