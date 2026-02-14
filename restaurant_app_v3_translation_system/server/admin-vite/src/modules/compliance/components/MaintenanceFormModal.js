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
exports.MaintenanceFormModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./MaintenanceFormModal.css");
var MaintenanceFormModal = function (_a) {
    var equipment = _a.equipment, onSave = _a.onSave, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({
        equipment_id: '',
        maintenance_type: 'preventive',
        scheduled_date: '',
        description: '',
    }), formData = _b[0], setFormData = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.equipment_id || !formData.scheduled_date) {
            alert('Echipamentul și data programată sunt obligatorii');
            return;
        }
        onSave({
            equipment_id: parseInt(formData.equipment_id),
            maintenance_type: formData.maintenance_type,
            scheduled_date: formData.scheduled_date,
            description: formData.description || null,
        });
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h2>"programeaza mentenanta"</h2>
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
                </option>); })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tip Mentenanță *</label>
            <select className="form-control form-select" value={formData.maintenance_type} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { maintenance_type: e.target.value })); }); }} required title="selecteaza tipul mentenantei" aria-label="selecteaza tipul mentenantei">
              <option value="preventive">"Preventivă"</option>
              <option value="repair">"Reparație"</option>
              <option value="calibration">Calibrare</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Data Programată *</label>
            <input type="datetime-local" className="form-control" value={formData.scheduled_date} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { scheduled_date: e.target.value })); }); }} required title="data si ora programata" aria-label="data si ora programata"/>
          </div>

          <div className="form-group">
            <label className="form-label">Descriere</label>
            <textarea className="form-control" rows={3} value={formData.description} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }} placeholder="descriere mentenanta"/>
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
exports.MaintenanceFormModal = MaintenanceFormModal;
