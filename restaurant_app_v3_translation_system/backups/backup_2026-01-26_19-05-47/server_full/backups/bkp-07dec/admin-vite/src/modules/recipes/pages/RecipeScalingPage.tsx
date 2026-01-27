/**
 * RECIPE SCALING PAGE - UI pentru scalare rețete
 * Data: 03 Decembrie 2025
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import './RecipeScalingPage.css';

interface Recipe {
  id: number;
  name: string;
  base_portions: number;
  cost_per_portion: number;
}

interface ScaledIngredient {
  ingredient_name: string;
  quantity_gross_scaled: number;
  quantity_net_scaled: number;
  unit: string;
}

interface ScaledRecipe {
  id: number;
  name: string;
  target_portions: number;
  scale_factor: number;
  total_cost: number;
  ingredients: ScaledIngredient[];
}

export default function RecipeScalingPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [targetPortions, setTargetPortions] = useState<number>(1);
  const [scaledRecipe, setScaledRecipe] = useState<ScaledRecipe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const res = await axios.get('/api/recipes');
      setRecipes(res.data.data || []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    }
  };

  const handleScale = async () => {
    if (!selectedRecipeId || targetPortions < 1) {
      alert('Selectează o rețetă și introdu număr valid de porții!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/recipes/${selectedRecipeId}/scale`, {
        targetPortions
      });
      
      setScaledRecipe(res.data.data);
    } catch (err: any) {
      alert('Eroare la scalare: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedRecipeId(null);
    setTargetPortions(1);
    setScaledRecipe(null);
  };

  return (
    <div className="recipe-scaling-page">
      <h1 className="page-title">🔢 Scalare Rețete (1 → N porții)</h1>

      <div className="card">
        <h3>Selectează Rețetă</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Rețetă</label>
            <select 
              value={selectedRecipeId || ''} 
              onChange={e => setSelectedRecipeId(parseInt(e.target.value))}
            >
              <option value="">-- Alege rețetă --</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (bază: {r.base_portions} porții)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Porții Dorite</label>
            <input 
              type="number" 
              min="1" 
              value={targetPortions} 
              onChange={e => setTargetPortions(parseInt(e.target.value) || 1)}
              placeholder="Ex: 10"
            />
          </div>
        </div>

        <div className="button-group">
          <button className="btn-primary" onClick={handleScale} disabled={loading}>
            {loading ? 'Calculez...' : '🔢 Scalează Rețetă'}
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            🔄 Reset
          </button>
        </div>
      </div>

      {scaledRecipe && (
        <div className="card scaled-result">
          <h3>✅ Rețetă Scalată: {scaledRecipe.name}</h3>
          
          <div className="scaling-summary">
            <div className="summary-item">
              <span className="label">Porții țintă:</span>
              <span className="value">{scaledRecipe.target_portions}</span>
            </div>
            <div className="summary-item">
              <span className="label">Factor scalare:</span>
              <span className="value">×{scaledRecipe.scale_factor.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Cost total:</span>
              <span className="value cost">{scaledRecipe.total_cost.toFixed(2)} RON</span>
            </div>
            <div className="summary-item">
              <span className="label">Cost/porție:</span>
              <span className="value">{(scaledRecipe.total_cost / scaledRecipe.target_portions).toFixed(2)} RON</span>
            </div>
          </div>

          <h4>Ingrediente Scalate:</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Cantitate BRUTĂ</th>
                <th>Cantitate NETĂ</th>
                <th>Unitate</th>
              </tr>
            </thead>
            <tbody>
              {scaledRecipe.ingredients.map((ing, idx) => (
                <tr key={idx}>
                  <td>{ing.ingredient_name}</td>
                  <td>{ing.quantity_gross_scaled.toFixed(2)}</td>
                  <td>{ing.quantity_net_scaled.toFixed(2)}</td>
                  <td>{ing.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="button-group">
            <button className="btn-primary">📄 Generează PDF</button>
            <button className="btn-secondary">📧 Trimite pe Email</button>
          </div>
        </div>
      )}
    </div>
  );
}

