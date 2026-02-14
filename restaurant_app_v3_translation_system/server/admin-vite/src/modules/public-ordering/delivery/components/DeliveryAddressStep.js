"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Address Step (Step 1)
 * Form for customer details and delivery address
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAddressStep = DeliveryAddressStep;
var react_1 = require("react");
function DeliveryAddressStep(_a) {
    var initialData = _a.initialData, onSubmit = _a.onSubmit, onBack = _a.onBack;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({
        customerName: (initialData === null || initialData === void 0 ? void 0 : initialData.customerName) || '',
        customerPhone: (initialData === null || initialData === void 0 ? void 0 : initialData.customerPhone) || '',
        street: (initialData === null || initialData === void 0 ? void 0 : initialData.street) || '',
        number: (initialData === null || initialData === void 0 ? void 0 : initialData.number) || '',
        block: (initialData === null || initialData === void 0 ? void 0 : initialData.block) || '',
        stairs: (initialData === null || initialData === void 0 ? void 0 : initialData.stairs) || '',
        floor: (initialData === null || initialData === void 0 ? void 0 : initialData.floor) || '',
        apartment: (initialData === null || initialData === void 0 ? void 0 : initialData.apartment) || '',
        intercom: (initialData === null || initialData === void 0 ? void 0 : initialData.intercom) || '',
        notes: (initialData === null || initialData === void 0 ? void 0 : initialData.notes) || ''
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)({}), errors = _c[0], setErrors = _c[1];
    var validate = function () {
        var newErrors = {};
        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Numele este obligatoriu';
        }
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Telefonul este obligatoriu';
        }
        else if (!/^[0-9+\-\s()]+$/.test(formData.customerPhone)) {
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
    var handleSubmit = function (e) {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };
    var updateField = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[field] = undefined, _a)));
            });
        }
    };
    return (<form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-map-marker-alt mr-2 text-[#FF6B35]"></i>"date client si adresa de livrare"</h3>

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"nume complet"<span className="text-red-500">*</span>
        </label>
        <input type="text" value={formData.customerName} onChange={function (e) { return updateField('customerName', e.target.value); }} className={"w-full px-4 py-2 border-2 rounded-lg focus:outline-none ".concat(errors.customerName ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]')} placeholder="ex ion popescu"/>
        {errors.customerName && (<p className="text-red-500 text-sm mt-1">{errors.customerName}</p>)}
      </div>

      {/* Customer Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Telefon <span className="text-red-500">*</span>
        </label>
        <input type="tel" value={formData.customerPhone} onChange={function (e) { return updateField('customerPhone', e.target.value); }} className={"w-full px-4 py-2 border-2 rounded-lg focus:outline-none ".concat(errors.customerPhone ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]')} placeholder="Ex: 0712345678"/>
        {errors.customerPhone && (<p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>)}
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"Stradă"<span className="text-red-500">*</span>
        </label>
        <input type="text" value={formData.street} onChange={function (e) { return updateField('street', e.target.value); }} className={"w-full px-4 py-2 border-2 rounded-lg focus:outline-none ".concat(errors.street ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]')} placeholder="Ex: Str. Victoriei"/>
        {errors.street && (<p className="text-red-500 text-sm mt-1">{errors.street}</p>)}
      </div>

      {/* Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"Număr"<span className="text-red-500">*</span>
        </label>
        <input type="text" value={formData.number} onChange={function (e) { return updateField('number', e.target.value); }} className={"w-full px-4 py-2 border-2 rounded-lg focus:outline-none ".concat(errors.number ? 'border-red-500' : 'border-gray-300 focus:border-[#FF6B35]')} placeholder="Ex: 10"/>
        {errors.number && (<p className="text-red-500 text-sm mt-1">{errors.number}</p>)}
      </div>

      {/* Optional fields in a grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bloc</label>
          <input type="text" value={formData.block || ''} onChange={function (e) { return updateField('block', e.target.value); }} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]" placeholder="Ex: A1"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Scara</label>
          <input type="text" value={formData.stairs || ''} onChange={function (e) { return updateField('stairs', e.target.value); }} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]" placeholder="Ex: 1"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Etaj</label>
          <input type="text" value={formData.floor || ''} onChange={function (e) { return updateField('floor', e.target.value); }} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]" placeholder="Ex: 2"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Apartament</label>
          <input type="text" value={formData.apartment || ''} onChange={function (e) { return updateField('apartment', e.target.value); }} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]" placeholder="Ex: 5"/>
        </div>
      </div>

      {/* Intercom */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Interfon</label>
        <input type="text" value={formData.intercom || ''} onChange={function (e) { return updateField('intercom', e.target.value); }} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]" placeholder="Ex: 12A"/>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">"observatii pentru curier"</label>
        <textarea value={formData.notes || ''} onChange={function (e) { return updateField('notes', e.target.value); }} rows={3} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]" placeholder="ex clopotel la usa din stanga lasati la usa"/>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onBack} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all">
          <i className="fas fa-arrow-left mr-2"></i>"inapoi la produse"</button>
        <button type="submit" className="flex-1 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all">"continua catre plata"<i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </form>);
}
