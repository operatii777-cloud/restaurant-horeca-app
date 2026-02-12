"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.6 - Print Preview Page
 * Full-page print preview with print/download options
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
exports.default = PrintPreviewPage;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var tipizateApi_1 = require("../api/tipizateApi");
var tipizate_config_1 = require("../config/tipizate.config");
function PrintPreviewPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var searchParams = (0, react_router_dom_1.useSearchParams)()[0];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _a = (0, react_1.useState)(null), pdfUrl = _a[0], setPdfUrl = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var type = searchParams.ge[type];
    var id = searchParams.ge[id];
    var format = (searchParams.ge[format] || 'A4');
    var printerFriendly = searchParams.ge[printerFriendly] === 'true' || searchParams.ge[print] === 'true';
    var monochrome = searchParams.ge[monochrome] === 'true' || searchParams.ge[color] === 'false';
    (0, react_1.useEffect)(function () {
        if (!type || !id) {
            setError('Tip document și ID sunt obligatorii');
            setLoading(false);
            return;
        }
        loadPdf();
    }, [type, id, format, printerFriendly, monochrome]);
    var loadPdf = function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!type || !id)
                        return [2 /*return*/];
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, tipizateApi_1.tipizateApi.pdf(parseInt(id), type, {
                            format: format,
                            printerFriendly: printerFriendly,
                            monochrome: monochrome,
                        })];
                case 2:
                    blob = _a.sent();
                    url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Eroare la încărcarea PDF-ului');
                    console.error('PDF load error:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = function () {
        if (!pdfUrl || !type || !id)
            return;
        var link = document.createElement('a');
        link.href = pdfUrl;
        link.download = "".concat(type, "-").concat(id, ".pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    var handlePrint = function () {
        if (!pdfUrl)
            return;
        var printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.onload = function () {
                printWindow.print();
            };
        }
    };
    var handleClose = function () {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        navigate(-1);
    };
    if (!type || !id) {
        return (<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">"parametri lipsa"</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">"tip document si id sunt obligatorii"</p>
          <button onClick={handleClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Înapoi</button>
        </div>
      </div>);
    }
    return (<div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Preview Print - {(0, tipizate_config_1.nameFor)(type)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Document #{id} | Format: {format} | {printerFriendly ? 'Printer-Friendly' : 'Standard'} | {monochrome ? 'Monochrome' : 'Color'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPdf} className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            <i className="bi bi-arrow-clockwise me-1"></i>Reîncarcă</button>
          {pdfUrl && (<>
              <button onClick={handleDownload} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                <i className="bi bi-download me-1"></i>Descarcă</button>
              <button onClick={handlePrint} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                <i className="bi bi-printer me-1"></i>Tipărește</button>
            </>)}
          <button onClick={handleClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Închide</button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        {loading && (<div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">"se incarca pdf ul"</p>
            </div>
          </div>)}

        {error && (<div className="flex justify-center items-center h-full">
            <div className="text-center max-w-md">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <i className="bi bi-exclamation-triangle text-4xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Eroare
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button onClick={loadPdf} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Reîncearcă</button>
            </div>
          </div>)}

        {pdfUrl && !loading && !error && (<div className="flex justify-center">
            <iframe src={pdfUrl} className="w-full max-w-5xl h-full min-h-[800px] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white" title="PDF Preview"/>
          </div>)}
      </div>
    </div>);
}
