import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { 
  BookOpen, 
  Download, 
  Search,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RecipeTemplate {
  id: number;
  name: string;
  name_en?: string;
  category: string;
  category_en?: string;
  allergens?: string | string[];
  template_category?: string;
  cuisine_type?: string;
  suggested_price?: number;
  estimated_cost?: number;
  selected?: boolean;
}

interface Allergen {
  id: number;
  code: string;
  name: string;
  description: string;
}

export const RecipesCatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAllergen, setSelectedAllergen] = useState('all');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'allergens' | 'additives'>('recipes');
  
  // API state
  const [recipeTemplates, setRecipeTemplates] = useState<RecipeTemplate[]>([]);
  const [allergensList, setAllergensList] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recipes from API
  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpClient.get('/api/recipe-templates');
        if (response.data.success && response.data.recipes) {
          setRecipeTemplates(response.data.recipes);
        }
      } catch (err: any) {
        console.error('Error loading recipes:', err);
        setError(err.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
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
    { headerName: 'Categorie', field: 'category', width: 150, filter: true, sortable: true },
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
            return Array.isArray(parsed) ? parsed.join(', ') : allergens;
          } catch {
            return allergens;
          }
        }
        if (Array.isArray(allergens)) {
          return allergens.join(', ');
        }
        return 'Fără';
      }
    },
    { 
      headerName: 'Preț estimat', 
      field: 'suggested_price', 
      width: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value.toFixed(2)} RON` : 'N/A'
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
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      
      // Parse allergens if they're a string
      let recipeAllergens: string[] = [];
      if (typeof recipe.allergens === 'string') {
        try {
          recipeAllergens = JSON.parse(recipe.allergens);
        } catch {
          recipeAllergens = recipe.allergens ? [recipe.allergens] : [];
        }
      } else if (Array.isArray(recipe.allergens)) {
        recipeAllergens = recipe.allergens;
      }
      
      const matchesAllergen = selectedAllergen === 'all' || recipeAllergens.includes(selectedAllergen);
      return matchesSearch && matchesCategory && matchesAllergen;
    });
  }, [recipeTemplates, searchTerm, selectedCategory, selectedAllergen]);

  const handleImportRecipe = useCallback(async (id: number) => {
    try {
      // In a real implementation, you'd show a modal to get the price
      const price = prompt('Introduceți prețul de vânzare (RON):');
      if (!price || parseFloat(price) <= 0) {
        alert('Preț invalid');
        return;
      }

      const response = await httpClient.post(`/api/recipe-templates/import/${id}`, {
        price: parseFloat(price)
      });

      if (response.data.success) {
        alert(response.data.message || 'Rețeta a fost importată cu succes!');
      }
    } catch (err: any) {
      console.error('Error importing recipe:', err);
      alert(err.response?.data?.error || 'Eroare la importarea rețetei');
    }
  }, []);

  const handleViewDetails = useCallback(async (id: number) => {
    try {
      const response = await httpClient.get(`/api/recipe-templates/${id}`);
      if (response.data.success) {
        const { template, ingredients } = response.data;
        alert(`${template.name}\n\nIngrediente: ${ingredients.length}\n\nDetalii complete în consolă`);
        console.log('Recipe details:', response.data);
      }
    } catch (err) {
      console.error('Error loading recipe details:', err);
    }
  }, []);

  const handleBulkImport = useCallback(async () => {
    if (selectedRows.length === 0) {
      alert('Selectați cel puțin o rețetă pentru import.');
      return;
    }
    
    const price = prompt(`Introduceți prețul pentru ${selectedRows.length} rețete (RON):`);
    if (!price || parseFloat(price) <= 0) {
      alert('Preț invalid');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const id of selectedRows) {
      try {
        await httpClient.post(`/api/recipe-templates/import/${id}`, {
          price: parseFloat(price)
        });
        successCount++;
      } catch (err) {
        errorCount++;
        console.error(`Error importing recipe ${id}:`, err);
      }
    }

    alert(`Import complet!\n${successCount} rețete importate cu succes\n${errorCount} erori`);
  }, [selectedRows]);

  const categories = useMemo(() => {
    const cats = recipeTemplates.map(r => r.category).filter(Boolean);
    return ['all', ...Array.from(new Set(cats))];
  }, [recipeTemplates]);

  const allergens = useMemo(() => {
    const allAllergens: string[] = [];
    recipeTemplates.forEach(r => {
      let recipeAllergens: string[] = [];
      if (typeof r.allergens === 'string') {
        try {
          recipeAllergens = JSON.parse(r.allergens);
        } catch {
          if (r.allergens) recipeAllergens = [r.allergens];
        }
      } else if (Array.isArray(r.allergens)) {
        recipeAllergens = r.allergens;
      }
      allAllergens.push(...recipeAllergens);
    });
    return ['all', ...Array.from(new Set(allAllergens))];
  }, [recipeTemplates]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Eroare</h2>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }

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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <div className="text-sm text-gray-600 mb-1">Preț mediu estimat</div>
                <div className="text-2xl font-bold text-orange-600">
                  {recipeTemplates.length > 0
                    ? (recipeTemplates.reduce((acc, r) => acc + (r.suggested_price || 0), 0) / recipeTemplates.length).toFixed(2)
                    : '0.00'} RON
                </div>
              </div>
            </div>

            {/* AG Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Se încarcă rețetele...</span>
                </div>
              ) : (
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Catalogul de aditivi va fi disponibil în curând.</p>
          </div>
        )}
      </div>
    </div>
  );
};
