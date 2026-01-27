
// ============================================================================
// CONFIGURARE CORECTĂ AXIOS/FETCH ÎN FRONTEND
// ============================================================================

// Opțiunea 1: Configurare Axios globală (RECOMANDAT)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
  },
});

// Export pentru folosire în componente
export default api;

// Folosire în componente:
// import api from './services/api';
// const { data } = await api.get('/products');

// ============================================================================

// Opțiunea 2: Fetch API nativ
async function getProducts() {
  const response = await fetch('http://localhost:3001/api/products', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });

  // Asigură-te că răspunsul e interpretat ca UTF-8
  const text = await response.text();
  const data = JSON.parse(text);

  return data;
}

// ============================================================================
// EXEMPLU COMPONENTĂ REACT CU AG GRID
// ============================================================================

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import api from './services/api';

function ProductsGrid() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columnDefs = [
    {
      field: 'denumire',
      headerName: 'Denumire Produs',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'pret',
      headerName: 'Preț',
      valueFormatter: params => params.value + ' Lei'
    },
    {
      field: 'descriere',
      headerName: 'Descriere'
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Folosește API-ul configurat cu UTF-8
      const response = await api.get('/products');

      // Verifică în consolă că datele sunt corecte
      console.log('Date primite:', response.data);
      console.log('Primul produs:', response.data[0]?.denumire);

      setRowData(response.data);
    } catch (error) {
      console.error('Eroare încărcare date:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        pagination={true}
        paginationPageSize={20}
      />
    </div>
  );
}

export default ProductsGrid;

// ============================================================================
// EXEMPLU COMPONENTĂ DASHBOARD EXECUTIVE
// ============================================================================

function DashboardExecutive() {
  const [vanzariAstazi, setVanzariAstazi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVanzari();
  }, []);

  const loadVanzari = async () => {
    try {
      setLoading(true);

      // Request cu encoding corect
      const response = await api.get('/vanzari-astazi');

      // Verifică în consolă
      console.log('✅ Vânzări primite:', response.data);

      setVanzariAstazi(response.data);
    } catch (error) {
      console.error('❌ Eroare:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Se încarcă...</div>;

  return (
    <div className="dashboard">
      <h2>Vânzări Astăzi</h2>
      <div className="stat-card">
        <p>Total: {vanzariAstazi?.total_vanzari || 0} Lei</p>
        <p>Comenzi: {vanzariAstazi?.numar_comenzi || 0}</p>
      </div>
    </div>
  );
}
