// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
// AG Grid CSS imported globally with theme="legacy"

interface Reward {
  id: number;
  name: string;
  combinations_required?: number;
  description: string;
  is_active: boolean;
  reward_type?: string;
  points_required?: number;
  discount_percentage?: number;
  discount_fixed?: number;
  free_product_id?: number;
  vip_level_required?: string;
}

export const LoyaltyPage: React.FC = () => {
//   const { t } = useTranslation();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    combinations_required: 1,
    description: '',
    is_active: true
  });
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/loyalty/rewards');
      if (!response.ok) throw new Error('Failed to load rewards');
      
      const data = await response.json();
      setRewards(data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rewardId?: number) => {
    if (rewardId) {
      const reward = rewards.find(r => r.id === rewardId);
      if (reward) {
        setEditingRewardId(rewardId);
        setRewardForm({
          name: reward.name || '',
          combinations_required: reward.combinations_required || 1,
          description: reward.description || '',
          is_active: reward.is_active !== undefined ? reward.is_active : true
        });
      }
    } else {
      setEditingRewardId(null);
      setRewardForm({
        name: '',
        combinations_required: 1,
        description: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRewardId(null);
    setRewardForm({
      name: '',
      combinations_required: 1,
      description: '',
      is_active: true
    });
  };

  const handleSaveReward = async () => {
    try {
      const url = editingRewardId 
        ? `/api/loyalty/rewards/${editingRewardId}`
        : '/api/loyalty/rewards';
      const method = editingRewardId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardForm)
      });

      if (response.ok) {
        handleCloseModal();
        loadRewards();
      } else {
        const errorData = await response.json();
        alert(`Eroare la ${editingRewardId ? 'actualizarea' : 'adăugarea'} recompensei: ${errorData.error || 'Eroare necunoscută'}`);
      }
    } catch (error) {
      console.error(`Error ${editingRewardId ? 'updating' : 'adding'} reward:`, error);
      alert(`Eroare la ${editingRewardId ? 'actualizarea' : 'adăugarea'} recompensei`);
    }
  };

  const handleDeleteReward = async (rewardId: number) => {
    if (!confirm('Sigur doriți să ștergeți această recompensă?')) {
      return;
    }

    try {
      const response = await fetch(`/api/loyalty/rewards/${rewardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadRewards();
      } else {
        const errorData = await response.json();
        alert(`Eroare la ștergerea recompensei: ${errorData.error || 'Eroare necunoscută'}`);
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Eroare la ștergerea recompensei');
    }
  };

  const columnDefs = [
    { field: 'name', headerName: 'Nume Recompensă', width: 200 },
    { field: 'combinations_required', headerName: 'Combinații Necesare', width: 180 },
    { field: "Description", headerName: 'Descriere', width: 300, flex: 1 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => {
        return params.value 
          ? '<span class="badge bg-success">Activ</span>' 
          : '<span class="badge bg-secondary">Inactiv</span>';
      }
    },
    {
      headerName: 'Acțiuni',
      width: 200,
      cellRenderer: (params: any) => {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary me-2';
        editBtn.textContent = 'Editează';
        editBtn.onclick = () => handleOpenModal(params.data.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Șterge';
        deleteBtn.onclick = () => handleDeleteReward(params.data.id);

        const container = document.createElement('div');
        container.appendChild(editBtn);
        container.appendChild(deleteBtn);
        return container;
      }
    }
  ];

  return (
    <div className="padding-20">
      <div className="page-header margin-bottom-20 flex-between">
        <h1><i className="fas fa-gift me-2"></i>Program Loialitate</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-1"></i>"adauga recompensa"</button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          theme="legacy"
          ref={gridRef}
          rowData={rewards}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRewardId ? 'Editează Recompensă' : 'Adaugă Recompensă'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} title="Închide"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">"nume recompensa"</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                    title="Nume recompensă"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">"combinatii necesare"</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={rewardForm.combinations_required}
                    onChange={(e) => setRewardForm({ ...rewardForm, combinations_required: parseInt(e.target.value) || 1 })}
                    title="Combinații necesare"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">"Descriere:"</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                    title="Descriere recompensă"
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={rewardForm.is_active}
                      onChange={(e) => setRewardForm({ ...rewardForm, is_active: e.target.checked })}
                      id="rewardActive"
                    />
                    <label className="form-check-label" htmlFor="rewardActive">
                      Activ
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>"Anulează"</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveReward}>
                  {editingRewardId ? 'Actualizează' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




