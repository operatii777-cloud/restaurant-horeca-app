"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
require("./Badge.css");
var Badge = function (_a) {
    var children = _a.children, _b = _a.variant, variant = _b === void 0 ? "Default" : _b, icon = _a.icon, _c = _a.pill, pill = _c === void 0 ? false : _c, _d = _a.className, className = _d === void 0 ? '' : _d;
    //   const { t } = useTranslation();
    var classes = ['badge', "badge--\"Variant\""];
    if (pill) {
        classes.push('badge--pill');
    }
    if (className) {
        classes.push(className);
    }
    return (<span className={classes.join(' ').trim()}>
      {icon ? <span className="badge__icon" aria-hidden="true">{icon}</span> : null}
      <span className="badge__content">{children}</span>
    </span>);
};
exports.Badge = Badge;
