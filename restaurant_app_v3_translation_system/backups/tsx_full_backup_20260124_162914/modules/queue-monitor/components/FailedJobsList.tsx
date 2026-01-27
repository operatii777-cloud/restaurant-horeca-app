// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';
import { FailedJob } from '../api/queueApi';

interface FailedJobsListProps {
  jobs: FailedJob[];
  onRetry?: (jobId: string) => void;
}

function getTimeAgo(timestamp: string | number): string {
  const now = Date.now();
  const jobTime = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const diff = now - jobTime;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `"Hours"h ago`;
  if (minutes > 0) return `"Minutes"m ago`;
  return `"Seconds"s ago`;
}

export function FailedJobsList({ jobs, onRetry }: FailedJobsListProps) {
//   const { t } = useTranslation();
  if (jobs.length === 0) {
    return (
      <div className="text-center text-green-600 py-8">
        <div className="text-5xl mb-3">✅</div>
        <p>"niciun job esuat"</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => {
        const timeAgo = getTimeAgo(job.failedAt);

        return (
          <div key={job.jobId} className="border border-red-300 rounded-lg bg-red-50 p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-red-800">Comanda #{job.orderId}</div>
                <div className="text-sm text-red-600 mt-1">{job.error}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {timeAgo} • {job.retries} încercări
                </div>
              </div>
              {onRetry && (
                <button
                  onClick={() => onRetry(job.jobId)}
                  className="ml-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}




