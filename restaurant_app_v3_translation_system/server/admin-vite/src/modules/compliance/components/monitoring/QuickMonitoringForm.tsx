// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { haccpService } from '../../services/haccp.service';
import type { Process, CCP, Limit } from '../../services/haccp.service';
import { MonitoringStatusBadge } from './MonitoringStatusBadge';

export const QuickMonitoringForm: React.FC = () => {
  //   const { t } = useTranslation();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [ccps, setCcps] = useState<CCP[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<number | ''>('');
  const [selectedCcpId, setSelectedCcpId] = useState<number | ''>('');
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [measuredValue, setMeasuredValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [predictedStatus, setPredictedStatus] = useState<'ok' | 'warning' | 'critical' | null>(null);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [loadingCcps, setLoadingCcps] = useState(false);

  useEffect(() => {
    loadProcesses();
  }, []);

  useEffect(() => {
    if (selectedProcessId) {
      loadCCPs(selectedProcessId as number);
    } else {
      setCcps([]);
      setSelectedCcpId('');
    }
  }, [selectedProcessId]);

  useEffect(() => {
    if (selectedCcpId && selectedParameter) {
      loadLimits(selectedCcpId as number, selectedParameter);
    } else {
      setLimits([]);
      setPredictedStatus(null);
    }
  }, [selectedCcpId, selectedParameter]);

  useEffect(() => {
    if (limits.length > 0 && measuredValue) {
      const value = parseFloat(measuredValue);
      if (!isNaN(value)) {
        const limit = limits.find(l => l.parameter_name === selectedParameter);
        if (limit) {
          if (value < limit.min_value || value > limit.max_value) {
            setPredictedStatus('critical');
          } else {
            const range = limit.max_value - limit.min_value;
            const warningMin = limit.min_value + (range * 0.1);
            const warningMax = limit.max_value - (range * 0.1);
            if (value < warningMin || value > warningMax) {
              setPredictedStatus('warning');
            } else {
              setPredictedStatus('ok');
            }
          }
        }
      }
    } else {
      setPredictedStatus(null);
    }
  }, [measuredValue, limits, selectedParameter]);

  const loadProcesses = async () => {
    try {
      setLoadingProcesses(true);
      const data = await haccpService.getAllProcesses();
      setProcesses(data);
    } catch (err: any) {
      setError('Eroare la încărcarea proceselor: ' + (err.message || 'Eroare necunoscută'));
    } finally {
      setLoadingProcesses(false);
    }
  };

  const loadCCPs = async (processId: number) => {
    try {
      setLoadingCcps(true);
      const data = await haccpService.getCCPsByProcess(processId);
      setCcps(data);
      if (data.length === 0) {
        setSelectedCcpId('');
      }
    } catch (err: any) {
      setError('Eroare la încărcarea CCP-urilor: ' + (err.message || 'Eroare necunoscută'));
    } finally {
      setLoadingCcps(false);
    }
  };

  const loadLimits = async (ccpId: number, parameterName: string) => {
    try {
      const allLimits = await haccpService.getLimitsByCCP(ccpId);
      const filtered = allLimits.filter(l => l.parameter_name === parameterName);
      setLimits(filtered);
    } catch (err: any) {
      console.error('Error loading limits:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedCcpId || !selectedParameter || !measuredValue) {
      setError('Toate câmpurile sunt obligatorii');
      return;
    }

    const value = parseFloat(measuredValue);
    if (isNaN(value)) {
      setError('Valoarea măsurată trebuie să fie un număr');
      return;
    }

    try {
      setLoading(true);
      const result = await haccpService.recordMonitoring({
        ccp_id: selectedCcpId as number,
        parameter_name: selectedParameter,
        measured_value: value,
        notes: notes || undefined,
        monitored_by: 1 // TODO: Get from auth context
      });

      setSuccess(`Monitorizare înregistrată cu succes! Status: ${result.status.toUpperCase()}`);

      // Reset form
      setMeasuredValue('');
      setNotes('');
      setSelectedParameter('');

      // Trigger reload event for parent components
      window.dispatchEvent(new CustomEvent('haccp-monitoring-recorded', { detail: result }));

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la înregistrarea monitorizării');
    } finally {
      setLoading(false);
    }
  };

  const selectedCcp = ccps.find(c => c.id === selectedCcpId);
  const availableParameters = limits.length > 0 ? [...new Set(limits.map(l => l.parameter_name))] : [];
  const currentLimit = limits.find(l => l.parameter_name === selectedParameter);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">monitorizare rapidă HACCP</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proces HACCP <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProcessId}
            onChange={(e) => setSelectedProcessId(e.target.value ? parseInt(e.target.value) : '')}
            disabled={loadingProcesses}
            required
          >
            <option value="">selectează proces</option>
            {processes.map(process => (
              <option key={process.id} value={process.id}>
                {process.name} ({process.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Punct Critic de Control (CCP) <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCcpId}
            onChange={(e) => {
              setSelectedCcpId(e.target.value ? parseInt(e.target.value) : '');
              setSelectedParameter('');
              setMeasuredValue('');
            }}
            disabled={!selectedProcessId || loadingCcps || ccps.length === 0}
            required
          >
            <option value="">selectează CCP</option>
            {ccps.map(ccp => (
              <option key={ccp.id} value={ccp.id}>
                {ccp.ccp_number} - {ccp.hazard_description}
              </option>
            ))}
          </select>
          {selectedCcp && (
            <p className="mt-1 text-xs text-gray-500">
              Tip hazard: {selectedCcp.hazard_type} | Măsură de control: {selectedCcp.control_measure}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parametru <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedParameter}
            onChange={(e) => {
              setSelectedParameter(e.target.value);
              setMeasuredValue('');
            }}
            disabled={!selectedCcpId || availableParameters.length === 0}
            required
          >
            <option value="">selectează parametru</option>
            {availableParameters.map(param => (
              <option key={param} value={param}>{param}</option>
            ))}
          </select>
          {currentLimit && (
            <p className="mt-1 text-xs text-gray-500">
              Limită: {currentLimit.min_value} - {currentLimit.max_value} {currentLimit.unit}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">valoare măsurată<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="any"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={measuredValue}
              onChange={(e) => setMeasuredValue(e.target.value)}
              disabled={!selectedParameter}
              required
            />
            {currentLimit && (
              <span className="text-sm text-gray-500">{currentLimit.unit}</span>
            )}
            {predictedStatus && (
              <MonitoringStatusBadge status={predictedStatus} />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (opțional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="adaugă observații"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !selectedCcpId || !selectedParameter || !measuredValue}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>se înregistrează...</>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>înregistrează monitorizare</>
          )}
        </button>
      </form>
    </div>
  );
};




