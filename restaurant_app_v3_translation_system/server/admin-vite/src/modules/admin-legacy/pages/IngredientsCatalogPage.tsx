import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { 
  Package, 
  Download, 
  Search,
  AlertCircle
} from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface IngredientTemplate {
  id: number;
  name: string;
  category: string;
  allergens: string[];
  wastePercent: number;
  unit: string;
  selected?: boolean;
}

export const IngredientsCatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAllergen, setSelectedAllergen] = useState('all');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'allergens' | 'additives'>('ingredients');

  // Mock data - in production, this would come from API
  const ingredientTemplates: IngredientTemplate[] = [
    { id: 1, name: 'Făină albă tip 000', category: 'Cereale', allergens: ['Gluten'], wastePercent: 2, unit: 'kg' },
    { id: 2, name: 'Lapte 3.5% grăsime', category: 'Lactate', allergens: ['Lactose'], wastePercent: 5, unit: 'L' },
    { id: 3, name: 'Ouă categoria A', category: 'Ouă și derivate', allergens: ['Eggs'], wastePercent: 10, unit: 'buc' },
    { id: 4, name: 'Roșii proaspete', category: 'Legume', allergens: [], wastePercent: 15, unit: 'kg' },
    { id: 5, name: 'Mozzarella', category: 'Lactate', allergens: ['Lactose'], wastePercent: 3, unit: 'kg' },
    { id: 6, name: 'Ulei de măsline', category: 'Uleiuri', allergens: [], wastePercent: 1, unit: 'L' },
    { id: 7, name: 'Pui dezzosat', category: 'Carne', allergens: [], wastePercent: 8, unit: 'kg' },
    { id: 8, name: 'Somon file', category: 'Pește', allergens: ['Fish'], wastePercent: 12, unit: 'kg' },
  ];

  const allergensList = [
    { id: 1, code: 'A1', name: 'Cereale cu gluten', description: 'Grâu, secară, orz, ovăz, etc.' },
    { id: 2, code: 'A2', name: 'Crustacee', description: 'Creveți, crabi, homari, etc.' },
    { id: 3, code: 'A3', name: 'Ouă', description: 'Ouă și produse din ouă' },
    { id: 4, code: 'A4', name: 'Pește', description: 'Pește și produse din pește' },
    { id: 5, code: 'A7', name: 'Lapte', description: 'Lapte și produse lactate (incl. lactoză)' },
  ];

  const columnDefs: ColDef<IngredientTemplate>[] = [
    {
      headerName: '',
      field: 'selected',
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
    },
    { headerName: 'ID', field: 'id', width: 80, filter: true },
    { headerName: 'Nume Ingredient', field: 'name', flex: 1, filter: true, sortable: true },
    { headerName: 'Categorie', field: 'category', width: 180, filter: true, sortable: true },
    { 
      headerName: 'Alergeni', 
      field: 'allergens',
      width: 200,
      valueFormatter: (params) => params.value.length > 0 ? params.value.join(', ') : 'Fără'
    },
    { 
      headerName: 'Deșeu (%)', 
      field: 'wastePercent', 
      width: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${params.value}%`,
      cellStyle: (params) => {
        if (params.value > 10) return { color: '#dc2626', fontWeight: 'bold' };
        if (params.value > 5) return { color: '#f97316' };
        return { color: '#16a34a' };
      }
    },
    { headerName: 'U.M.', field: 'unit', width: 100 },
    {
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center h-full">
          <button
            onClick={() => handleImportIngredient(params.data.id)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Import
          </button>
          <button
            onClick={() => handleViewDetails(params.data.id)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Detalii
          </button>
        </div>
      ),
    },
  ];

  const allergenColumns: ColDef[] = [
    { headerName: 'Cod', field: 'code', width: 100 },
    { headerName: 'Nume', field: 'name', flex: 1 },
    { headerName: 'Descriere', field: 'description', flex: 2 },
  ];

  const filteredIngredients = useMemo(() => {
    return ingredientTemplates.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      const matchesAllergen = selectedAllergen === 'all' || 
        (selectedAllergen === 'none' ? ingredient.allergens.length === 0 : ingredient.allergens.includes(selectedAllergen));
      return matchesSearch && matchesCategory && matchesAllergen;
    });
  }, [searchTerm, selectedCategory, selectedAllergen]);

  const handleImportIngredient = useCallback((id: number) => {
    console.log('Importing ingredient:', id);
    // TODO: Replace with API call and toast notification system
    // API call would go here
    alert(`Ingredientul ${id} a fost importat cu succes!`);
  }, []);

  const handleViewDetails = useCallback((id: number) => {
    console.log('Viewing details for:', id);
  }, []);

  const handleBulkImport = useCallback(() => {
    if (selectedRows.length === 0) {
      // TODO: Replace with toast notification system
      alert('Selectați cel puțin un ingredient pentru import.');
      return;
    }
    console.log('Bulk importing:', selectedRows);
    // TODO: Replace with API call and toast notification system
    alert(`${selectedRows.length} ingrediente au fost importate cu succes!`);
  }, [selectedRows]);

  const categories = ['all', ...Array.from(new Set(ingredientTemplates.map(i => i.category)))];
  const allergens = ['all', 'none', ...Array.from(new Set(ingredientTemplates.flatMap(i => i.allergens)))];

  const avgWaste = (filteredIngredients.reduce((acc, i) => acc + i.wastePercent, 0) / 
    (filteredIngredients.length || 1)).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Catalog Ingrediente Master
              </h1>
              <p className="mt-2 text-gray-600">
                Baza de date centrală de ingrediente pentru import
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'ingredients'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ingrediente ({filteredIngredients.length})
          </button>
          <button
            onClick={() => setActiveTab('allergens')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'allergens'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alergeni ({allergensList.length})
          </button>
          <button
            onClick={() => setActiveTab('additives')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'additives'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aditivi
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'ingredients' && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Caută ingrediente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Toate Categoriile' : category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAllergen}
                  onChange={(e) => setSelectedAllergen(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toți Alergenii</option>
                  <option value="none">Fără Alergeni</option>
                  {allergens.filter(a => a !== 'all' && a !== 'none').map(allergen => (
                    <option key={allergen} value={allergen}>
                      {allergen}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkImport}
                  disabled={selectedRows.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Import Selectate ({selectedRows.length})
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Total Ingrediente</div>
                <div className="text-2xl font-bold text-blue-600">{ingredientTemplates.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Filtrate</div>
                <div className="text-2xl font-bold text-cyan-600">{filteredIngredients.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Selectate</div>
                <div className="text-2xl font-bold text-green-600">{selectedRows.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Deșeu Mediu</div>
                <div className="text-2xl font-bold text-orange-600">{avgWaste}%</div>
              </div>
            </div>

            {/* AG Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="ag-theme-alpine" style={{ height: 500 }}>
                <AgGridReact
                  rowData={filteredIngredients}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    sortable: true,
                    resizable: true,
                  }}
                  rowSelection="multiple"
                  onSelectionChanged={(event) => {
                    const selectedNodes = event.api.getSelectedNodes();
                    setSelectedRows(selectedNodes.map(node => node.data.id));
                  }}
                  pagination={true}
                  paginationPageSize={10}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'allergens' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="ag-theme-alpine" style={{ height: 500 }}>
              <AgGridReact
                rowData={allergensList}
                columnDefs={allergenColumns}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'additives' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Catalogul de aditivi va fi disponibil în curând.</p>
          </div>
        )}
      </div>
    </div>
  );
};
