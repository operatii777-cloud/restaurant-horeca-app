"use strict";
/**
 * Page Shell Component - Premium UI Pattern
 * Complete page layout with header, toolbar, content, and footer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageShell = void 0;
var react_1 = require("react");
var PageHeader_1 = require("./PageHeader");
var PageToolbar_1 = require("./PageToolbar");
var PageFooter_1 = require("./PageFooter");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./PageShell.css");
var PageShell = function (_a) {
    var header = _a.header, toolbar = _a.toolbar, footer = _a.footer, children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.contentClassName, contentClassName = _c === void 0 ? '' : _c;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"page-shell ".concat(className)} style={{
            background: theme.bgSolid,
            color: theme.text,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
      {header && <PageHeader_1.PageHeader {...header}/>}
      {toolbar && <PageToolbar_1.PageToolbar {...toolbar}/>}
      <div className={"page-shell__content ".concat(contentClassName)} style={{
            flex: 1,
            minHeight: 0,
            overflow: "Auto",
        }}>
        {children}
      </div>
      {footer && <PageFooter_1.PageFooter {...footer}/>}
    </div>);
};
exports.PageShell = PageShell;
