"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartForm = SmartForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
require("./SmartForm.css");
function SmartForm(_a) {
    var fields = _a.fields, control = _a.control, errors = _a.errors, onSubmit = _a.onSubmit, _b = _a.submitLabel, submitLabel = _b === void 0 ? 'Salvează' : _b, _c = _a.loading, loading = _c === void 0 ? false : _c, _d = _a.layoutColumns, layoutColumns = _d === void 0 ? 2 : _d, secondaryAction = _a.secondaryAction;
    var showColumnsClass = (0, react_1.useMemo)(function () { return "smart-form smart-form--cols-".concat(layoutColumns); }, [layoutColumns]);
    var typedErrors = errors;
    return (<form className={showColumnsClass} onSubmit={onSubmit}>
      {fields.map(function (field) {
            var _a;
            var colSpanClass = field.colSpan === 2 ? 'smart-form__field--span2' : '';
            var errorMessage = (_a = typedErrors[field.name]) === null || _a === void 0 ? void 0 : _a.message;
            return (<div key={field.name} className={"smart-form__field ".concat(colSpanClass)}>
            <label className="smart-form__label" htmlFor={field.name}>
              {field.label}
              {field.required ? <span className="smart-form__required" aria-hidden="true">*</span> : null}
            </label>

            {field.type === 'textarea' ? (<react_hook_form_1.Controller name={field.name} control={control} render={function (_a) {
                        var _b;
                        var controllerField = _a.field;
                        return (<textarea id={field.name} placeholder={field.placeholder} className={"smart-form__control ".concat(errorMessage ? 'smart-form__control--error' : '')} disabled={field.disabled} rows={4} {...controllerField} value={(_b = controllerField.value) !== null && _b !== void 0 ? _b : ''}/>);
                    }}/>) : null}

            {field.type === 'text' || field.type === 'number' || field.type === 'date' || field.type === 'datetime-local' ? (<react_hook_form_1.Controller name={field.name} control={control} render={function (_a) {
                        var controllerField = _a.field;
                        return (<input id={field.name} type={field.type === 'number' ? 'number' : field.type} placeholder={field.placeholder} className={"smart-form__control ".concat(errorMessage ? 'smart-form__control--error' : '')} disabled={field.disabled} min={field.min} max={field.max} step={field.step} {...controllerField} value={controllerField.value === null || controllerField.value === undefined
                                ? ''
                                : controllerField.value} onChange={function (event) { return controllerField.onChange(event.target.value); }}/>);
                    }}/>) : null}

            {field.type === 'select' ? (<react_hook_form_1.Controller name={field.name} control={control} render={function (_a) {
                        var _b, _c, _d;
                        var controllerField = _a.field;
                        return (<>
                    <select id={field.name} className={"smart-form__control ".concat(errorMessage ? 'smart-form__control--error' : '')} disabled={field.disabled} value={(_b = controllerField.value) !== null && _b !== void 0 ? _b : ''} onChange={function (event) { return controllerField.onChange(event.target.value); }}>
                      <option value="">Selectează</option>
                      {(_c = field.options) === null || _c === void 0 ? void 0 : _c.map(function (option) { return (<option key={option.value} value={option.value}>
                          {option.label}
                        </option>); })}
                      {field.allowCustomOption ? (<option value="__custom__">{(_d = field.customOptionLabel) !== null && _d !== void 0 ? _d : 'Altă opțiune'}</option>) : null}
                    </select>
                    {field.allowCustomOption && controllerField.value === '__custom__' ? (<react_hook_form_1.Controller name={"".concat(field.name, "_custom")} control={control} render={function (_a) {
                                    var _b, _c;
                                    var customField = _a.field;
                                    return (<input className="smart-form__control smart-form__control--nested" placeholder={(_b = field.customFieldPlaceholder) !== null && _b !== void 0 ? _b : 'Introduceți valoarea personalizată'} {...customField} value={(_c = customField.value) !== null && _c !== void 0 ? _c : ''}/>);
                                }}/>) : null}
                  </>);
                    }}/>) : null}

            {field.type === 'checkbox' ? (<react_hook_form_1.Controller name={field.name} control={control} render={function (_a) {
                        var _b;
                        var controllerField = _a.field;
                        return (<label className="smart-form__checkbox">
                    <input type="checkbox" disabled={field.disabled} checked={Boolean(controllerField.value)} onChange={function (event) { return controllerField.onChange(event.target.checked); }}/>
                    <span>{(_b = field.placeholder) !== null && _b !== void 0 ? _b : 'Activ'}</span>
                  </label>);
                    }}/>) : null}

            {field.helperText ? <span className="smart-form__helper">{field.helperText}</span> : null}
            {errorMessage ? <span className="smart-form__error">{errorMessage}</span> : null}
          </div>);
        })}

      <div className="smart-form__actions">
        {secondaryAction}
        <button type="submit" className="smart-form__submit" disabled={loading}>
          {loading ? 'Se salvează…' : submitLabel}
        </button>
      </div>
    </form>);
}
