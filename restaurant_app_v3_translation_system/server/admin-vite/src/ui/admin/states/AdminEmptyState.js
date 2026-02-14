"use strict";
/**
 * AdminEmptyState - Empty state compact
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminEmptyState = void 0;
var react_1 = require("react");
require("./AdminStates.css");
var AdminEmptyState = function (_a) {
    var title = _a.title, message = _a.message, actionLabel = _a.actionLabel, onAction = _a.onAction;
    return (<div className="admin-state admin-state--empty">
      <div className="admin-state__icon">📭</div>
      <h3 className="admin-state__title">{title}</h3>
      {message && <p className="admin-state__message">{message}</p>}
      {actionLabel && onAction && (<button className="admin-state__action" onClick={onAction}>
          {actionLabel}
        </button>)}
    </div>);
};
exports.AdminEmptyState = AdminEmptyState;
