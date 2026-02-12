"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Invoice XML Viewer Component
 *
 * Displays UBL XML with syntax highlighting and download option.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceXmlViewer = InvoiceXmlViewer;
var react_1 = require("react");
require("./InvoiceXmlViewer.css");
function InvoiceXmlViewer(_a) {
    var _this = this;
    var xml = _a.xml, invoiceId = _a.invoiceId;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)('light'), theme = _b[0], setTheme = _b[1];
    var _c = (0, react_1.useState)(false), copied = _c[0], setCopied = _c[1];
    var handleDownload = function () {
        //   const { t } = useTranslation();
        var blob = new Blob('xml', { type: 'application/xml' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "invoice-".concat(invoiceId, ".xml");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    var handleCopy = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(xml)];
                case 1:
                    _a.sent();
                    setCopied(true);
                    setTimeout(function () { return setCopied(false); }, 2000);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to copy XML:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Simple XML formatting (basic indentation)
    var formatXml = function (xml) {
        var formatted = '';
        var indent = 0;
        var tab = '  ';
        xml.split(/>\s*</).forEach(function (node) {
            if (node.match(/^\/\w/))
                indent--;
            formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';
            if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input'))
                indent++;
        });
        return formatted.substring(1, formatted.length - 2);
    };
    var formattedXml = xml ? formatXml(xml) : '';
    return (<div className={"invoice-xml-viewer invoice-xml-viewer--\"Theme\""}>
      <div className="xml-viewer-header">
        <h3>UBL XML</h3>
        <div className="xml-viewer-actions">
          <button className="xml-action-btn" onClick={function () { return setTheme(theme === 'light' ? 'dark' : 'light'); }}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="xml-action-btn" onClick={handleCopy}>
            {copied ? '✓ Copiat' : '📋 Copiază'}
          </button>
          <button className="xml-action-btn" onClick={handleDownload}>
            ⬇️ Download
          </button>
        </div>
      </div>
      <div className="xml-viewer-content">
        <pre className="xml-code">
          <code>{formattedXml || 'XML nu este disponibil'}</code>
        </pre>
      </div>
    </div>);
}
