// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Address Step (Step 1)
 * Form for customer details and delivery address
 */

import type { DeliveryAddressData } from "../../api/types";
import { useState } from 'react';


interface DeliveryAddressStepProps {
  initialData?: Partial<DeliveryAddressData>;
  onSubmit: (data: DeliveryAddressData) => void;
  onBack: () => void;
}

export function DeliveryAddressStep({ initialData, onSubmit, onBack }: DeliveryAddressStepProps) {
//   const { t } = useTranslation();
  const [formData, setFormData] = useState<DeliveryAddressData>({
    customerName: initialData?.customerName || '',
    customerPhone: initialData?.customerPhone || '',
    street: initialData?.street || '',
    number: initialData?.number || '',
    block: initialData?.block || '',
    stairs: initialData?.stairs || '',
    floor: initialData?.floor || '',
    apartment: initialData?.apartment || '',
    intercom: initialData?.intercom || '',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddressData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryAddressData, string>> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Numele este obligatoriu';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefonul este obligatoriu';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Format telefon invalid';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Strada este obligatorie';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Numărul este obligatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: keyof DeliveryAddressData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-map-marker-alt mr-2 text-[#FF6B35]"></i>"date client si adresa de livrare"</h3>

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"nume complet"<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.customerName}
          onChange={(e) => updateField('customerName', e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            errors.customerName ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]'
          }`}
          placeholder="ex ion popescu"
        />
        {errors.customerName && (
          <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
        )}
      </div>

      {/* Customer Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Telefon <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.customerPhone}
          onChange={(e) => updateField('customerPhone', e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            errors.customerPhone ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]'
          }`}
          placeholder="Ex: 0712345678"
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
        )}
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"Stradă"<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => updateField('street', e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            errors.street ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]'
          }`}
          placeholder="Ex: Str. Victoriei"
        />
        {errors.street && (
          <p className="text-red-500 text-sm mt-1">{errors.street}</p>
        )}
      </div>

      {/* Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"Număr"<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.number}
          onChange={(e) => updateField('number', e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            errors.number ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]'
          }`}
          placeholder="Ex: 10"
        />
        {errors.number && (
          <p className="text-red-500 text-sm mt-1">{errors.number}</p>
        )}
      </div>

      {/* Optional fields in a grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bloc</label>
          <input
            type="text"
            value={formData.block || ''}
            onChange={(e) => updateField('block', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
            placeholder="Ex: A1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Scara</label>
          <input
            type="text"
            value={formData.stairs || ''}
            onChange={(e) => updateField('stairs', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
            placeholder="Ex: 1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Etaj</label>
          <input
            type="text"
            value={formData.floor || ''}
            onChange={(e) => updateField('floor', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
            placeholder="Ex: 2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Apartament</label>
          <input
            type="text"
            value={formData.apartment || ''}
            onChange={(e) => updateField('apartment', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
            placeholder="Ex: 5"
          />
        </div>
      </div>

      {/* Intercom */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Interfon</label>
        <input
          type="text"
          value={formData.intercom || ''}
          onChange={(e) => updateField('intercom', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
          placeholder="Ex: 12A"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"observatii pentru curier"</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
          placeholder="ex clopotel la usa din stanga lasati la usa"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>"inapoi la produse"</button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all"
        >"continua catre plata"<i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </form>
  );
}





