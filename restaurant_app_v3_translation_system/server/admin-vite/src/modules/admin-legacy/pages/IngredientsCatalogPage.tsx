import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { 
  Package, 
  Download, 
  Search,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface IngredientTemplate {
  id: number;
  name: string;
  name_en?: string;
  category: string;
  allergens?: string | string[];
  processing_loss_percentage?: number;
  standard_unit: string;
  estimated_cost_per_kg?: number;
  selected?: boolean;
}

interface Allergen {
  id: number;
  code: string;
  name: string;
  description: string;
}

interface Additive {
  id: number;
  e_code: string;
  name: string;
  description: string;
}

export const IngredientsCatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAllergen, setSelectedAllergen] = useState('all');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'allergens' | 'additives'>('ingredients');

  // API state
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [allergensList, setAllergensList] = useState<Allergen[]>([]);
  const [additivesList, setAdditivesList] = useState<Additive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load ingredients from API
  useEffect(() => {
    const loadIngredients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpClient.get('/api/ingredient-catalog');
        if (response.data.success && response.data.ingredients) {
          setIngredientTemplates(response.data.ingredients);
        }
      } catch (err: any) {
        console.error('Error loading ingredients:', err);
        setError(err.message || 'Failed to load ingredients');
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Load allergens from API
  useEffect(() => {
    const loadAllergens = async () => {
      try {
        const response = await httpClient.get('/api/ingredient-catalog/allergens');
        if (response.data.success && response.data.allergens) {
          setAllergensList(response.data.allergens);
        }
      } catch (err) {
        console.error('Error loading allergens:', err);
      }
    };

    loadAllergens();
  }, []);

  // Load additives from API
  useEffect(() => {
    const loadAdditives = async () => {
      try {
        const response = await httpClient.get('/api/ingredient-catalog/additives');
        if (response.data.success && response.data.additives) {
          setAdditivesList(response.data.additives);
        }
      } catch (err) {
        console.error('Error loading additives:', err);
      }
    };

    loadAdditives();
  }, []);

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
      valueFormatter: (params) => {
        const allergens = params.value;
        if (!allergens) return 'Fără';
        if (typeof allergens === 'string') {
          try {
            const parsed = JSON.parse(allergens);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : 'Fără';
          } catch {
            return allergens || 'Fără';
          }
        }
        if (Array.isArray(allergens)) {
          return allergens.length > 0 ? allergens.join(', ') : 'Fără';
        }
        return 'Fără';
      }
    },
    { 
      headerName: 'Deșeu (%)', 
      field: 'processing_loss_percentage', 
      width: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value}%` : '0%',
      cellStyle: (params) => {
        const value = params.value || 0;
        if (value > 10) return { color: '#dc2626', fontWeight: 'bold' };
        if (value > 5) return { color: '#f97316' };
        return { color: '#16a34a' };
      }
    },
    { headerName: 'U.M.', field: 'standard_unit', width: 100 },
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

  const additiveColumns: ColDef[] = [
    { headerName: 'Cod E', field: 'e_code', width: 100 },
    { headerName: 'Nume', field: 'name', flex: 1 },
    { headerName: 'Descriere', field: 'description', flex: 2 },
  ];

  const filteredIngredients = useMemo(() => {
    return ingredientTemplates.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      
      // Parse allergens if they're a string
      let ingredientAllergens: string[] = [];
      if (typeof ingredient.allergens === 'string') {
        try {
          ingredientAllergens = JSON.parse(ingredient.allergens);
        } catch {
          if (ingredient.allergens) ingredientAllergens = [ingredient.allergens];
        }
      } else if (Array.isArray(ingredient.allergens)) {
        ingredientAllergens = ingredient.allergens;
      }
      
      const matchesAllergen = selectedAllergen === 'all' || 
        (selectedAllergen === 'none' ? ingredientAllergens.length === 0 : ingredientAllergens.includes(selectedAllergen));
      return matchesSearch && matchesCategory && matchesAllergen;
    });
  }, [ingredientTemplates, searchTerm, selectedCategory, selectedAllergen]);

  const handleImportIngredient = useCallback(async (id: number) => {
    try {
      const costPerUnit = prompt('Introduceți costul per unitate (RON):');
      const currentStock = prompt('Introduceți stocul curent:');
      
      const response = await httpClient.post(`/api/ingredient-catalog/import/${id}`, {
        cost_per_unit: costPerUnit ? parseFloat(costPerUnit) : undefined,
        current_stock: currentStock ? parseFloat(currentStock) : 0,
        min_stock: 0
      });

      if (response.data.success) {
        alert(response.data.message || 'Ingredientul a fost importat cu succes!');
      }
    } catch (err: any) {
      console.error('Error importing ingredient:', err);
      alert(err.response?.data?.error || 'Eroare la importarea ingredientului');
    }
  }, []);

  const handleViewDetails = useCallback(async (id: number) => {
    try {
      const response = await httpClient.get(`/api/ingredient-catalog/${id}`);
      if (response.data.success) {
        const { ingredient } = response.data;
        alert(`${ingredient.name}\n\nCategorie: ${ingredient.category}\nAlergeni: ${JSON.stringify(ingredient.allergens)}\n\nDetalii complete în consolă`);
        console.log('Ingredient details:', response.data);
      }
    } catch (err) {
      console.error('Error loading ingredient details:', err);
    }
  }, []);

  const handleBulkImport = useCallback(async () => {
    if (selectedRows.length === 0) {
      alert('Selectați cel puțin un ingredient pentru import.');
      return;
    }
    
    const costPerUnit = prompt(`Introduceți costul per unitate pentru ${selectedRows.length} ingrediente (RON):`);
    if (!costPerUnit || parseFloat(costPerUnit) <= 0) {
      alert('Cost invalid');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const id of selectedRows) {
      try {
        await httpClient.post(`/api/ingredient-catalog/import/${id}`, {
          cost_per_unit: parseFloat(costPerUnit),
          current_stock: 0,
          min_stock: 0
        });
        successCount++;
      } catch (err) {
        errorCount++;
        console.error(`Error importing ingredient ${id}:`, err);
      }
    }

    alert(`Import complet!\n${successCount} ingrediente importate cu succes\n${errorCount} erori`);
  }, [selectedRows]);

  const categories = useMemo(() => {
    const cats = ingredientTemplates.map(i => i.category).filter(Boolean);
    return ['all', ...Array.from(new Set(cats))];
  }, [ingredientTemplates]);

  const allergens = useMemo(() => {
    const allAllergens: string[] = [];
    ingredientTemplates.forEach(i => {
      let ingredientAllergens: string[] = [];
      if (typeof i.allergens === 'string') {
        try {
          ingredientAllergens = JSON.parse(i.allergens);
        } catch {
          if (i.allergens) ingredientAllergens = [i.allergens];
        }
      } else if (Array.isArray(i.allergens)) {
        ingredientAllergens = i.allergens;
      }
      allAllergens.push(...ingredientAllergens);
    });
    return ['all', 'none', ...Array.from(new Set(allAllergens))];
  }, [ingredientTemplates]);

  const avgWaste = useMemo(() => {
    if (filteredIngredients.length === 0) return 0;
    const total = filteredIngredients.reduce((acc, i) => acc + (i.processing_loss_percentage || 0), 0);
    return (total / filteredIngredients.length).toFixed(1);
  }, [filteredIngredients]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Eroare</h2>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }

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
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Se încarcă ingredientele...</span>
                </div>
              ) : (
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
              )}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {additivesList.length > 0 ? (
              <div className="ag-theme-alpine" style={{ height: 500 }}>
                <AgGridReact
                  rowData={additivesList}
                  columnDefs={additiveColumns}
                  defaultColDef={{
                    sortable: true,
                    resizable: true,
                  }}
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Catalogul de aditivi este gol.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
