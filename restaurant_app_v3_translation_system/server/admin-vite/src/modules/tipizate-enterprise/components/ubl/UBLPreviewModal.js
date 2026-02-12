"use strict";
/**
 * PHASE S8.3 - UBL Preview Modal Component
 *
 * Restaurant App V3 powered by QrOMS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UBLPreviewModal;
var react_1 = require("react");
function UBLPreviewModal(_a) {
    var xml = _a.xml, docType = _a.docType, docId = _a.docId, onClose = _a.onClose, onDownload = _a.onDownload;
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            UBL XML Preview - {docType} #{docId}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="px-6 py-4 flex-1 overflow-auto">
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {xml}
          </pre>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onDownload} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Download XML
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Close
          </button>
        </div>
      </div>
    </div>);
}
