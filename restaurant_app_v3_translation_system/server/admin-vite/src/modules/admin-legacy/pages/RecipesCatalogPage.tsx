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
import { useToast } from '@/shared/hooks/useToast';
import { 
  PriceInputModal, 
  ConfirmationModal,
  BulkImportProgressModal 
} from '../components';
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
  const { showToast } = useToast();
  
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

  // Modal states
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedRecipeForImport, setSelectedRecipeForImport] = useState<RecipeTemplate | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  
  // Bulk import states
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkProgressOpen, setBulkProgressOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ processed: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<Array<{id: number; name: string; success: boolean; error?: string}>>([]);

  // Load recipes from API
  const loadRecipes = useCallback(async () => {
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
      showToast('error', 'Eroare la încărcarea rețetelor');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

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

  const handleImportRecipe = useCallback((id: number) => {
    const recipe = recipeTemplates.find(r => r.id === id);
    if (recipe) {
      setSelectedRecipeForImport(recipe);
      setPriceModalOpen(true);
    }
  }, [recipeTemplates]);

  const handleConfirmImport = useCallback(async (price: number, imageUrl?: string, description?: string) => {
    if (!selectedRecipeForImport) return;

    setImportLoading(true);
    try {
      const response = await httpClient.post(`/api/recipe-templates/import/${selectedRecipeForImport.id}`, {
        price,
        image_url: imageUrl,
        description_custom: description
      });

      if (response.data.success) {
        showToast('success', response.data.message || 'Rețeta a fost importată cu succes!');
        setPriceModalOpen(false);
        setSelectedRecipeForImport(null);
        // Reload recipes to update the list
        await loadRecipes();
      }
    } catch (err: any) {
      console.error('Error importing recipe:', err);
      showToast('error', err.response?.data?.error || 'Eroare la importarea rețetei');
    } finally {
      setImportLoading(false);
    }
  }, [selectedRecipeForImport, showToast, loadRecipes]);

  const handleViewDetails = useCallback(async (id: number) => {
    try {
      const response = await httpClient.get(`/api/recipe-templates/${id}`);
      if (response.data.success) {
        const { template, ingredients } = response.data;
        showToast('info', `${template.name} - ${ingredients.length} ingrediente`);
        console.log('Recipe details:', response.data);
      }
    } catch (err) {
      console.error('Error loading recipe details:', err);
      showToast('error', 'Eroare la încărcarea detaliilor');
    }
  }, [showToast]);

  const handleStartBulkImport = useCallback(() => {
    if (selectedRows.length === 0) {
      showToast('warning', 'Selectați cel puțin o rețetă pentru import.');
      return;
    }
    setBulkConfirmOpen(true);
  }, [selectedRows, showToast]);

  const handleBulkImport = useCallback(async () => {
    setBulkConfirmOpen(false);
    setBulkProgressOpen(true);
    setBulkProgress({ processed: 0, total: selectedRows.length });
    setBulkResults([]);

    const results: Array<{id: number; name: string; success: boolean; error?: string}> = [];
    let processed = 0;

    // Get a default price - in a real implementation, you might want another modal for this
    const defaultPrice = 10; // Or get from first recipe's suggested price

    for (const id of selectedRows) {
      const recipe = recipeTemplates.find(r => r.id === id);
      if (!recipe) continue;

      try {
        const response = await httpClient.post(`/api/recipe-templates/import/${id}`, {
          price: recipe.suggested_price || defaultPrice
        });

        if (response.data.success) {
          results.push({ id, name: recipe.name, success: true });
        }
      } catch (err: any) {
        console.error(`Error importing recipe ${id}:`, err);
        results.push({ 
          id, 
          name: recipe.name, 
          success: false, 
          error: err.response?.data?.error || 'Eroare'
        });
      }

      processed++;
      setBulkProgress({ processed, total: selectedRows.length });
      setBulkResults([...results]);
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    showToast(
      errorCount > 0 ? 'warning' : 'success',
      `Import complet: ${successCount} succes, ${errorCount} erori`
    );

    // Reload recipes after bulk import
    await loadRecipes();
  }, [selectedRows, recipeTemplates, showToast, loadRecipes]);

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
                  onClick={handleStartBulkImport}
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

      {/* Modals */}
      <PriceInputModal
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setSelectedRecipeForImport(null);
        }}
        onConfirm={handleConfirmImport}
        recipeName={selectedRecipeForImport?.name || ''}
        suggestedPrice={selectedRecipeForImport?.suggested_price}
        loading={importLoading}
      />

      <ConfirmationModal
        isOpen={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkImport}
        title="Confirmare Import Bulk"
        message={`Doriți să importați ${selectedRows.length} rețete în meniu? Fiecare va folosi prețul sugerat.`}
        confirmText="Importă"
        type="info"
      />

      <BulkImportProgressModal
        isOpen={bulkProgressOpen}
        onClose={() => {
          setBulkProgressOpen(false);
          setBulkResults([]);
          setBulkProgress({ processed: 0, total: 0 });
        }}
        title="Import Rețete în Meniu"
        totalItems={bulkProgress.total}
        processedItems={bulkProgress.processed}
        results={bulkResults}
        isComplete={bulkProgress.processed === bulkProgress.total && bulkProgress.total > 0}
      />
    </div>
  );
};
