import React from 'react';
import { QueueStats } from '../api/queueApi';

interface QueueStatsCardsProps {
  queueType: 'memory' | 'redis' | 'none';
  stats?: QueueStats;
}

export function QueueStatsCards({ queueType, stats }: QueueStatsCardsProps) {
  const queueSize = stats?.currentQueueSize || 0;
  const processed = stats?.processed || 0;
  const failed = stats?.failed || 0;
  const avgTime = stats?.avgProcessingTime || 0;

  const getQueueStatus = () => {
    if (queueType === 'memory') {
      return { text: 'Active (In-Memory)', icon: '✅', color: 'text-green-600' };
    } else if (queueType === 'redis') {
      return { text: 'Active (Redis)', icon: '✅', color: 'text-green-600' };
    } else {
      return { text: 'No queue active', icon: '❌', color: 'text-red-600' };
    }
  };

  const status = getQueueStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Queue System Status */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-2xl font-bold">{queueType === 'none' ? 'Disabled' : 'Queue'}</h4>
            <p className="text-sm opacity-90 mt-1">Queue System</p>
          </div>
          <span className="text-3xl">📊</span>
        </div>
        <p className={`text-sm mt-2 ${status.color}`}>
          {status.icon} {status.text}
        </p>
      </div>

      {/* Queue Size */}
      <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-2xl font-bold">{queueSize}</h4>
            <p className="text-sm opacity-90 mt-1">În Coadă</p>
          </div>
          <span className="text-3xl">⏰</span>
        </div>
        <p className="text-sm mt-2 opacity-90">Comenzi în așteptare</p>
      </div>

      {/* Processed */}
      <div className="bg-green-500 text-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-2xl font-bold">{processed}</h4>
            <p className="text-sm opacity-90 mt-1">Procesate Astăzi</p>
          </div>
          <span className="text-3xl">✅</span>
        </div>
        <p className="text-sm mt-2 opacity-90">~{avgTime}ms avg</p>
      </div>

      {/* Failed */}
      <div className="bg-red-500 text-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-2xl font-bold">{failed}</h4>
            <p className="text-sm opacity-90 mt-1">Failed</p>
          </div>
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-sm mt-2 opacity-90">Necesită atenție</p>
      </div>
    </div>
  );
}

