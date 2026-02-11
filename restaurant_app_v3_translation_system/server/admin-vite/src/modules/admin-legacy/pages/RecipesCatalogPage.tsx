import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RecipeTemplate {
  id: number;
  name: string;
  industry: string;
  allergens: string[];
  margin: number;
  category: string;
  selected?: boolean;
}

export const RecipesCatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedAllergen, setSelectedAllergen] = useState('all');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'allergens' | 'additives'>('recipes');

  // Mock data - in production, this would come from API
  const recipeTemplates: RecipeTemplate[] = [
    { id: 1, name: 'Pizza Margherita', industry: 'Italian', allergens: ['Gluten', 'Lactose'], margin: 65, category: 'Main Course' },
    { id: 2, name: 'Caesar Salad', industry: 'American', allergens: ['Gluten', 'Eggs'], margin: 70, category: 'Appetizer' },
    { id: 3, name: 'Burger Clasic', industry: 'Fast Food', allergens: ['Gluten', 'Lactose'], margin: 60, category: 'Main Course' },
    { id: 4, name: 'Pasta Carbonara', industry: 'Italian', allergens: ['Gluten', 'Eggs', 'Lactose'], margin: 68, category: 'Main Course' },
    { id: 5, name: 'Sushi Roll', industry: 'Japanese', allergens: ['Fish', 'Soy'], margin: 75, category: 'Main Course' },
  ];

  const allergensList = [
    { id: 1, code: 'A1', name: 'Cereale cu gluten', description: 'Grâu, secară, orz, ovăz, etc.' },
    { id: 2, code: 'A2', name: 'Crustacee', description: 'Creveți, crabi, homari, etc.' },
    { id: 3, code: 'A3', name: 'Ouă', description: 'Ouă și produse din ouă' },
    { id: 4, code: 'A4', name: 'Pește', description: 'Pește și produse din pește' },
    { id: 5, code: 'A7', name: 'Lapte', description: 'Lapte și produse lactate (incl. lactoză)' },
  ];

  const columnDefs: ColDef<RecipeTemplate>[] = [
    {
      headerName: '',
      field: 'selected',
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
    },
    { headerName: 'ID', field: 'id', width: 80, filter: true },
    { headerName: 'Nume Rețetă', field: 'name', flex: 1, filter: true, sortable: true },
    { headerName: 'Industrie', field: 'industry', width: 150, filter: true, sortable: true },
    { 
      headerName: 'Alergeni', 
      field: 'allergens',
      width: 200,
      valueFormatter: (params) => params.value.join(', ')
    },
    { 
      headerName: 'Marjă (%)', 
      field: 'margin', 
      width: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${params.value}%`
    },
    {
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center h-full">
          <button
            onClick={() => handleImportRecipe(params.data.id)}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
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

  const filteredRecipes = useMemo(() => {
    return recipeTemplates.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || recipe.industry === selectedIndustry;
      const matchesAllergen = selectedAllergen === 'all' || recipe.allergens.includes(selectedAllergen);
      return matchesSearch && matchesIndustry && matchesAllergen;
    });
  }, [searchTerm, selectedIndustry, selectedAllergen]);

  const handleImportRecipe = useCallback((id: number) => {
    console.log('Importing recipe:', id);
    // API call would go here
    alert(`Rețeta ${id} a fost importată cu succes!`);
  }, []);

  const handleViewDetails = useCallback((id: number) => {
    console.log('Viewing details for:', id);
  }, []);

  const handleBulkImport = useCallback(() => {
    if (selectedRows.length === 0) {
      alert('Selectați cel puțin o rețetă pentru import.');
      return;
    }
    console.log('Bulk importing:', selectedRows);
    alert(`${selectedRows.length} rețete au fost importate cu succes!`);
  }, [selectedRows]);

  const industries = ['all', ...Array.from(new Set(recipeTemplates.map(r => r.industry)))];
  const allergens = ['all', ...Array.from(new Set(recipeTemplates.flatMap(r => r.allergens)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-600" />
                Catalog Rețete Template
              </h1>
              <p className="mt-2 text-gray-600">
                Importați rețete pre-configurate în sistemul dvs.
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
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'recipes'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rețete ({filteredRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('allergens')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'allergens'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alergeni ({allergensList.length})
          </button>
          <button
            onClick={() => setActiveTab('additives')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'additives'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aditivi
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'recipes' && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Caută rețete..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry === 'all' ? 'Toate Industriile' : industry}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAllergen}
                  onChange={(e) => setSelectedAllergen(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {allergens.map(allergen => (
                    <option key={allergen} value={allergen}>
                      {allergen === 'all' ? 'Toți Alergenii' : allergen}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkImport}
                  disabled={selectedRows.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Import Selectate ({selectedRows.length})
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Total Rețete</div>
                <div className="text-2xl font-bold text-purple-600">{recipeTemplates.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Filtrate</div>
                <div className="text-2xl font-bold text-blue-600">{filteredRecipes.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Selectate</div>
                <div className="text-2xl font-bold text-green-600">{selectedRows.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Marjă Medie</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(recipeTemplates.reduce((acc, r) => acc + r.margin, 0) / recipeTemplates.length).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* AG Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="ag-theme-alpine" style={{ height: 500 }}>
                <AgGridReact
                  rowData={filteredRecipes}
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
