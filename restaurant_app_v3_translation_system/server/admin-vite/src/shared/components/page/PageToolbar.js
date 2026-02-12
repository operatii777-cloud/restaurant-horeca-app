"use strict";
/**
 * Page Toolbar Component - Premium UI Pattern
 * Search input, filters, and quick actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageToolbar = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./PageToolbar.css");
var PageToolbar = function (_a) {
    var _b = _a.searchValue, searchValue = _b === void 0 ? '' : _b, onSearchChange = _a.onSearchChange, _c = _a.searchPlaceholder, searchPlaceholder = _c === void 0 ? 'Caută...' : _c, filters = _a.filters, actions = _a.actions, onClearFilters = _a.onClearFilters, _d = _a.className, className = _d === void 0 ? '' : _d;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"page-toolbar ".concat(className)} style={{
            background: theme.surfaceLight,
            borderBottom: "1px solid ".concat(theme.borderLight),
        }}>
      <div className="page-toolbar__content">
        {/* Search */}
        {onSearchChange && (<div className="page-toolbar__search">
            <input type="text" value={searchValue} onChange={function (e) { return onSearchChange(e.target.value); }} placeholder={searchPlaceholder} className="page-toolbar__search-input" style={{
                background: theme.inputBg,
                border: "1px solid ".concat(theme.inputBorder),
                color: theme.text,
            }} onKeyDown={function (e) {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }
            }}/>
          </div>)}

        {/* Filters */}
        {filters && <div className="page-toolbar__filters">{filters}</div>}

        {/* Actions */}
        <div className="page-toolbar__actions">
          {actions}
          {onClearFilters && (<button type="button" className="page-toolbar__clear-btn" onClick={onClearFilters} style={{
                background: theme.surface,
                border: "1px solid ".concat(theme.border),
                color: theme.text,
            }}>
              Reset filtre
            </button>)}
        </div>
      </div>
    </div>);
};
exports.PageToolbar = PageToolbar;
