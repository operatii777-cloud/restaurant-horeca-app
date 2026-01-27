// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { haccpService } from '../../services/haccp.service';
import type { Monitoring, MonitoringFilters } from '../../services/haccp.service';
import { MonitoringStatusBadge } from './MonitoringStatusBadge';

interface MonitoringHistoryTableProps {
  refreshTrigger?: number;
}

export const MonitoringHistoryTable: React.FC<MonitoringHistoryTableProps> = ({ refreshTrigger }) => {
//   const { t } = useTranslation();
  const [monitorings, setMonitorings] = useState<Monitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MonitoringFilters>({
    limit: 10,
    offset: 0
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCcpId, setSelectedCcpId] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'ok' | 'warning' | 'critical' | ''>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    loadMonitorings();
  }, [filters, refreshTrigger]);

  const loadMonitorings = async () => {
    try {
      setLoading(true);
      const data = await haccpService.getMonitoring(filters);
      setMonitorings(data);
      setTotalCount(data.length); // Backend should return total count, using length for now
    } catch (error) {
      console.error('Error loading monitoring records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const newFilters: MonitoringFilters = {
      limit: 10,
      offset: 0
    };
    if (selectedCcpId) newFilters.ccp_id = selectedCcpId as number;
    if (selectedStatus) newFilters.status = selectedStatus;
    if (dateFrom) newFilters.date_from = dateFrom;
    if (dateTo) newFilters.date_to = dateTo;
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSelectedCcpId('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    setFilters({ limit: 10, offset: 0 });
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (page - 1) * (prev.limit || 10)
    }));
  };

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1;
  const totalPages = Math.ceil(totalCount / (filters.limit || 10));

  useEffect(() => {
    // Listen for new monitoring records
    const handleMonitoringRecorded = () => {
      loadMonitorings();
    };
    window.addEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
    return () => {
      window.removeEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
    };
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Istoric Monitorizare</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">CCP ID</label>
          <input
            type="number"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            value={selectedCcpId}
            onChange={(e) => setSelectedCcpId(e.target.value ? parseInt(e.target.value) : '')}
            placeholder="CCP ID"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="">"Toate"</option>
            <option value="ok">OK</option>
            <option value="warning">Atenție</option>
            <option value="critical">Critic</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">De la</label>
          <input
            type="date"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Până la</label>
          <input
            type="date"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <i className="fas fa-filter mr-1"></i>
            Aplică Filtre
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            <i className="fas fa-times mr-1"></i>"Resetează"</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
          <p className="mt-2 text-gray-500">"se incarca"</p>
        </div>
      ) : monitorings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
          <p>Nu există înregistrări de monitorizare</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Data/Ora</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">CCP</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Proces</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Parametru</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Valoare</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {monitorings.map((monitoring) => (
                  <tr key={monitoring.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {new Date(monitoring.monitored_at).toLocaleString('ro-RO')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {monitoring.ccp_number || `CCP-${monitoring.ccp_id}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {monitoring.process_name || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">{monitoring.parameter_name}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      {monitoring.measured_value} {monitoring.unit}
                    </td>
                    <td className="px-4 py-2">
                      <MonitoringStatusBadge status={monitoring.status} size="sm" />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {monitoring.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Pagina {currentPage} din {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};




