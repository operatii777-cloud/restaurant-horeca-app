"use strict";
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
exports.TemperatureLogFormModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./TemperatureLogFormModal.css");
var TemperatureLogFormModal = function (_a) {
    var equipment = _a.equipment, onSave = _a.onSave, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({
        equipment_id: '',
        temperature: '',
        operator_id: '',
        notes: '',
    }), formData = _b[0], setFormData = _b[1];
    var selectedEq = equipment.find(function (eq) { return eq.id === parseInt(formData.equipment_id); });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.equipment_id || !formData.temperature) {
            alert('Echipamentul și temperatura sunt obligatorii');
            return;
        }
        onSave({
            equipment_id: parseInt(formData.equipment_id),
            temperature: parseFloat(formData.temperature),
            operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
            notes: formData.notes || null,
        });
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h2>"adauga inregistrare temperatura"</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Echipament *</label>
            <select className="form-control form-select" value={formData.equipment_id} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { equipment_id: e.target.value })); }); }} required title="selecteaza echipamentul" aria-label="selecteaza echipamentul">
              <option value="">"selecteaza echipamentul"</option>
              {equipment.map(function (eq) { return (<option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.type})
                  {eq.min_temp !== null && eq.max_temp !== null &&
                " - Interval: ".concat(eq.min_temp, "\u00B0C - ").concat(eq.max_temp, "\u00B0C")}
                </option>); })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Temperatură (°C) *</label>
            <input type="number" step="0.1" className="form-control" value={formData.temperature} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { temperature: e.target.value })); }); }} required placeholder="Ex: 4.5"/>
            {selectedEq && selectedEq.min_temp !== null && selectedEq.max_temp !== null && (<small className="form-text text-muted">
                Interval sigur: {selectedEq.min_temp}°C - {selectedEq.max_temp}°C
              </small>)}
          </div>

          <div className="form-group">
            <label className="form-label">"Operator"</label>
            <input type="text" className="form-control" value={formData.operator_id} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { operator_id: e.target.value })); }); }} placeholder="ID operator (opțional)"/>
          </div>

          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-control" rows={3} value={formData.notes} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: e.target.value })); }); }} placeholder="Note adiționale (opțional)"/>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>"Anulează"</button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            <i className="fas fa-save me-2"></i>
            Salvează
          </button>
        </div>
      </div>
    </div>);
};
exports.TemperatureLogFormModal = TemperatureLogFormModal;
