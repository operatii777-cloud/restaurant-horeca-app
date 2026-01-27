// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useCallback, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import { RecipeEditorModal } from './RecipeEditorModal';
import type { RecipeProductSummary } from '@/types/recipes';
import './CreateProductWizard.css';

type WizardStep = 'product' | 'recipe' | 'technical-sheet';

interface ProductFormData {
  name: string;
  name_en?: string;
  category: string;
  price: number;
  vat_rate: number;
  unit: string;
  description?: string;
  description_en?: string;
  preparation_section?: string;
  stock_management: 'fifo' | 'none';
  has_recipe: boolean;
}

interface CreateProductWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (productId: number) => void;
}

export function CreateProductWizard({ open, onClose, onComplete }: CreateProductWizardProps) {
//   const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('product');
  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: 0,
    vat_rate: 9,
    unit: 'buc',
    stock_management: 'fifo',
    has_recipe: true,
  });
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [recipeEditorOpen, setRecipeEditorOpen] = useState(false);
  const [technicalSheetGenerated, setTechnicalSheetGenerated] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: categoriesData } = useApiQuery<Array<{ id: number; name: string; name_en?: string }>>(
    open ? '/api/catalog/categories' : null
  );

  const { mutate: createProduct, loading: creatingProduct } = useApiMutation();
  const { mutate: generateTechnicalSheet, loading: generatingSheet } = useApiMutation();

  const selectedProduct: RecipeProductSummary | null = createdProductId
    ? {
        product_id: createdProductId,
        product_name: productData.name,
        product_category: productData.category,
        recipe_count: 0,
        servings: 1,
      }
    : null;

  const handleProductDataChange = useCallback((field: keyof ProductFormData, value: unknown) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateProduct = useCallback(async () => {
    if (!productData.name || !productData.category || !productData.price) {
      setFeedback({ type: 'error', message: 'Completează toate câmpurile obligatorii (nume, categorie, preț).' });
      return;
    }

    try {
      const payload = {
        name: productData.name,
        name_en: productData.name_en || null,
        category: productData.category,
        price: productData.price,
        vat_rate: productData.vat_rate,
        unit: productData.unit,
        description: productData.description || null,
        description_en: productData.description_en || null,
        preparation_section: productData.preparation_section || null,
        stock_management: productData.stock_management,
        is_sellable: 1,
        has_recipe: productData.has_recipe ? 1 : 0,
        is_active: 1,
      };

      const result = await createProduct({
        url: '/api/catalog/products',
        method: 'post',
        data: payload,
      });

      if (result !== null && result.data?.id) {
        const productId = result.data.id;
        setCreatedProductId(productId);
        setFeedback({ type: 'success', message: 'Produsul a fost creat cu succes!' });
        setCurrentStep('recipe');
      } else {
        setFeedback({ type: 'error', message: 'Eroare la crearea produsului.' });
      }
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Eroare la crearea produsului.' });
    }
  }, [productData, createProduct]);

  const handleRecipeSaved = useCallback(async (message: string) => {
    setFeedback({ type: 'success', message });
    setRecipeEditorOpen(false);
    setCurrentStep('technical-sheet');
  }, []);

  const handleGenerateTechnicalSheet = useCallback(async () => {
    if (!createdProductId) {
      setFeedback({ type: 'error', message: 'Produsul nu a fost creat.' });
      return;
    }

    try {
      // Obține rețeta pentru produs
      const recipeResponse = await httpClient.get(`/api/recipes/product/${createdProductId}`);
      const recipes = recipeResponse.data?.data || recipeResponse.data || [];

      if (!Array.isArray(recipes) || recipes.length === 0) {
        setFeedback({ type: 'error', message: 'Produsul nu are rețetă definită. Adaugă rețeta mai întâi.' });
        return;
      }

      const recipeId = recipes[0]?.id || recipes[0]?.recipe_id;
      if (!recipeId) {
        setFeedback({ type: 'error', message: 'Nu s-a putut identifica rețeta.' });
        return;
      }

      const result = await generateTechnicalSheet({
        url: '/api/technical-sheets/generate',
        method: 'post',
        data: {
          product_id: createdProductId,
          recipe_id: recipeId,
        },
      });

      if (result !== null) {
        setTechnicalSheetGenerated(true);
        setFeedback({ type: 'success', message: 'Fișa tehnică a fost generată cu succes!' });
      } else {
        setFeedback({ type: 'error', message: 'Eroare la generarea fișei tehnice.' });
      }
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Eroare la generarea fișei tehnice.' });
    }
  }, [createdProductId, generateTechnicalSheet]);

  const handleComplete = useCallback(() => {
    if (createdProductId) {
      onComplete(createdProductId);
    }
    handleClose();
  }, [createdProductId, onComplete]);

  const handleClose = useCallback(() => {
    setCurrentStep('product');
    setProductData({
      name: '',
      category: '',
      price: 0,
      vat_rate: 9,
      unit: 'buc',
      stock_management: 'fifo',
      has_recipe: true,
    });
    setCreatedProductId(null);
    setRecipeEditorOpen(false);
    setTechnicalSheetGenerated(false);
    setFeedback(null);
    onClose();
  }, [onClose]);

  const categoryOptions = categoriesData || [];

  const stepTitles: Record<WizardStep, string> = {
    product: 'Pasul 1: Detalii Produs',
    recipe: 'Pasul 2: Rețetă',
    'technical-sheet': 'Pasul 3: Fișă Tehnică',
  };

  return (
    <>
      <Modal isOpen={open} title='wizard produs nou + reteta' size="xl" onClose={handleClose}>
        {feedback && (
          <InlineAlert
            variant={feedback.type}
            title={feedback.type === 'success' ? 'Succes' : 'Eroare'}
            message={feedback.message}
          />
        )}

        <div className="create-product-wizard">
          {/* Progress Steps */}
          <div className="wizard-progress">
            <div className={`wizard-step ${currentStep === 'product' ? 'active' : currentStep !== 'product' ? 'completed' : ''}`}>
              <div className="wizard-step-number">1</div>
              <div className="wizard-step-label">Produs</div>
            </div>
            <div className="wizard-step-connector" />
            <div className={`wizard-step ${currentStep === 'recipe' ? 'active' : currentStep === 'technical-sheet' ? 'completed' : ''}`}>
              <div className="wizard-step-number">2</div>
              <div className="wizard-step-label">"Rețetă"</div>
            </div>
            <div className="wizard-step-connector" />
            <div className={`wizard-step ${currentStep === 'technical-sheet' ? 'active' : ''}`}>
              <div className="wizard-step-number">3</div>
              <div className="wizard-step-label">"fisa tehnica"</div>
            </div>
          </div>

          {/* Step Content */}
          <div className="wizard-content">
            {currentStep === 'product' && (
              <div className="wizard-step-content">
                <h3>{stepTitles.product}</h3>
                <div className="wizard-form">
                  <div className="form-group">
                    <label htmlFor="product-name">Nume Produs *</label>
                    <input
                      id="product-name"
                      type="text"
                      value={productData.name}
                      onChange={(e) => handleProductDataChange('name', e.target.value)}
                      placeholder="Ex: Pizza Margherita"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-name-en">Nume (EN)</label>
                    <input
                      id="product-name-en"
                      type="text"
                      value={productData.name_en || ''}
                      onChange={(e) => handleProductDataChange('name_en', e.target.value)}
                      placeholder="Ex: Margherita Pizza"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-category">Categorie *</label>
                      <select
                        id="product-category"
                        value={productData.category}
                        onChange={(e) => handleProductDataChange('category', e.target.value)}
                        required
                      >
                        <option value="">"selecteaza categorie"</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-unit">Unitate *</label>
                      <select
                        id="product-unit"
                        value={productData.unit}
                        onChange={(e) => handleProductDataChange('unit', e.target.value)}
                        required
                      >
                        <option value="buc">buc</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="portie">portie</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-price">Preț (RON) *</label>
                      <input
                        id="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productData.price}
                        onChange={(e) => handleProductDataChange('price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-vat">TVA (%) *</label>
                      <input
                        id="product-vat"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={productData.vat_rate}
                        onChange={(e) => handleProductDataChange('vat_rate', parseInt(e.target.value) || 9)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-description">Descriere</label>
                    <textarea
                      id="product-description"
                      value={productData.description || ''}
                      onChange={(e) => handleProductDataChange("Description", e.target.value)}
                      rows={3}
                      placeholder="Descriere produs (opțional)"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={productData.has_recipe}
                        onChange={(e) => handleProductDataChange('has_recipe', e.target.checked)}
                      />"produsul are reteta asociata"</label>
                  </div>
                </div>
                <div className="wizard-actions">
                  <button type="button" className="btn btn-ghost" onClick={handleClose}>"Anulează"</button>
                  <button type="button" className="btn btn-primary" onClick={handleCreateProduct} disabled={creatingProduct}>
                    {creatingProduct ? 'Se creează...' : 'Creează Produs →'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'recipe' && createdProductId && (
              <div className="wizard-step-content">
                <h3>{stepTitles.recipe}</h3>
                <p>Produsul "{productData.name}" a fost creat. Acum adaugă rețeta cu ingredientele necesare.</p>
                <div className="wizard-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setCurrentStep('product')}>
                    ← Înapoi
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setRecipeEditorOpen(true)}
                  >
                    Adaugă Rețetă →
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep('technical-sheet')}
                  >
                    Sari peste rețetă →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'technical-sheet' && createdProductId && (
              <div className="wizard-step-content">
                <h3>{stepTitles['technical-sheet']}</h3>
                {technicalSheetGenerated ? (
                  <>
                    <InlineAlert variant="success" title="Succes" message="msg fisa tehnica a fost generata cu succes" />
                    <p>Produsul "{productData.name}" este complet configurat cu rețetă și fișă tehnică.</p>
                  </>
                ) : (
                  <>
                    <p>Generează fișa tehnică de produs conform Ordin ANSVSA 201/2022.</p>
                    <p className="text-muted">"fisa tehnica va include alergeni aditivi valori nu"</p>
                  </>
                )}
                <div className="wizard-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setCurrentStep('recipe')}>
                    ← Înapoi
                  </button>
                  {!technicalSheetGenerated ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGenerateTechnicalSheet}
                      disabled={generatingSheet}
                    >
                      {generatingSheet ? 'Se generează...' : 'Generează Fișă Tehnică'}
                    </button>
                  ) : (
                    <button type="button" className="btn btn-success" onClick={handleComplete}>
                      Finalizează ✓
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Recipe Editor Modal */}
      {selectedProduct && (
        <RecipeEditorModal
          open={recipeEditorOpen}
          product={selectedProduct}
          onClose={() => setRecipeEditorOpen(false)}
          onSaved={handleRecipeSaved}
        />
      )}
    </>
  );
}





