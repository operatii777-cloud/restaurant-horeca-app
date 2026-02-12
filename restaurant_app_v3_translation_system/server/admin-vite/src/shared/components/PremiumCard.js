"use strict";
/**
 * PREMIUM CARD COMPONENT
 * Industry-leading card component with perfect accessibility
 * Inspired by: Stripe, Linear, Vercel, Shadcn UI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumCard = void 0;
var react_1 = require("react");
var PremiumCard = function (_a) {
    var title = _a.title, description = _a.description, header = _a.header, footer = _a.footer, children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.variant, variant = _c === void 0 ? "Default" : _c;
    var variantClasses = {
        default: 'card',
        elevated: 'card card-elevated',
        outlined: 'card card-outlined',
    };
    var classes = [variantClasses[variant], className].filter(Boolean).join(' ');
    return (<div className={classes}>
      {(title || description || header) && (<div className="card-header">
          {header || (<>
              {title && <h3 className="card-title">{title}</h3>}
              {description && <p className="card-description">{description}</p>}
            </>)}
        </div>)}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>);
};
exports.PremiumCard = PremiumCard;
