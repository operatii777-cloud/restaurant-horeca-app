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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleaningScheduleFormModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./CleaningScheduleFormModal.css");
var CleaningScheduleFormModal = function (_a) {
    var onSave = _a.onSave, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({
        title: '',
        description: '',
        frequency: 'daily',
        shift_type: 'both',
        checklist_items: [''],
        assigned_to: '',
        due_date: '',
    }), formData = _b[0], setFormData = _b[1];
    var handleAddChecklistItem = function () {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { checklist_items: __spreadArray(__spreadArray([], prev.checklist_items, true), [''], false) })); });
    };
    var handleRemoveChecklistItem = function (index) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { checklist_items: prev.checklist_items.filter(function (_, i) { return i !== index; }) })); });
    };
    var handleChecklistItemChange = function (index, value) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { checklist_items: prev.checklist_items.map(function (item, i) { return i === index ? value : item; }) })); });
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.title || !formData.due_date) {
            alert('Titlul și termenul sunt obligatorii');
            return;
        }
        var validItems = formData.checklist_items.filter(function (item) { return item.trim() !== ''; });
        if (validItems.length === 0) {
            alert('Adăugați cel puțin un item în checklist');
            return;
        }
        onSave(__assign(__assign({}, formData), { checklist_items: validItems, assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null }));
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h2>"creeaza task curatenie"</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Titlu *</label>
            <input type="text" className="form-control" value={formData.title} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { title: e.target.value })); }); }} required placeholder="ex curatenie deschidere tura"/>
          </div>

          <div className="form-group">
            <label className="form-label">Descriere</label>
            <textarea className="form-control" rows={3} value={formData.description} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }} placeholder="descriere task curatenie"/>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Frecvență *</label>
              <select className="form-control form-select" value={formData.frequency} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { frequency: e.target.value })); }); }} required title="selecteaza frecventa" aria-label="selecteaza frecventa">
                <option value="daily">Zilnic</option>
                <option value="weekly">"Săptămânal"</option>
                <option value="monthly">Lunar</option>
                <option value="custom">"Personalizat"</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tură</label>
              <select className="form-control form-select" value={formData.shift_type} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { shift_type: e.target.value })); }); }} title="selecteaza tura" aria-label="selecteaza tura">
                <option value="opening">"Deschidere"</option>
                <option value="closing">"Închidere"</option>
                <option value="both">Ambele</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Termen *</label>
            <input type="datetime-local" className="form-control" value={formData.due_date} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { due_date: e.target.value })); }); }} required title="data si ora termenului" aria-label="data si ora termenului"/>
          </div>

          <div className="form-group">
            <label className="form-label">Checklist Items *</label>
            {formData.checklist_items.map(function (item, index) { return (<div key={index} className="checklist-item-input">
                  <input type="text" className="form-control" value={item} onChange={function (e) { return handleChecklistItemChange(index, e.target.value); }} placeholder={"Item ".concat(index + 1)} title={"Checklist item ".concat(index + 1)} aria-label={"Checklist item ".concat(index + 1)}/>
                {formData.checklist_items.length > 1 && (<button type="button" className="btn btn-sm btn-danger" onClick={function () { return handleRemoveChecklistItem(index); }} title="sterge item" aria-label="sterge item">
                    <i className="fas fa-trash"></i>
                  </button>)}
              </div>); })}
            <button type="button" className="btn btn-sm btn-outline" onClick={handleAddChecklistItem}>
              <i className="fas fa-plus me-1"></i>"adauga item"</button>
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
exports.CleaningScheduleFormModal = CleaningScheduleFormModal;
