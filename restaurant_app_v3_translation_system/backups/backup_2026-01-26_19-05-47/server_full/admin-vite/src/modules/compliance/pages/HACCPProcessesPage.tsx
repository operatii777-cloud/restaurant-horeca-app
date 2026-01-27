// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { haccpService } from '../services/haccp.service';
import type { Process, CCP, Limit } from '../services/haccp.service';
import { ProcessCard } from '../components/processes/ProcessCard';
import { CCPCard } from '../components/processes/CCPCard';
import { CCPLimitsTable } from '../components/processes/CCPLimitsTable';

export const HACCPProcessesPage: React.FC = () => {
//   const { t } = useTranslation();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [ccps, setCcps] = useState<CCP[]>([]);
  const [selectedCcp, setSelectedCcp] = useState<CCP | null>(null);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCcps, setLoadingCcps] = useState(false);
  const [loadingLimits, setLoadingLimits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await haccpService.getAllProcesses();
      setProcesses(data);
    } catch (err: any) {
      setError('Eroare la încărcarea proceselor: ' + (err.message || 'Eroare necunoscută'));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClick = async (process: Process) => {
    setSelectedProcess(process);
    setSelectedCcp(null);
    setLimits([]);
    setSidebarOpen(true);
    
    try {
      setLoadingCcps(true);
      const ccpsData = await haccpService.getCCPsByProcess(process.id);
      setCcps(ccpsData);
    } catch (err: any) {
      setError('Eroare la încărcarea CCP-urilor: ' + (err.message || 'Eroare necunoscută'));
    } finally {
      setLoadingCcps(false);
    }
  };

  const handleCcpClick = async (ccp: CCP) => {
    setSelectedCcp(ccp);
    try {
      setLoadingLimits(true);
      const limitsData = await haccpService.getLimitsByCCP(ccp.id);
      setLimits(limitsData);
    } catch (err: any) {
      setError('Eroare la încărcarea limitelor: ' + (err.message || 'Eroare necunoscută'));
    } finally {
      setLoadingLimits(false);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedProcess(null);
    setSelectedCcp(null);
    setCcps([]);
    setLimits([]);
  };

  const groupedProcesses = processes.reduce((acc, process) => {
    if (!acc[process.category]) {
      acc[process.category] = [];
    }
    acc[process.category].push(process);
    return acc;
  }, {} as Record<string, Process[]>);

  const categoryLabels: Record<string, string> = {
    receiving: 'Recepție',
    storage: 'Stocare',
    preparation: 'Preparare',
    cooking: 'Gătire',
    serving: 'Servire'
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">"se incarca procesele haccp"</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Procese HACCP</h1>
        <p className="text-gray-600 mt-1">"gestionarea proceselor si punctelor critice de con"</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Process Groups */}
      <div className="space-y-6">
        {Object.entries(groupedProcesses).map(([category, categoryProcesses]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProcesses.map(process => (
                <ProcessCard
                  key={process.id}
                  process={process}
                  onClick={handleProcessClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar for CCPs and Limits */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-full max-w-4xl ml-auto h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProcess?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedProcess?.description || 'Fără descriere'}
                  </p>
                </div>
                <button
                  onClick={closeSidebar}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  title="Închide"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* CCPs List */}
              {!selectedCcp && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Puncte Critice de Control (CCP)</h3>
                  {loadingCcps ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                      <p className="mt-2 text-gray-500">"se incarca ccp urile"</p>
                    </div>
                  ) : ccps.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                      <p>"nu exista ccp uri definite pentru acest proces"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ccps.map(ccp => (
                        <CCPCard
                          key={ccp.id}
                          ccp={ccp}
                          onClick={handleCcpClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Limits View */}
              {selectedCcp && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedCcp(null);
                          setLimits([]);
                        }}
                        className="text-blue-600 hover:text-blue-800 mb-2"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>"inapoi la ccp uri"</button>
                      <h3 className="text-xl font-semibold">{selectedCcp.ccp_number}</h3>
                      <p className="text-gray-600 mt-1">{selectedCcp.hazard_description}</p>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold mb-4">"limite definite"</h4>
                  {loadingLimits ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                      <p className="mt-2 text-gray-500">"se incarca limitele"</p>
                    </div>
                  ) : (
                    <CCPLimitsTable limits={limits} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




