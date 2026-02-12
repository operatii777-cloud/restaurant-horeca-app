"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KioskTransferIframePage;
var react_1 = require("react");
function KioskTransferIframePage() {
    return (<div style={{ width: '100%', height: '100%', minHeight: '80vh', background: '#fff' }}>
      <iframe src="http://localhost:3001/admin-advanced.html#transfers" title="Transferuri Admin Advanced" style={{ width: '100%', height: '80vh', border: 'none' }} allowFullScreen/>
    </div>);
}
