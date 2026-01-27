// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { haccpService } from '../../services/haccp.service';
import type { Process, CCP, Monitoring } from '../../services/haccp.service';

interface CorrectiveActionFormProps {
  onSuccess?: () => void;
  initialCcpId?: number;
  initialMonitoringId?: number;
}

export const CorrectiveActionForm: React.FC<CorrectiveActionFormProps> = ({ 
  onSuccess, 
  initialCcpId,
  initialMonitoringId 
}) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [ccps, setCcps] = useState<CCP[]>([]);
  const [monitorings, setMonitorings] = useState<Monitoring[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<number | ''>(initialCcpId ? '' : '');
  const [selectedCcpId, setSelectedCcpId] = useState<number | ''>(initialCcpId || '');
  const [selectedMonitoringId, setSelectedMonitoringId] = useState<number | ''>(initialMonitoringId || '');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingProcesses, setLoadingProcesses] = useState(true);

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
    if (selectedCcpId) {
      loadMonitorings(selectedCcpId as number);
    } else {
      setMonitorings([]);
      setSelectedMonitoringId('');
    }
  }, [selectedCcpId]);

  const loadProcesses = async () => {
//   const { t } = useTranslation();
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
      const data = await haccpService.getCCPsByProcess(processId);
      setCcps(data);
      if (initialCcpId && data.some(c => c.id === initialCcpId)) {
        setSelectedCcpId(initialCcpId);
      }
    } catch (err: any) {
      setError('Eroare la încărcarea CCP-urilor: ' + (err.message || 'Eroare necunoscută'));
    }
  };

  const loadMonitorings = async (ccpId: number) => {
    try {
      const data = await haccpService.getMonitoring({ ccp_id: ccpId, limit: 50 });
      const criticalOrWarning = data.filter(m => m.status === 'critical' || m.status === 'warning');
      setMonitorings(criticalOrWarning);
      if (initialMonitoringId && criticalOrWarning.some(m => m.id === initialMonitoringId)) {
        setSelectedMonitoringId(initialMonitoringId);
      }
    } catch (err: any) {
      console.error('Error loading monitorings:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedCcpId || !actionTaken.trim()) {
      setError('CCP-ul și acțiunea sunt obligatorii');
      return;
    }

    try {
      setLoading(true);
      await haccpService.createCorrectiveAction({
        ccp_id: selectedCcpId as number,
        monitoring_id: selectedMonitoringId ? selectedMonitoringId as number : undefined,
        action_taken: actionTaken.trim(),
        taken_by: 1 // TODO: Get from auth context
      });

      setSuccess('Acțiune corectivă creată cu succes!');
      
      // Reset form
      setActionTaken('');
      setSelectedMonitoringId('');
      if (!initialCcpId) {
        setSelectedCcpId('');
        setSelectedProcessId('');
      }

      // Trigger success callback
      onSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la crearea acțiunii corective');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">"creeaza actiune corectiva"</h2>

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
        {!initialCcpId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proces HACCP
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedProcessId}
                onChange={(e) => setSelectedProcessId(e.target.value ? parseInt(e.target.value) : '')}
                disabled={loadingProcesses}
              >
                <option value="">"selecteaza proces"</option>
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
                onChange={(e) => setSelectedCcpId(e.target.value ? parseInt(e.target.value) : '')}
                disabled={!selectedProcessId || ccps.length === 0}
                required
              >
                <option value="">"selecteaza ccp"</option>
                {ccps.map(ccp => (
                  <option key={ccp.id} value={ccp.id}>
                    {ccp.ccp_number} - {ccp.hazard_description}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Înregistrare Monitorizare (opțional)
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonitoringId}
            onChange={(e) => setSelectedMonitoringId(e.target.value ? parseInt(e.target.value) : '')}
            disabled={!selectedCcpId || monitorings.length === 0}
          >
            <option value="">"nu este legata de o monitorizare specifica"</option>
            {monitorings.map(monitoring => (
              <option key={monitoring.id} value={monitoring.id}>
                {new Date(monitoring.monitored_at).toLocaleString('ro-RO')} - {monitoring.parameter_name}: {monitoring.measured_value} {monitoring.unit} ({monitoring.status})
              </option>
            ))}
          </select>
          {!selectedCcpId && (
            <p className="mt-1 text-xs text-gray-500">"selecteaza mai intai un ccp pentru a vedea monitor"</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Acțiune Întreprinsă <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="descrie actiunea corectiva intreprinsa"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !selectedCcpId || !actionTaken.trim()}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>"se creeaza"</>
          ) : (
            <>
              <i className="fas fa-plus-circle mr-2"></i>"creeaza actiune corectiva"</>
          )}
        </button>
      </form>
    </div>
  );
};




