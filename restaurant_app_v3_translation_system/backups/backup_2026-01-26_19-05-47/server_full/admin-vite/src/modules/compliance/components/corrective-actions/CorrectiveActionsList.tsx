// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { haccpService } from '../../services/haccp.service';
import type { CorrectiveAction } from '../../services/haccp.service';
import { ActionStatusBadge } from './ActionStatusBadge';

interface CorrectiveActionsListProps {
  filter: 'all' | "Pending:" | 'resolved';
  onResolve?: (actionId: number) => void;
  refreshTrigger?: number;
}

export const CorrectiveActionsList: React.FC<CorrectiveActionsListProps> = ({ 
  filter, 
  onResolve,
  refreshTrigger 
}) => {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<string>('');

  useEffect(() => {
    loadActions();
  }, [filter, refreshTrigger]);

  const loadActions = async () => {
//   const { t } = useTranslation();
    try {
      setLoading(true);
      const data = await haccpService.getAllCorrectiveActions({
        resolved: filter === 'resolved' ? true : filter === "Pending:" ? false : undefined,
        limit: 100
      });
      setActions(data);
    } catch (error) {
      console.error('Error loading corrective actions:', error);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClick = (actionId: number) => {
    setSelectedActionId(actionId);
    setResolveModalOpen(true);
    setVerificationNotes('');
  };

  const handleResolveSubmit = async () => {
    if (!selectedActionId || !verificationNotes.trim()) {
      alert('Notele de verificare sunt obligatorii');
      return;
    }

    try {
      setResolvingId(selectedActionId);
      await haccpService.resolveCorrectiveAction(selectedActionId, verificationNotes.trim());
      setResolveModalOpen(false);
      setSelectedActionId(null);
      setVerificationNotes('');
      loadActions();
      onResolve?.(selectedActionId);
    } catch (error: any) {
      alert('Eroare la rezolvarea acțiunii: ' + (error.message || 'Eroare necunoscută'));
    } finally {
      setResolvingId(null);
    }
  };

  const filteredActions = actions.filter(action => {
    if (filter === "Pending:") return !action.resolved;
    if (filter === 'resolved') return action.resolved;
    return true;
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {filter === "Pending:" ? 'Acțiuni În Așteptare' : 
             filter === 'resolved' ? 'Acțiuni Rezolvate' : 
             'Toate Acțiunile Corective'}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
            <p className="mt-2 text-gray-500">"se incarca"</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
            <p>"nu exista actiuni corective"</p>
            <p className="text-sm mt-2 opacity-75">
              {filter === "Pending:" ? 'Toate acțiunile au fost rezolvate' : 
               filter === 'resolved' ? 'Nu există acțiuni rezolvate' : 
               'Creează o acțiune corectivă pentru a începe'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActions.map((action) => (
              <div
                key={action.id}
                className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">Acțiune #{action.id}</span>
                      <ActionStatusBadge resolved={action.resolved} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <i className="fas fa-calendar mr-1"></i>
                      Creată: {new Date(action.created_at).toLocaleString('ro-RO')}
                      {action.taken_at && (
                        <>
                          ' | '
                          <i className="fas fa-user-clock mr-1"></i>
                          Acțiune întreprinsă: {new Date(action.taken_at).toLocaleString('ro-RO')}
                        </>
                      )}
                    </p>
                  </div>
                  {!action.resolved && (
                    <button
                      onClick={() => handleResolveClick(action.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      disabled={resolvingId === action.id}
                    >
                      <i className="fas fa-check mr-1"></i>"Rezolvă"</button>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">"actiune intreprinsa"</p>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{action.action_taken}</p>
                </div>

                {action.verification_notes && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">"note de verificare"</p>
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">{action.verification_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">"rezolva actiune corectiva"</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note de Verificare <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="descrie verificarea si confirmarea rezolvarii"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setResolveModalOpen(false);
                  setSelectedActionId(null);
                  setVerificationNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >"Anulează"</button>
              <button
                onClick={handleResolveSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={!verificationNotes.trim() || resolvingId !== null}
              >
                {resolvingId ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>"se rezolva"</>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>"confirma rezolvarea"</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};




