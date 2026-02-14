"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableFilter = void 0;
require("./TableFilter.css");
var TableFilter = function (_a) {
    var value = _a.value, _b = _a.placeholder, placeholder = _b === void 0 ? 'Caută…' : _b, onChange = _a.onChange, _c = _a.icon, icon = _c === void 0 ? '🔍' : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, rest = __rest(_a, ["value", "placeholder", "onChange", "icon", "disabled"]);
    //   const { t } = useTranslation();
    var handleChange = function (event) {
        //   const { t } = useTranslation();
        onChange(event.target.value);
    };
    return (<div className="table-filter">
      <span className="table-filter__icon" aria-hidden="true">
        {icon}
      </span>
      <input className="table-filter__input" type="search" value={value} onChange={handleChange} placeholder={placeholder} disabled={disabled} {...rest}/>
      {value ? (<button type="button" className="table-filter__clear" onClick={function () { return onChange(''); }} aria-label="sterge filtrul">
          ✕
        </button>) : null}
    </div>);
};
exports.TableFilter = TableFilter;
