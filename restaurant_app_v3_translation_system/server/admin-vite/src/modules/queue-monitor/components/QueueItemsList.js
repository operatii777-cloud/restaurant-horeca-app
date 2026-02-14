"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueItemsList = QueueItemsList;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
function getTimeAgo(timestamp) {
    var now = Date.now();
    var diff = now - timestamp;
    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    if (hours > 0)
        return "\"Hours\"h ago";
    if (minutes > 0)
        return "\"Minutes\"m ago";
    return "\"Seconds\"s ago";
}
function QueueItemsList(_a) {
    var items = _a.items;
    //   const { t } = useTranslation();
    if (items.length === 0) {
        return (<div className="text-center text-gray-500 py-8">
        <div className="text-5xl mb-3">📥</div>
        <p>Coada este goală</p>
      </div>);
    }
    return (<div className="space-y-2">
      {items.map(function (item) {
            var statusIcon = item.status === 'processing' ? '⏳' : '⏰';
            var statusColor = item.status === 'processing'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-gray-100 text-gray-800 border-gray-300';
            var retryBadge = item.retries && item.retries > 0 ? (<span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">
            {item.retries}/3
          </span>) : null;
            var timeAgo = getTimeAgo(item.addedAt);
            return (<div key={item.id} className={"flex justify-between items-center p-3 border rounded-lg ".concat(statusColor)}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{statusIcon}</span>
              <div>
                <div className="font-semibold">Comanda #{item.orderId}</div>
                <div className="text-xs text-gray-600">
                  {timeAgo} {retryBadge}
                </div>
              </div>
            </div>
            <span className={"px-3 py-1 rounded text-xs font-medium ".concat(statusColor)}>
              {item.status}
            </span>
          </div>);
        })}
    </div>);
}
