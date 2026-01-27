import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useRecipeDetails } from '@/modules/recipes/hooks/useRecipeDetails';
import { useIngredientsCatalog } from '@/modules/recipes/hooks/useIngredientsCatalog';
import { httpClient } from '@/shared/api/httpClient';
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
  const productId = product?.product_id ?? null;
  const { productName, ingredients, loading, error, refetch } = useRecipeDetails(productId, open);
  const { ingredients: catalogIngredients } = useIngredientsCatalog();
  const { mutate, loading: saving, error: saveError, reset } = useApiMutation<{ message?: string }>();
  const [rows, setRows] = useState<EditableIngredient[]>([EMPTY_ROW]);
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
      // Fetch preparations
      setPreparationsLoading(true);
      fetch('/api/recipes/preparations')
        .then(res => res.json())
        .then(data => {
          if (data.preparations) {
            setPreparations(data.preparations);
          }
        })
        .catch(err => {
          console.error('Eroare la fetch preparations:', err);
        })
        .finally(() => {
          setPreparationsLoading(false);
        });
      
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
            const isSubRecipe = ingredient.recipe_id || ingredient.sub_recipe_name;
            const itemType: EditableIngredient['itemType'] = isSubRecipe 
              ? 'recipe' 
              : ((ingredient.item_type as EditableIngredient['itemType']) ?? 'ingredient');
            
            return {
              name: isSubRecipe ? (ingredient.sub_recipe_name || ingredient.ingredient_name || '') : (ingredient.ingredient_name || ''),
              ingredientId: ingredient.ingredient_id || undefined,
              recipeId: ingredient.recipe_id || undefined,  // ✅ Sub-rețetă
              quantity: ingredient.quantity_needed ? String(ingredient.quantity_needed) : '',
              unit: ingredient.unit ?? '',
              wastePercentage: ingredient.waste_percentage ? String(ingredient.waste_percentage) : '0',
              variableConsumption: ingredient.variable_consumption ?? '',
              itemType,
            };
          }),
        );
      } else {
        setRows([EMPTY_ROW]);
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
    <Modal isOpen={open} title={modalTitle} size="xl" onClose={onClose}>
      {localError ? <InlineAlert variant="warning" title="Atenție" message={localError} /> : null}
      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
      {saveError ? <InlineAlert variant="error" title="Eroare salvare" message={saveError} /> : null}
      {suggestedPrice ? (
        <InlineAlert
          variant="success"
          title="Preț sugestiv"
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
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose}>
            Închide
          </button>
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
            <div key={`${index}-${row.name}`} className="recipe-editor-row">
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
                    <option value="">Selectează preparație...</option>
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
                  placeholder="Ex: 10% extra pentru plating"
                  rows={2}
                />
              </div>
              <div className="recipe-editor-cell recipe-editor-actions-cell">
                <button
                  type="button"
                  className="recipe-editor-remove"
                  onClick={() => handleRemoveRow(index)}
                  title="Șterge ingredient"
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
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={saving}>
            Anulează
          </button>
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
    </Modal>
  );
}


