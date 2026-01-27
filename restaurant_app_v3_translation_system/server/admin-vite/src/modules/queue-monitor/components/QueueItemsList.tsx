// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';
import { QueueItem } from '../api/queueApi';

interface QueueItemsListProps {
  items: QueueItem[];
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `"Hours"h ago`;
  if (minutes > 0) return `"Minutes"m ago`;
  return `"Seconds"s ago`;
}

export function QueueItemsList({ items }: QueueItemsListProps) {
//   const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-5xl mb-3">📥</div>
        <p>Coada este goală</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const statusIcon = item.status === 'processing' ? '⏳' : '⏰';
        const statusColor =
          item.status === 'processing'
            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
            : 'bg-gray-100 text-gray-800 border-gray-300';
        const retryBadge = item.retries && item.retries > 0 ? (
          <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">
            {item.retries}/3
          </span>
        ) : null;
        const timeAgo = getTimeAgo(item.addedAt);

        return (
          <div
            key={item.id}
            className={`flex justify-between items-center p-3 border rounded-lg ${statusColor}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{statusIcon}</span>
              <div>
                <div className="font-semibold">Comanda #{item.orderId}</div>
                <div className="text-xs text-gray-600">
                  {timeAgo} {retryBadge}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-medium ${statusColor}`}>
              {item.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}




