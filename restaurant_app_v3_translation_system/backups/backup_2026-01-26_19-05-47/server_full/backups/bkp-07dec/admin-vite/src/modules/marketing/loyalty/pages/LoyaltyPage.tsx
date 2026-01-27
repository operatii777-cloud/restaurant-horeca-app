import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface Reward {
  id: number;
  name: string;
  combinations_required: number;
  description: string;
  is_active: boolean;
}

export const LoyaltyPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    combinations_required: 1,
    description: '',
    is_active: true
  });

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

  const handleAddReward = async () => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReward)
      });

      if (response.ok) {
        setShowModal(false);
        setNewReward({ name: '', combinations_required: 1, description: '', is_active: true });
        loadRewards();
      } else {
        alert('Eroare la adăugarea recompensei');
      }
    } catch (error) {
      console.error('Error adding reward:', error);
      alert('Eroare la adăugarea recompensei');
    }
  };

  const columnDefs = [
    { field: 'name', headerName: 'Nume Recompensă', width: 200 },
    { field: 'combinations_required', headerName: 'Combinații Necesare', width: 180 },
    { field: 'description', headerName: 'Descriere', width: 300 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => {
        return params.value ? '<span class="badge bg-success">Activ</span>' : '<span class="badge bg-secondary">Inactiv</span>';
      }
    },
    {
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => {
        return `
          <button class="btn btn-sm btn-primary" onclick="window.editReward(${params.data.id})">Editează</button>
        `;
      }
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1><i className="fas fa-gift me-2"></i>Program Loialitate</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-1"></i>Adaugă Recompensă
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={rewards}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adaugă Recompensă</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nume Recompensă:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Combinații Necesare:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newReward.combinations_required}
                    onChange={(e) => setNewReward({ ...newReward, combinations_required: parseInt(e.target.value) })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descriere:</label>
                  <textarea
                    className="form-control"
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Anulează</button>
                <button type="button" className="btn btn-primary" onClick={handleAddReward}>Salvează</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

