// server/admin-vite/src/modules/recipes/components/RecipeScalingModal.tsx
// ✅ SĂPTĂMÂNA 1 - ZIUA 3: Modal pentru scaling rețete

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import './RecipeScalingModal.css';

type RecipeScalingModalProps = {
  open: boolean;
  product: {
    id: number;
    name: string;
    servings?: number;
  } | null;
  onClose: () => void;
};

type ScaledRecipe = {
  id: number;
  ingredient_id?: number;
  recipe_id?: number;
  ingredient_name?: string;
  sub_recipe_name?: string;
  quantity_needed: number;
  quantity_needed_original: number;
  unit: string;
};

type ScalingResult = {
  success: boolean;
  multiplier: number;
  originalPortions: number;
  targetPortions: number;
  recipes: ScaledRecipe[];
  totalCost: number;
  costPerPortion: number;
  originalCost: number;
};

export function RecipeScalingModal({ open, product, onClose }: RecipeScalingModalProps) {
  const [targetPortions, setTargetPortions] = useState<number>(product?.servings || 1);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [scaledRecipe, setScaledRecipe] = useState<ScalingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setTargetPortions(product.servings || 1);
      setMultiplier(1);
      setScaledRecipe(null);
      setError(null);
    }
  }, [open, product]);

  const handleScale = async () => {
    if (!product) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/recipes/${product.id}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPortions })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScaledRecipe(data);
        setMultiplier(data.multiplier);
      } else {
        setError(data.error || 'Eroare la calcularea rețetei scalate');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiplierChange = (value: number) => {
    setMultiplier(value);
    if (product?.servings) {
      setTargetPortions(Math.round(product.servings * value));
    }
  };

  const handlePortionsChange = (value: number) => {
    setTargetPortions(value);
    if (product?.servings) {
      setMultiplier(value / product.servings);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={open} title={`Scale Recipe: ${product.name}`} size="xl" onClose={onClose}>
      {error && <InlineAlert variant="error" title="Eroare" message={error} />}
      
      <div className="recipe-scaling-modal">
        <div className="scaling-controls">
          <div className="control-group">
            <label>
              <span>Original Portions:</span>
              <input 
                type="number" 
                value={product.servings || 1} 
                disabled
                className="control-input"
              />
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <span>Target Portions:</span>
              <input 
                type="number" 
                value={targetPortions}
                onChange={(e) => handlePortionsChange(parseInt(e.target.value) || 1)}
                min="1"
                className="control-input"
              />
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <span>Multiplier:</span>
              <input 
                type="number" 
                value={multiplier.toFixed(2)}
                onChange={(e) => handleMultiplierChange(parseFloat(e.target.value) || 1)}
                min="0.01"
                step="0.01"
                className="control-input"
              />
            </label>
          </div>
          
          <button
            type="button"
            className="menu-product-button menu-product-button--primary"
            onClick={handleScale}
            disabled={loading || targetPortions <= 0}
          >
            {loading ? 'Se calculează…' : '📊 Calculate Scaled Recipe'}
          </button>
        </div>
        
        {scaledRecipe && (
          <div className="scaled-results">
            <h3>Scaled Recipe (×{scaledRecipe.multiplier.toFixed(2)})</h3>
            
            <div className="cost-summary">
              <div className="cost-item">
                <span className="cost-label">Original Cost:</span>
                <span className="cost-value">{scaledRecipe.originalCost.toFixed(2)} RON</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Scaled Cost:</span>
                <span className="cost-value cost-value--highlight">{scaledRecipe.totalCost.toFixed(2)} RON</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Cost per Portion:</span>
                <span className="cost-value">{scaledRecipe.costPerPortion.toFixed(2)} RON</span>
              </div>
            </div>
            
            <div className="scaled-recipes-table">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Original</th>
                    <th>Scaled</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {scaledRecipe.recipes.map((recipe, idx) => (
                    <tr key={idx}>
                      <td>
                        {recipe.ingredient_name || recipe.sub_recipe_name || 'Unknown'}
                      </td>
                      <td>
                        <span className={`item-type-badge ${recipe.recipe_id ? 'badge-recipe' : 'badge-ingredient'}`}>
                          {recipe.recipe_id ? 'Sub-rețetă' : 'Ingredient'}
                        </span>
                      </td>
                      <td>{recipe.quantity_needed_original.toFixed(4)}</td>
                      <td className="scaled-value">{recipe.quantity_needed.toFixed(4)}</td>
                      <td>{recipe.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <footer className="recipe-scaling-footer">
          <button 
            type="button" 
            className="menu-product-button menu-product-button--ghost" 
            onClick={onClose}
          >
            Închide
          </button>
        </footer>
      </div>
    </Modal>
  );
}

