// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useRecipeDetails } from '@/modules/recipes/hooks/useRecipeDetails';
import { useIngredientsCatalog } from '@/modules/recipes/hooks/useIngredientsCatalog';
import { httpClient } from '@/shared/api/httpClient';
import { RecipeVersionHistory } from './RecipeVersionHistory';
import { NutritionSearchModal } from './NutritionSearchModal';
import { convertToGrams, canConvertToGrams } from '../utils/unitConverter';
import type { RecipeProductSummary } from '@/types/recipes';
import './RecipeEditorModal.css';

type EditableIngredient = {
  name: string;
  ingredientId?: number;
  recipeId?: number;  // ✅ Sub-rețetă
  quantity: string;
  unit: string;
  wastePercentage: string;
  variableConsumption: string;
  itemType: 'ingredient' | 'packaging' | 'recipe';  // ✅ Adăugat 'recipe'
};

type RecipeEditorModalProps = {
  open: boolean;
  product: RecipeProductSummary | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const EMPTY_ROW: EditableIngredient = {
  name: '',
  quantity: '',
  unit: '',
  wastePercentage: '0',
  variableConsumption: '',
  itemType: 'ingredient',
};

export function RecipeEditorModal({ open, product, onClose, onSaved }: RecipeEditorModalProps) {
  //   const { t } = useTranslation();
  console.log('RecipeEditorModal Render - open:', open, 'product:', product);
  const productId = product?.product_id ?? null;
  const { productName, ingredients, loading, error, refetch } = useRecipeDetails(productId, open);
  console.log('RecipeEditorModal productId:', productId, 'productName:', productName, 'ingredients:', ingredients.length);
  const { ingredients: catalogIngredients } = useIngredientsCatalog();
  const { mutate, loading: saving, error: saveError, reset } = useApiMutation<{ message?: string }>();
  const [rows, setRows] = useState<EditableIngredient[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<{
    value: number;
    totalCost: number;
    margin: number;
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // ✅ Servings state
  const [servings, setServings] = useState<number>(1);
  const [servingsLoading, setServingsLoading] = useState(false);

  // ✅ SĂPTĂMÂNA 1 - ZIUA 2: Fetch preparations (sub-rețete)
  const [preparations, setPreparations] = useState<Array<{ id: number; name: string; name_en?: string }>>([]);
  const [preparationsLoading, setPreparationsLoading] = useState(false);

  // ✅ TASK 3: Recipe Versioning
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [recipeId, setRecipeId] = useState<number | null>(null);

  // ✅ Nutrition Search & Auto-calculation
  const [nutritionSearchOpen, setNutritionSearchOpen] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState<{
    energy_kcal: number;
    energy_kj: number;
    protein: number;
    carbs: number;
    sugars: number;
    fat: number;
    saturated_fat: number;
    fiber: number;
    salt: number;
  } | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  /**
   * Încarcă servings-ul pentru produs
   */
  const fetchServingsFromProduct = async (productId: number) => {
    setServingsLoading(true);
    try {
      const response = await httpClient.get(`/api/catalog-produse/products/${productId}`);
      const productData = response.data?.data || response.data;
      const productServings = productData?.servings || product?.servings || 1;
      setServings(productServings);
    } catch (error: any) {
      console.error('Error fetching servings:', error);
      // Fallback la valoarea din product sau 1
      setServings(product?.servings || 1);
    } finally {
      setServingsLoading(false);
    }
  };

  /**
   * Salvează servings-ul pentru produs
   */
  const saveServingsToProduct = async (productId: number, newServings: number) => {
    try {
      await httpClient.patch(`/api/catalog-produse/products/${productId}`, {
        servings: newServings
      });
      console.log(`Servings saved: ${newServings} for product ${productId}`);
    } catch (error: any) {
      console.error('Error saving servings:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (open) {
      // ✅ TASK 3: Get recipe_id for versioning
      if (productId) {
        httpClient
          .get(`/api/recipes/product/${productId}`)
          .then((response) => {
            const recipes = response.data?.data || response.data || [];
            if (Array.isArray(recipes) && recipes.length > 0) {
              const firstRecipeId = recipes[0]?.id || recipes[0]?.recipe_id;
              if (firstRecipeId) {
                setRecipeId(firstRecipeId);
              }
            }
          })
          .catch((err) => {
            console.error('Error fetching recipe for versioning:', err);
          });
      }

      // Fetch preparations (DEBUG ADDED)
      setPreparationsLoading(true);
      fetch('/api/recipes/preparations')
        .then(res => res.json())
        .then(data => {
          console.log('RecipeEditorModal: Fetched preparations:', data);
          if (data && data.preparations && Array.isArray(data.preparations)) {
            setPreparations(data.preparations);
          } else if (Array.isArray(data)) {
            setPreparations(data);
          } else {
            console.warn('RecipeEditorModal: Unexpected preparations data format', data);
            setPreparations([]);
          }
        })
        .catch(err => {
          console.error('RecipeEditorModal: Error fetching preparations:', err);
          setPreparations([]);
        })
        .finally(() => setPreparationsLoading(false));

      // Fetch servings from product
      if (productId) {
        fetchServingsFromProduct(productId);
      } else {
        setServings(product?.servings || 1);
      }
    }
  }, [open, productId, product]);

  useEffect(() => {
    if (open) {
      reset();
      setLocalError(null);
      setSuggestedPrice(null);
      if (ingredients.length > 0) {
        setRows(
          ingredients.map((ingredient) => {
            // ✅ Detectează dacă e sub-rețetă sau ingredient
            const raw = ingredient as any;
            const isSubRecipe = raw.recipe_id || raw.sub_recipe_name;
            const itemType: EditableIngredient['itemType'] = isSubRecipe
              ? 'recipe'
              : ((ingredient.item_type as EditableIngredient['itemType']) ?? 'ingredient');

            return {
              name: isSubRecipe ? (raw.sub_recipe_name || raw.ingredient_name || '') : (ingredient.ingredient_name || ''),
              ingredientId: ingredient.ingredient_id || undefined,
              recipeId: raw.recipe_id || undefined,  // ✅ Sub-rețetă
              quantity: ingredient.quantity_needed ? String(ingredient.quantity_needed) : '',
              unit: ingredient.unit ?? '',
              wastePercentage: ingredient.waste_percentage ? String(ingredient.waste_percentage) : '0',
              variableConsumption: ingredient.variable_consumption ?? '',
              itemType,
            };
          }),
        );
      } else {
        setRows([]);
      }
    }
  }, [open, ingredients, reset]);

  const catalogOptions = useMemo(() => {
    const byName = new Map<string, { id: number; unit: string }>();
    catalogIngredients.forEach((ingredient) => {
      byName.set(ingredient.name.toLowerCase(), {
        id: ingredient.id,
        unit: ingredient.unit ?? '',
      });
    });
    return byName;
  }, [catalogIngredients]);

  const catalogList = useMemo(
    () =>
      catalogIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
      })),
    [catalogIngredients],
  );

  const handleRowChange =
    (index: number, field: keyof EditableIngredient, value: string | EditableIngredient['itemType']) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          [field]: value,
        };
        return next;
      });
    };

  const handleIngredientNameChange = (index: number, value: string) => {
    const matched = catalogOptions.get(value.trim().toLowerCase());
    setRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        name: value,
        ingredientId: matched?.id,
        unit: matched?.unit || next[index].unit,
      };
      return next;
    });
  };

  const handleAddRow = (itemType: EditableIngredient['itemType'] = 'ingredient') => {
    setRows((prev) => [...prev, { ...EMPTY_ROW, itemType }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleItemTypeChange = (index: number, value: EditableIngredient['itemType']) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        itemType: value,
        wastePercentage: value === 'packaging' ? '0' : next[index].wastePercentage,
        // ✅ Clear recipeId/ingredientId când schimbăm tipul
        recipeId: value === 'recipe' ? next[index].recipeId : undefined,
        ingredientId: value === 'recipe' ? undefined : next[index].ingredientId,
        name: value === 'recipe' ? '' : next[index].name,  // Clear name când schimbăm tipul
      };
      return next;
    });
  };

  // ✅ Handler pentru selectare preparation (sub-rețetă)
  const handlePreparationChange = (index: number, preparationId: number) => {
    const preparation = preparations.find(p => p.id === preparationId);
    if (preparation) {
      setRows((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          name: preparation.name,
          recipeId: preparation.id,
          ingredientId: undefined,  // Clear ingredientId
        };
        return next;
      });
    }
  };

  const handleRefetch = () => {
    refetch();
  };

  const validateRecipe = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (rows.length === 0) {
      errors.push('Rețeta trebuie să conțină cel puțin un ingredient.');
    }

    rows.forEach((row, index) => {
      if (!row.name || row.name.trim() === '') {
        errors.push(`Rândul ${index + 1}: Numele ingredientului este obligatoriu.`);
      }

      if (!row.quantity || parseFloat(row.quantity) <= 0) {
        errors.push(`Rândul ${index + 1}: Cantitatea trebuie să fie mai mare decât 0.`);
      }

      if (!row.unit || row.unit.trim() === '') {
        errors.push(`Rândul ${index + 1}: Unitatea de măsură este obligatorie.`);
      }

      if (row.itemType === 'ingredient' && !row.ingredientId && !catalogOptions.has(row.name.trim().toLowerCase())) {
        errors.push(`Rândul ${index + 1}: Ingredientul "${row.name}" nu există în catalog.`);
      }

      if (row.itemType === 'recipe' && !row.recipeId) {
        errors.push(`Rândul ${index + 1}: Sub-rețeta trebuie să fie selectată.`);
      }

      const wastePercent = parseFloat(row.wastePercentage) || 0;
      if (wastePercent < 0 || wastePercent > 100) {
        errors.push(`Rândul ${index + 1}: Procentul de waste trebuie să fie între 0 și 100.`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleCalculateNutrition = async () => {
    if (!productId || rows.length === 0) {
      return;
    }

    setNutritionLoading(true);
    setCalculatedNutrition(null);
    try {
      // Convert rows to ingredients format for API, converting units to grams
      const ingredients = rows
        .filter((row) => row.itemType === 'ingredient' && row.ingredientId && row.quantity && row.unit)
        .map((row) => {
          const quantity = parseFloat(row.quantity) || 0;
          const quantityInGrams = canConvertToGrams(row.unit)
            ? convertToGrams(quantity, row.unit)
            : quantity; // If can't convert, use as-is

          return {
            ingredient_id: row.ingredientId!,
            quantity: quantityInGrams,
            unit: 'g', // Always use grams for nutrition calculation
            waste_percentage: parseFloat(row.wastePercentage) || 0,
          };
        });

      if (ingredients.length === 0) {
        setLocalError('Nu există ingrediente valide pentru calcul nutrițional.');
        return;
      }

      // Call backend API to calculate nutrition
      const response = await httpClient.post('/api/recipes/calculate-nutrition', {
        product_id: productId,
        ingredients,
        servings,
      });

      if (response.data && response.data.success) {
        setCalculatedNutrition(response.data.nutrition);
      } else {
        setLocalError(response.data?.error || 'Nu s-a putut calcula nutriția.');
      }
    } catch (calculateError: any) {
      console.error('Error calculating nutrition:', calculateError);
      setLocalError(calculateError.response?.data?.error || 'Eroare la calcularea nutriției.');
    } finally {
      setNutritionLoading(false);
    }
  };

  const handleNutritionSelect = (nutrition: any) => {
    // When user selects an ingredient from nutrition search, we can use it to populate a row
    console.log('Selected nutrition:', nutrition);
  };

  const handleCalculateSuggestedPrice = async () => {
    if (!productId) {
      return;
    }
    setPriceLoading(true);
    setSuggestedPrice(null);
    try {
      const response = await fetch(`/api/recipes/suggested-price/${productId}`);
      const data = await response.json();
      if (data && data.success) {
        setSuggestedPrice({
          value: Number(data.suggested_price),
          totalCost: Number(data.total_cost),
          margin: Number(data.margin_percentage),
        });
      } else {
        setLocalError(data?.error ?? 'Nu s-a putut calcula prețul sugestiv.');
      }
    } catch (calculateError) {
      setLocalError((calculateError as Error).message);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productId) {
      return;
    }

    // Validate recipe before submission
    const validation = validateRecipe();
    if (!validation.valid) {
      setLocalError(validation.errors.join('\n'));
      return;
    }

    const autoCreated: string[] = [];
    const sanitized = rows
      .map((row) => {
        const quantityNumber = Number(row.quantity);
        const matched = catalogOptions.get(row.name.trim().toLowerCase());
        if (!matched && !row.ingredientId && row.name.trim()) {
          autoCreated.push(row.name.trim());
        }
        return {
          name: row.name.trim(),
          quantity: quantityNumber,
          unit: row.unit.trim() || (row.itemType === 'recipe' ? 'buc' : matched?.unit || 'g'),
          waste_percentage: row.wastePercentage ? Number(row.wastePercentage) : 0,
          variable_consumption: row.variableConsumption ? row.variableConsumption.trim() : undefined,
          item_type: row.itemType,
          ingredient_id: row.itemType === 'recipe' ? undefined : (matched?.id ?? row.ingredientId),
          recipe_id: row.itemType === 'recipe' ? row.recipeId : undefined,  // ✅ Sub-rețetă
        };
      })
      .filter((row) => row.name && row.quantity && row.quantity > 0);

    if (sanitized.length === 0) {
      setLocalError('Adaugă cel puțin un ingredient cu cantitate > 0.');
      return;
    }

    const payload = {
      ingredients: sanitized.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        waste_percentage: ingredient.waste_percentage,
        variable_consumption: ingredient.variable_consumption ?? null,
        item_type: ingredient.item_type,
        ingredient_id: ingredient.ingredient_id ?? undefined,
        recipe_id: ingredient.recipe_id ?? undefined,  // ✅ Sub-rețetă
      })),
    };

    const response = await mutate({
      url: `/api/recipes/product/${productId}`,
      method: 'put',
      data: payload,
    });

    if (response !== null) {
      // ✅ TASK 3: Create recipe version after save
      try {
        // Get recipe_id from product_id (recipes table uses product_id, not recipe_id as PK)
        // We need to get the first recipe row for this product to use as recipe_id
        const recipeResponse = await httpClient.get(`/api/recipes/product/${productId}`);
        const recipes = recipeResponse.data?.data || recipeResponse.data || [];

        if (Array.isArray(recipes) && recipes.length > 0) {
          // Use the first recipe's id as recipe_id for versioning
          const firstRecipeId = recipes[0]?.id || recipes[0]?.recipe_id;

          if (firstRecipeId) {
            setRecipeId(firstRecipeId);

            // Create version snapshot
            await httpClient.post(`/api/admin/recipes/${firstRecipeId}/versions`, {
              change_description: changeDescription || 'Salvare rețetă',
              change_reason: changeReason || 'Actualizare rețetă',
              changed_by: 'user', // TODO: Get from auth context
            });
          }
        }
      } catch (versionError) {
        console.error('Error creating recipe version:', versionError);
        // Don't fail the save if versioning fails
      }

      const uniqueCreated = Array.from(new Set(autoCreated));
      if (uniqueCreated.length > 0) {
        onSaved(
          `${response.message ?? 'Rețetă actualizată cu succes.'} Ingredientele noi (${uniqueCreated.join(
            ', ',
          )}) au fost adăugate automat în catalog.`,
        );
      } else {
        onSaved(response.message ?? 'Rețetă actualizată cu succes.');
      }
    }
  };

  const modalTitle = product ? `Editor rețetă — ${product.product_name}` : 'Editor rețetă';

  return (
    <div className="recipe-editor-modal-wrapper">
      <Modal
        isOpen={open}
        title={modalTitle}
        size="full"
        onClose={onClose}
        draggable={true}
      >
        {localError ? <InlineAlert variant="warning" title="Atenție" message={localError} /> : null}
        {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
        {saveError ? <InlineAlert variant="error" title="Eroare salvare" message={saveError} /> : null}
        {suggestedPrice ? (
          <InlineAlert
            variant="success"
            title="pret sugestiv"
            message={`Recomandare: ${suggestedPrice.value.toFixed(2)} RON · Cost total ${suggestedPrice.totalCost.toFixed(
              2,
            )} RON · Marjă ${suggestedPrice.margin.toFixed(1)}%`}
          />
        ) : null}

        <div className="recipe-editor-header">
          <div>
            <div className="recipe-editor-product">{productName || product?.product_name}</div>
            <div className="recipe-editor-meta">
              {product?.product_category ? `Categorie: ${product.product_category}` : 'Categorie necunoscută'}
            </div>
            {/* ✅ SĂPTĂMÂNA 1 - ZIUA 4: Yield Configuration */}
            <div className="recipe-yield-config" style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span>Servings (Portions):</span>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  disabled={servingsLoading || !productId}
                  style={{ width: '60px', padding: '0.25rem' }}
                  onChange={async (e) => {
                    const newServings = parseInt(e.target.value) || 1;
                    setServings(newServings);

                    // Save to product
                    if (productId && newServings > 0) {
                      try {
                        await saveServingsToProduct(productId, newServings);
                      } catch (error: any) {
                        console.error('Error saving servings:', error);
                        // Revert on error
                        setServings(product?.servings || 1);
                      }
                    }
                  }}
                />
                {servingsLoading && <span className="spinner-border spinner-border-sm" />}
              </label>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                Cost per serving: {suggestedPrice ? (suggestedPrice.totalCost / servings).toFixed(2) : 'N/A'} RON
              </div>
            </div>
          </div>
          <div className="recipe-editor-actions">
            <button
              type="button"
              className="menu-product-button menu-product-button--ghost"
              onClick={handleRefetch}
              disabled={loading}
            >
              🔄 Reîncarcă
            </button>
            <button
              type="button"
              className="menu-product-button menu-product-button--secondary"
              onClick={handleCalculateSuggestedPrice}
              disabled={priceLoading}
            >
              {priceLoading ? 'Se calculează…' : '💰 Preț sugestiv'}
            </button>
            {/* ✅ Nutrition Search Button */}
            <button
              type="button"
              className="menu-product-button menu-product-button--ghost"
              onClick={() => setNutritionSearchOpen(true)}
              title="cauta date nutritionale"
            >
              🔍 Nutriție
            </button>
            {/* ✅ Auto-calculate Nutrition Button */}
            <button
              type="button"
              className="menu-product-button menu-product-button--ghost"
              onClick={handleCalculateNutrition}
              disabled={nutritionLoading || rows.length === 0}
              title="calculeaza automat valorile nutritionale din ingre"
            >
              {nutritionLoading ? 'Se calculează…' : '⚡ Auto Nutriție'}
            </button>
            {/* ✅ TASK 3: Version History Button */}
            {recipeId && (
              <button
                type="button"
                className="menu-product-button menu-product-button--ghost"
                onClick={() => setVersionHistoryOpen(true)}
                title="istoric versiuni reteta"
              >
                📜 Versiuni
              </button>
            )}
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose}>Închide</button>
          </div>
        </div>

        <form className="recipe-editor-form" onSubmit={handleSubmit}>
          <div className="recipe-editor-table">
            <div className="recipe-editor-table-header">
              <span>#</span>
              <span>Ingredient</span>
              <span>Cantitate</span>
              <span>Unitate</span>
              <span>Waste %</span>
              <span>Tip</span>
              <span>Consum variabil / observații</span>
              <span />
            </div>
            {rows.map((row, index) => (
              <div key={`Index-${row.name}`} className="recipe-editor-row">
                <span className="recipe-editor-index">{index + 1}</span>
                <div className="recipe-editor-cell">
                  {row.itemType === 'recipe' ? (
                    // ✅ Select pentru preparations (sub-rețete)
                    <select
                      value={row.recipeId || ''}
                      onChange={(event) => handlePreparationChange(index, parseInt(event.target.value))}
                      required
                      disabled={preparationsLoading}
                      title="Selectează preparație (sub-rețetă)"
                      aria-label="Selectează preparație"
                    >
                      <option value="">Selectează preparație ({preparations.length} disp.)</option>
                      {preparations.map((prep) => (
                        <option key={prep.id} value={prep.id}>
                          {prep.name} {prep.name_en ? `(${prep.name_en})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      list="recipe-ingredients-list"
                      value={row.name}
                      onChange={(event) => handleIngredientNameChange(index, event.target.value)}
                      placeholder={row.itemType === 'packaging' ? 'Nume ambalaj' : 'Nume ingredient'}
                      required
                      title={row.itemType === 'packaging' ? 'Nume ambalaj' : 'Nume ingredient'}
                      aria-label={row.itemType === 'packaging' ? 'Nume ambalaj' : 'Nume ingredient'}
                    />
                  )}
                </div>
                <div className="recipe-editor-cell">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.quantity}
                    onChange={(event) => handleRowChange(index, 'quantity', event.target.value)}
                    placeholder="Cantitate"
                    required
                  />
                </div>
                <div className="recipe-editor-cell">
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(event) => handleRowChange(index, 'unit', event.target.value)}
                    placeholder="Unitate"
                  />
                </div>
                <div className="recipe-editor-cell">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={row.wastePercentage}
                    onChange={(event) => handleRowChange(index, 'wastePercentage', event.target.value)}
                    disabled={row.itemType === 'packaging'}
                    title="Procent pierderi"
                  />
                </div>
                <div className="recipe-editor-cell">
                  <select
                    value={row.itemType}
                    onChange={(event) => handleItemTypeChange(index, event.target.value as EditableIngredient['itemType'])}
                    title="Tip item (Ingredient, Sub-rețetă sau Ambalaj)"
                    aria-label="Tip item"
                  >
                    <option value="ingredient">Ingredient</option>
                    <option value="recipe">Sub-rețetă (Preparation)</option>
                    <option value="packaging">Ambalaj</option>
                  </select>
                </div>
                <div className="recipe-editor-cell">
                  <textarea
                    value={row.variableConsumption}
                    onChange={(event) => handleRowChange(index, 'variableConsumption', event.target.value)}
                    placeholder='[ex_10%_extra_pentru_plating]'
                    rows={2}
                  />
                </div>
                <div className="recipe-editor-cell recipe-editor-actions-cell">
                  <button
                    type="button"
                    className="recipe-editor-remove"
                    onClick={() => handleRemoveRow(index)}
                    title="sterge ingredient"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="recipe-editor-additions">
            <button
              type="button"
              className="menu-product-button menu-product-button--primary"
              onClick={() => handleAddRow('ingredient')}
            >
              ➕ Ingredient
            </button>
            <button
              type="button"
              className="menu-product-button menu-product-button--secondary"
              onClick={() => handleAddRow('recipe')}
            >
              🔄 Sub-rețetă
            </button>
            <button
              type="button"
              className="menu-product-button menu-product-button--ghost"
              onClick={() => handleAddRow('packaging')}
            >
              📦 Ambalaj
            </button>
          </div>

          <footer className="recipe-editor-footer">
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={saving}>Anulează</button>
            <button type="submit" className="menu-product-button menu-product-button--primary" disabled={saving}>
              {saving ? 'Se salvează…' : 'Salvează rețeta'}
            </button>
          </footer>
        </form>

        <datalist id="recipe-ingredients-list">
          {catalogList.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.name} />
          ))}
        </datalist>

        {/* ✅ Nutrition Search Modal */}
        <NutritionSearchModal
          open={nutritionSearchOpen}
          onClose={() => setNutritionSearchOpen(false)}
          onSelect={handleNutritionSelect}
        />

        {/* ✅ Calculated Nutrition Display */}
        {calculatedNutrition && (
          <div className="alert alert-info mt-3">
            <h6>📊 Valori Nutriționale Calculate (per {servings} porții):</h6>
            <div className="row mt-2">
              <div className="col-md-6">
                <strong>Calorii:</strong> {calculatedNutrition.energy_kcal.toFixed(2)} kcal ({calculatedNutrition.energy_kj.toFixed(2)} kJ)
              </div>
              <div className="col-md-6">
                <strong>Proteine:</strong> {calculatedNutrition.protein.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Carbohidrați:</strong> {calculatedNutrition.carbs.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Zahăr:</strong> {calculatedNutrition.sugars.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Grăsimi:</strong> {calculatedNutrition.fat.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Grăsimi saturate:</strong> {calculatedNutrition.saturated_fat.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Fibre:</strong> {calculatedNutrition.fiber.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Sare:</strong> {calculatedNutrition.salt.toFixed(2)} g
              </div>
            </div>
          </div>
        )}

        {/* ✅ TASK 3: Recipe Version History Modal */}
        {recipeId && (
          <RecipeVersionHistory
            open={versionHistoryOpen}
            recipeId={recipeId}
            onClose={() => setVersionHistoryOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}








