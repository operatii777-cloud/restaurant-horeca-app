"use strict";
/**
 * PHASE S5.3 - Tipizate Header Form
 * Generic header form component for all tipizate documents
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
exports.TipizateHeaderForm = void 0;
var react_1 = require("react");
var tipizate_config_1 = require("../../config/tipizate.config");
var TipizateHeaderForm = function (_a) {
    var type = _a.type, form = _a.form, setForm = _a.setForm, _b = _a.loading, loading = _b === void 0 ? false : _b;
    var fields = (0, tipizate_config_1.headerFor)(type);
    var handleChange = function (name, value) {
        var _a;
        setForm(__assign(__assign({}, form), (_a = {}, _a[name] = value, _a)));
    };
    return (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {fields.map(function (field) {
            var _a, _b, _c, _d, _e, _f;
            return (<div key={field.name} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === 'text' && (<input type="text" className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={(_a = form[field.name]) !== null && _a !== void 0 ? _a : ''} onChange={function (e) { return handleChange(field.name, e.target.value); }} disabled={loading} required={field.required}/>)}

          {field.type === 'number' && (<input type="number" step="0.01" className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={(_b = form[field.name]) !== null && _b !== void 0 ? _b : ''} onChange={function (e) { return handleChange(field.name, Number(e.target.value)); }} disabled={loading} required={field.required}/>)}

          {field.type === 'date' && (<input type="date" className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={(_c = form[field.name]) !== null && _c !== void 0 ? _c : ''} onChange={function (e) { return handleChange(field.name, e.target.value); }} disabled={loading} required={field.required}/>)}

          {field.type === 'select' && (<select className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={(_d = form[field.name]) !== null && _d !== void 0 ? _d : ''} onChange={function (e) { return handleChange(field.name, e.target.value); }} disabled={loading} required={field.required}>
              <option value="">Selectează...</option>
              {(_e = field.options) === null || _e === void 0 ? void 0 : _e.map(function (opt) { return (<option key={opt} value={opt}>
                  {opt}
                </option>); })}
            </select>)}

          {field.type === 'autocomplete' && (<input type="text" className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={(_f = form[field.name]) !== null && _f !== void 0 ? _f : ''} onChange={function (e) { return handleChange(field.name, e.target.value); }} disabled={loading} required={field.required} placeholder={"Introdu ".concat(field.label.toLowerCase(), "...")}/>)}
        </div>);
        })}
    </div>);
};
exports.TipizateHeaderForm = TipizateHeaderForm;
