import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import type { MenuProduct, ProductCustomizationOption } from '@/types/menu';
import './MenuProductModal.css';

type MenuProductModalMode = 'create' | 'edit';

interface MenuProductModalProps {
  open: boolean;
  mode: MenuProductModalMode;
  categories: string[];
  product?: MenuProduct | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

type MenuProductFormValues = {
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  price: string;
  vatRate: string;
  unit: string;
  description: string;
  descriptionEn: string;
  weight: string;
  stockManagement: string;
  preparationSection: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  isTakeoutOnly: boolean;
  isSellable: boolean;
  isActive: boolean;
  isFraction: boolean;
  hasRecipe: boolean;
  info: string;
  allergens: string;
  allergensEn: string;
  prepTime: string;
  spiceLevel: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sodium: string;
  sugar: string;
  salt: string;
  costPrice: string;
  displayOrder: string;
  ingredients: string;
  imageFile: File | null;
  currentImageUrl: string | null;
};

const DEFAULT_FORM_VALUES: MenuProductFormValues = {
  name: '',
  nameEn: '',
  category: '',
  categoryEn: '',
  price: '',
  vatRate: '19',
  unit: 'buc',
  description: '',
  descriptionEn: '',
  weight: '',
  stockManagement: 'Bucătărie',
  preparationSection: 'BUCĂTĂRIE',
  isVegetarian: false,
  isSpicy: false,
  isTakeoutOnly: false,
  isSellable: true,
  isActive: true,
  isFraction: false,
  hasRecipe: false,
  info: '',
  allergens: '',
  allergensEn: '',
  prepTime: '',
  spiceLevel: '0',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sodium: '',
  sugar: '',
  salt: '',
  costPrice: '',
  displayOrder: '',
  ingredients: '',
  imageFile: null,
  currentImageUrl: null,
};

const VAT_OPTIONS = ['5', '9', '19', '21'];
const UNIT_OPTIONS = ['buc', 'g', 'kg', 'ml', 'l', 'porție'];
const STOCK_OPTIONS = ['Bucătărie', 'Bar', 'Pizzerie', 'Patiserie', 'Delivery', 'Terasa'];
const PREPARATION_OPTIONS = ['BUCĂTĂRIE', 'BAR', 'PIZZERIE', 'PATISERIE', 'DELIVERY'];

type CustomizationFormRow = {
  id?: number;
  optionName: string;
  optionNameEn: string;
  optionType: string;
  extraPrice: string;
};

const EMPTY_CUSTOMIZATION: CustomizationFormRow = {
  optionName: '',
  optionNameEn: '',
  optionType: 'option',
  extraPrice: '0',
};

const CUSTOMIZATION_TYPE_SUGGESTIONS = ['option', 'group', 'required', 'extra', 'info'];

const mapProductToForm = (product: MenuProduct): MenuProductFormValues => ({
  name: product.name ?? '',
  nameEn: product.name_en ?? '',
  category: product.category ?? '',
  categoryEn: product.category_en ?? '',
  price: product.price !== undefined && product.price !== null ? String(product.price) : '',
  vatRate: product.vat_rate !== undefined && product.vat_rate !== null ? String(product.vat_rate) : '19',
  unit: product.unit ?? 'buc',
  description: product.description ?? '',
  descriptionEn: product.description_en ?? '',
  weight: product.weight ?? '',
  stockManagement: product.stock_management ?? 'Bucătărie',
  preparationSection: product.preparation_section ?? 'BUCĂTĂRIE',
  isVegetarian: product.is_vegetarian === 1 || product.is_vegetarian === true,
  isSpicy: product.is_spicy === 1 || product.is_spicy === true,
  isTakeoutOnly: product.is_takeout_only === 1 || product.is_takeout_only === true,
  isSellable: product.is_sellable === 1 || product.is_sellable === true || product.is_sellable === undefined,
  isActive: product.is_active === 1 || product.is_active === true || product.is_active === undefined,
  isFraction: product.is_fraction === 1 || product.is_fraction === true,
  hasRecipe: product.has_recipe === 1 || product.has_recipe === true,
  info: product.info ?? '',
  allergens: product.allergens ?? '',
  allergensEn: product.allergens_en ?? '',
  prepTime: product.prep_time !== undefined && product.prep_time !== null ? String(product.prep_time) : '',
  spiceLevel: product.spice_level !== undefined && product.spice_level !== null ? String(product.spice_level) : '0',
  calories: product.calories !== undefined && product.calories !== null ? String(product.calories) : '',
  protein: product.protein !== undefined && product.protein !== null ? String(product.protein) : '',
  carbs: product.carbs !== undefined && product.carbs !== null ? String(product.carbs) : '',
  fat: product.fat !== undefined && product.fat !== null ? String(product.fat) : '',
  fiber: product.fiber !== undefined && product.fiber !== null ? String(product.fiber) : '',
  sodium: product.sodium !== undefined && product.sodium !== null ? String(product.sodium) : '',
  sugar: product.sugar !== undefined && product.sugar !== null ? String(product.sugar) : '',
  salt: product.salt !== undefined && product.salt !== null ? String(product.salt) : '',
  costPrice: product.cost_price !== undefined && product.cost_price !== null ? String(product.cost_price) : '',
  displayOrder: product.display_order !== undefined && product.display_order !== null ? String(product.display_order) : '',
  ingredients: typeof product.ingredients === 'string' ? product.ingredients : '',
  imageFile: null,
  currentImageUrl: product.image_url ?? null,
});

export function MenuProductModal({ open, mode, categories, product, onClose, onSaved }: MenuProductModalProps) {
  const { mutate, loading, error, reset } = useApiMutation<{
    message?: string;
    customizations?: ProductCustomizationOption[];
  }>();
  const [formState, setFormState] = useState<MenuProductFormValues>(DEFAULT_FORM_VALUES);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<CustomizationFormRow[]>([EMPTY_CUSTOMIZATION]);
  const [customizationsLoading, setCustomizationsLoading] = useState(false);
  const [customizationsError, setCustomizationsError] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    const unique = new Set(categories.filter(Boolean));
    if (formState.category) {
      unique.add(formState.category);
    }
    return Array.from(unique);
  }, [categories, formState.category]);

  useEffect(() => {
    if (open) {
      if (product) {
        const mapped = mapProductToForm(product);
        setFormState(mapped);
        setImagePreview(product.image_url ?? null);
        setCustomizations([EMPTY_CUSTOMIZATION]);
        setCustomizationsError(null);
        setCustomizationsLoading(true);
      } else {
        setFormState(DEFAULT_FORM_VALUES);
        setImagePreview(null);
        setCustomizations([EMPTY_CUSTOMIZATION]);
        setCustomizationsError(null);
        setCustomizationsLoading(false);
      }
      reset();
    } else {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setCustomizations([EMPTY_CUSTOMIZATION]);
      setCustomizationsError(null);
      setCustomizationsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode !== 'edit' || !product?.id) {
      setCustomizations([EMPTY_CUSTOMIZATION]);
      setCustomizationsError(null);
      setCustomizationsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isCanceled = false;

    const loadCustomizations = async () => {
      setCustomizationsLoading(true);
      setCustomizationsError(null);

      try {
        const response = await fetch(`/api/admin/products/${product.id}/customizations`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }

        const payload: {
          success?: boolean;
          customizations?: ProductCustomizationOption[];
        } = await response.json();

        if (isCanceled) {
          return;
        }

        const mapped =
          Array.isArray(payload?.customizations) && payload.customizations.length > 0
            ? payload.customizations.map((entry) => ({
                id: entry.id,
                optionName: entry.option_name ?? '',
                optionNameEn: entry.option_name_en ?? entry.option_name ?? '',
                optionType: entry.option_type ?? 'option',
                extraPrice:
                  entry.extra_price !== undefined && entry.extra_price !== null
                    ? String(entry.extra_price)
                    : '0',
              }))
            : [EMPTY_CUSTOMIZATION];

        setCustomizations(mapped);
      } catch (fetchError) {
        if (isCanceled || (fetchError as DOMException).name === 'AbortError') {
          return;
        }
        console.error('Nu am putut încărca personalizările produsului:', fetchError);
        setCustomizationsError('Nu am putut încărca personalizările produsului. Poți continua editarea și salva opțiunile manual.');
        setCustomizations([EMPTY_CUSTOMIZATION]);
      } finally {
        if (!isCanceled) {
          setCustomizationsLoading(false);
        }
      }
    };

    loadCustomizations();

    return () => {
      isCanceled = true;
      controller.abort();
    };
  }, [open, mode, product?.id]);

  const handleInputChange =
    (field: keyof MenuProductFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleCheckboxChange = (field: keyof MenuProductFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormState((prev) => ({ ...prev, imageFile: file }));

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(formState.currentImageUrl);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormState((prev) => ({ ...prev, imageFile: null, currentImageUrl: '' }));
  };

  const handleCustomizationChange =
    (index: number, field: keyof CustomizationFormRow, value: string) => {
      setCustomizations((prev) => {
        const next = [...prev];
        const safeValue =
          field === 'extraPrice'
            ? value.replace(',', '.')
            : field === 'optionType'
              ? value.toLowerCase()
              : value;
        next[index] = {
          ...next[index],
          [field]: safeValue,
        };
        return next;
      });
      setCustomizationsError(null);
    };

  const handleAddCustomization = () => {
    setCustomizations((prev) => [...prev, { ...EMPTY_CUSTOMIZATION }]);
    setCustomizationsError(null);
  };

  const handleRemoveCustomization = (index: number) => {
    setCustomizations((prev) => {
      if (prev.length === 1) {
        return [{ ...EMPTY_CUSTOMIZATION }];
      }
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [{ ...EMPTY_CUSTOMIZATION }];
    });
    setCustomizationsError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (customizationsLoading) {
      setCustomizationsError('Așteaptă finalizarea încărcării personalizărilor înainte de salvare.');
      return;
    }

    const formData = new FormData();
    formData.append('name', formState.name.trim());
    formData.append('price', formState.price || '0');
    formData.append('category', formState.category.trim());

    if (formState.nameEn) formData.append('name_en', formState.nameEn.trim());
    if (formState.categoryEn) formData.append('category_en', formState.categoryEn.trim());
    if (formState.description) formData.append('description', formState.description);
    if (formState.descriptionEn) formData.append('description_en', formState.descriptionEn);
    if (formState.weight) formData.append('weight', formState.weight);
    if (formState.info) formData.append('info', formState.info);
    if (formState.ingredients) formData.append('ingredients', formState.ingredients);
    if (formState.allergens) formData.append('allergens', formState.allergens);
    if (formState.allergensEn) formData.append('allergens_en', formState.allergensEn);

    formData.append('vat_rate', formState.vatRate || '19');
    formData.append('unit', formState.unit || 'buc');
    formData.append('stock_management', formState.stockManagement || 'Bucătărie');
    formData.append('preparation_section', formState.preparationSection || 'BUCĂTĂRIE');
    if (formState.prepTime) formData.append('prep_time', formState.prepTime);
    if (formState.spiceLevel) formData.append('spice_level', formState.spiceLevel);
    if (formState.calories) formData.append('calories', formState.calories);
    if (formState.protein) formData.append('protein', formState.protein);
    if (formState.carbs) formData.append('carbs', formState.carbs);
    if (formState.fat) formData.append('fat', formState.fat);
    if (formState.fiber) formData.append('fiber', formState.fiber);
    if (formState.sodium) formData.append('sodium', formState.sodium);
    if (formState.sugar) formData.append('sugar', formState.sugar);
    if (formState.salt) formData.append('salt', formState.salt);
    if (formState.costPrice) formData.append('cost_price', formState.costPrice);
    if (formState.displayOrder) formData.append('display_order', formState.displayOrder);

    formData.append('is_vegetarian', formState.isVegetarian ? '1' : '0');
    formData.append('is_spicy', formState.isSpicy ? '1' : '0');
    formData.append('is_takeout_only', formState.isTakeoutOnly ? '1' : '0');
    formData.append('is_sellable', formState.isSellable ? '1' : '0');
    formData.append('is_active', formState.isActive ? '1' : '0');
    formData.append('is_fraction', formState.isFraction ? '1' : '0');
    formData.append('has_recipe', formState.hasRecipe ? '1' : '0');

    if (formState.currentImageUrl !== null && !formState.imageFile) {
      formData.append('currentImageUrl', formState.currentImageUrl);
    }

    const normalizedCustomizations = customizations
      .map((customization) => ({
        id: customization.id,
        option_name: customization.optionName.trim(),
        option_name_en: customization.optionNameEn.trim(),
        option_type: customization.optionType.trim() || 'option',
        extra_price: customization.extraPrice === '' ? 0 : Number(customization.extraPrice),
      }))
      .filter((customization) => customization.option_name.length > 0);

    const hasInvalidPrice = normalizedCustomizations.some(
      (customization) => Number.isNaN(customization.extra_price) || customization.extra_price < 0,
    );

    if (hasInvalidPrice) {
      setCustomizationsError('Prețul suplimentar al personalizărilor trebuie să fie un număr pozitiv. Folosește 0 pentru opțiuni fără cost.');
      return;
    }

    setCustomizationsError(null);
    formData.append('customizations', JSON.stringify(normalizedCustomizations));

    if (formState.imageFile) {
      formData.append('image', formState.imageFile);
    }

    const endpoint = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${product?.id}`;
    const method = mode === 'create' ? 'post' : 'put';

    const response = await mutate({
      url: endpoint,
      method,
      data: formData,
    });

    if (response !== null) {
      const baseMessage = response?.message ?? (mode === 'create' ? 'Produs adăugat cu succes' : 'Produs actualizat cu succes');
      const customizationSummary =
        Array.isArray(response?.customizations) && response.customizations.length > 0
          ? ` Personalizări active: ${response.customizations.length}.`
          : normalizedCustomizations.length > 0
            ? ` Personalizările au fost sincronizate.`
            : '';
      onSaved(`${baseMessage}${customizationSummary}`.trim());
    }
  };

  const modalTitle = mode === 'create' ? 'Adaugă produs' : `Editează produs — ${product?.name ?? ''}`;

  return (
    <Modal isOpen={open} title={modalTitle} size="xl" onClose={onClose}>
      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <form className="menu-product-form" onSubmit={handleSubmit}>
        <section className="menu-product-section">
          <header>
            <h3>📋 Detalii generale</h3>
            <p>Completează informațiile de bază afișate clienților.</p>
          </header>

          <div className="menu-product-grid menu-product-grid--two">
            <label className="menu-product-field">
              <span>Nume produs *</span>
              <input
                type="text"
                value={formState.name}
                onChange={handleInputChange('name')}
                required
                placeholder="Ex: Pizza Quattro Stagioni"
              />
            </label>

            <label className="menu-product-field">
              <span>Nume produs (EN)</span>
              <input
                type="text"
                value={formState.nameEn}
                onChange={handleInputChange('nameEn')}
                placeholder="Ex: Four Seasons Pizza"
              />
            </label>

            <label className="menu-product-field">
              <span>Categorie *</span>
              <input
                list="menu-category-options"
                value={formState.category}
                onChange={handleInputChange('category')}
                required
                placeholder="Ex: Pizza, Salate..."
              />
              <datalist id="menu-category-options">
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>Categorie (EN)</span>
              <input
                type="text"
                value={formState.categoryEn}
                onChange={handleInputChange('categoryEn')}
                placeholder="Ex: Pizza"
              />
            </label>

            <label className="menu-product-field">
              <span>Preț (RON) *</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formState.price}
                onChange={handleInputChange('price')}
                required
              />
            </label>

            <label className="menu-product-field">
              <span>TVA (%)</span>
              <select value={formState.vatRate} onChange={handleInputChange('vatRate')}>
                {VAT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="menu-product-field">
              <span>Unitate măsură</span>
              <select value={formState.unit} onChange={handleInputChange('unit')}>
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>

            <label className="menu-product-field">
              <span>Greutate / Volum</span>
              <input
                type="text"
                value={formState.weight}
                onChange={handleInputChange('weight')}
                placeholder="Ex: 350g, 500ml"
              />
            </label>

            <label className="menu-product-field">
              <span>Ordine afișare</span>
              <input
                type="number"
                min="0"
                value={formState.displayOrder}
                onChange={handleInputChange('displayOrder')}
                placeholder="Ordinea în meniu"
              />
            </label>

            <label className="menu-product-field">
              <span>Cost produs (RON)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.costPrice}
                onChange={handleInputChange('costPrice')}
                placeholder="Ex: 12.50"
              />
            </label>
          </div>

          <div className="menu-product-switches">
            <label>
              <input type="checkbox" checked={formState.isSellable} onChange={handleCheckboxChange('isSellable')} />
              Disponibil la vânzare
            </label>
            <label>
              <input type="checkbox" checked={formState.isActive} onChange={handleCheckboxChange('isActive')} />
              Activ în meniu
            </label>
            <label>
              <input type="checkbox" checked={formState.isFraction} onChange={handleCheckboxChange('isFraction')} />
              Permite fracții (gramaj)
            </label>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🏭 Inventar & preparare</h3>
            <p>Definește gestiunea și secția de pregătire pentru urmăririle HACCP.</p>
          </header>

          <div className="menu-product-grid menu-product-grid--three">
            <label className="menu-product-field">
              <span>Gestiune stoc</span>
              <input
                list="menu-stock-options"
                value={formState.stockManagement}
                onChange={handleInputChange('stockManagement')}
                placeholder="Ex: Bucătărie, Bar..."
              />
              <datalist id="menu-stock-options">
                {STOCK_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>Secție preparare</span>
              <input
                list="menu-preparation-options"
                value={formState.preparationSection}
                onChange={handleInputChange('preparationSection')}
                placeholder="Ex: BUCĂTĂRIE, BAR..."
              />
              <datalist id="menu-preparation-options">
                {PREPARATION_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>Timp preparare (min)</span>
              <input
                type="number"
                min="0"
                value={formState.prepTime}
                onChange={handleInputChange('prepTime')}
                placeholder="Ex: 15"
              />
            </label>
          </div>

          <div className="menu-product-switches">
            <label>
              <input type="checkbox" checked={formState.isVegetarian} onChange={handleCheckboxChange('isVegetarian')} />
              🌱 Vegetarian
            </label>
            <label>
              <input type="checkbox" checked={formState.isSpicy} onChange={handleCheckboxChange('isSpicy')} />
              🌶️ Picant
            </label>
            <label>
              <input type="checkbox" checked={formState.isTakeoutOnly} onChange={handleCheckboxChange('isTakeoutOnly')} />
              📦 Doar la pachet
            </label>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>📝 Descriere & informații</h3>
            <p>Textele afișate în meniurile clienților și aplicațiile partenerilor.</p>
          </header>

          <label className="menu-product-field menu-product-field--full">
            <span>Descriere (RO)</span>
            <textarea
              value={formState.description}
              onChange={handleInputChange('description')}
              placeholder="Descriere pentru clienți, ingredientele principale, modul de servire..."
              rows={3}
            />
          </label>

          <label className="menu-product-field menu-product-field--full">
            <span>Descriere (EN)</span>
            <textarea
              value={formState.descriptionEn}
              onChange={handleInputChange('descriptionEn')}
              placeholder="English description (opțional)"
              rows={3}
            />
          </label>

          <div className="menu-product-grid menu-product-grid--two">
            <label className="menu-product-field">
              <span>Alergeni (RO)</span>
              <input
                type="text"
                value={formState.allergens}
                onChange={handleInputChange('allergens')}
                placeholder="gluten, lapte, ouă..."
              />
            </label>

            <label className="menu-product-field">
              <span>Alergeni (EN)</span>
              <input
                type="text"
                value={formState.allergensEn}
                onChange={handleInputChange('allergensEn')}
                placeholder="gluten, milk, eggs..."
              />
            </label>
          </div>

          <label className="menu-product-field menu-product-field--full">
            <span>Informații suplimentare</span>
            <textarea
              value={formState.info}
              onChange={handleInputChange('info')}
              placeholder="Ex: Preparat la comandă, recomandări de servire, avertismente"
              rows={2}
            />
          </label>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🎛️ Personalizări produs</h3>
            <p>Definește opțiunile suplimentare (ex: topping-uri, extra-uri) afișate clienților și aplicațiilor de livrare.</p>
          </header>

          {customizationsLoading ? (
            <div className="menu-customizations-state">Se încarcă personalizările existente…</div>
          ) : null}

          {customizationsError ? (
            <InlineAlert variant="warning" title="Personalizări" message={customizationsError} />
          ) : null}

          <div className="menu-customizations-table">
            <div className="menu-customizations-header">
              <span>#</span>
              <span>Opțiune (RO)</span>
              <span>Opțiune (EN)</span>
              <span>Tip</span>
              <span>Preț extra (RON)</span>
              <span />
            </div>

            {customizations.map((customization, index) => (
              <div className="menu-customizations-row" key={`${customization.id ?? 'new'}-${index}`}>
                <span className="menu-customizations-index">{index + 1}</span>

                <div className="menu-customizations-cell">
                  <input
                    type="text"
                    value={customization.optionName}
                    onChange={(event) => handleCustomizationChange(index, 'optionName', event.target.value)}
                    placeholder="Ex: Extra bacon"
                    aria-label={`Nume personalizare în română ${index + 1}`}
                  />
                  {customization.id ? <small>ID #{customization.id}</small> : null}
                </div>

                <div className="menu-customizations-cell">
                  <input
                    type="text"
                    value={customization.optionNameEn}
                    onChange={(event) => handleCustomizationChange(index, 'optionNameEn', event.target.value)}
                    placeholder="Ex: Extra bacon"
                    aria-label={`Nume personalizare în engleză ${index + 1}`}
                  />
                </div>

                <div className="menu-customizations-cell">
                  <input
                    type="text"
                    list="menu-customization-type-options"
                    value={customization.optionType}
                    onChange={(event) => handleCustomizationChange(index, 'optionType', event.target.value)}
                    placeholder="option"
                    aria-label={`Tip personalizare ${index + 1}`}
                  />
                </div>

                <div className="menu-customizations-cell menu-customizations-cell--price">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customization.extraPrice}
                    onChange={(event) => handleCustomizationChange(index, 'extraPrice', event.target.value)}
                    placeholder="0"
                    aria-label={`Preț suplimentar personalizare ${index + 1}`}
                  />
                </div>

                <div className="menu-customizations-actions">
                  <button
                    type="button"
                    className="menu-product-button menu-product-button--ghost"
                    onClick={() => handleRemoveCustomization(index)}
                    title="Șterge personalizarea"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <datalist id="menu-customization-type-options">
            {CUSTOMIZATION_TYPE_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>

          <div className="menu-customizations-footer">
            <button
              type="button"
              className="menu-product-button menu-product-button--secondary"
              onClick={handleAddCustomization}
            >
              ➕ Adaugă opțiune
            </button>
            <p>
              Opțiunile sunt sincronizate cu aplicațiile client și se regăsesc în rapoarte, bonuri și comenzi online. Lasă prețul la 0 pentru opțiuni
              fără cost suplimentar.
            </p>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🍽️ Nutriție & rețetă</h3>
            <p>Valorile nutriționale și configurarea rețetei sunt completate automat din editorul de rețete.</p>
          </header>

          <div className="menu-product-grid menu-product-grid--four">
            <label className="menu-product-field">
              <span>Calorii</span>
              <input type="number" value={formState.calories} onChange={handleInputChange('calories')} placeholder="kcal" />
            </label>
            <label className="menu-product-field">
              <span>Proteine (g)</span>
              <input type="number" value={formState.protein} onChange={handleInputChange('protein')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>Carbohidrați (g)</span>
              <input type="number" value={formState.carbs} onChange={handleInputChange('carbs')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>Grăsimi (g)</span>
              <input type="number" value={formState.fat} onChange={handleInputChange('fat')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>Fibre (g)</span>
              <input type="number" value={formState.fiber} onChange={handleInputChange('fiber')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>Sodiu (mg)</span>
              <input type="number" value={formState.sodium} onChange={handleInputChange('sodium')} placeholder="mg" />
            </label>
            <label className="menu-product-field">
              <span>Zahăr (g)</span>
              <input type="number" value={formState.sugar} onChange={handleInputChange('sugar')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>Sare (g)</span>
              <input type="number" value={formState.salt} onChange={handleInputChange('salt')} placeholder="g" />
            </label>
          </div>

          <div className="menu-product-hint">
            <span>🔗 Status rețetă: {formState.hasRecipe ? 'Configurată' : 'Necalculată'}</span>
            <span>Utilizează editorul „👨‍🍳 Editor rețetă” pentru a ajusta ingredientele și alergeni.</span>
          </div>

          <label className="menu-product-field menu-product-field--full">
            <span>Ingrediente (JSON / notițe temporare)</span>
            <textarea
              value={formState.ingredients}
              onChange={handleInputChange('ingredients')}
              placeholder="Date brute pentru integrare viitoare. Recomandăm utilizarea editorului dedicat rețetelor."
              rows={3}
            />
          </label>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>📸 Imagine produs</h3>
            <p>Acceptă fișiere .jpg, .png sau .webp. Dimensiune recomandată 800x600px.</p>
          </header>

          <div className="menu-product-image">
            <div className="menu-product-image__preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Previzualizare produs" />
              ) : (
                <div className="menu-product-image__placeholder">
                  <span role="img" aria-label="camera">
                    📷
                  </span>
                  <p>Nicio imagine selectată</p>
                </div>
              )}
            </div>

            <div className="menu-product-image__actions">
              <label className="menu-product-button menu-product-button--secondary">
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                Selectează imagine
              </label>

              {imagePreview ? (
                <button type="button" className="menu-product-button menu-product-button--ghost" onClick={handleRemoveImage}>
                  Elimină imaginea
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="menu-product-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>
            Anulează
          </button>
          <button
            type="submit"
            className="menu-product-button menu-product-button--primary"
            disabled={loading || customizationsLoading}
          >
            {loading || customizationsLoading ? 'Se salvează…' : 'Salvează produsul'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

