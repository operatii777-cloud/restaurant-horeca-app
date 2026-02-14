import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { AllergenSelector } from './AllergenSelector';
import { AdditiveSelector } from './AdditiveSelector';
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
  const { t } = useTranslation();
  const { mutate, loading, error, reset } = useApiMutation<{
    message?: string;
    customizations?: ProductCustomizationOption[];
  }>();
  const [formState, setFormState] = useState<MenuProductFormValues>(DEFAULT_FORM_VALUES);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<CustomizationFormRow[]>([]);
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
        setCustomizations([]);
        setCustomizationsError(null);
        setCustomizationsLoading(true);
      } else {
        setFormState(DEFAULT_FORM_VALUES);
        setImagePreview(null);
        setCustomizations([]);
        setCustomizationsError(null);
        setCustomizationsLoading(false);
      }
      reset();
    } else {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setCustomizations([]);
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
      setCustomizations([]);
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
            : [];

        setCustomizations(mapped);
      } catch (fetchError) {
        if (isCanceled || (fetchError instanceof DOMException && fetchError.name === 'AbortError')) {
          return;
        }
        console.error('Nu am putut încărca personalizările produsului:', fetchError);
        setCustomizationsError('Nu am putut încărca personalizările produsului. Poți continua editarea și salva opțiunile manual.');
        setCustomizations([]);
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
    if (formState.description) formData.append("Description", formState.description);
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
      const baseMessage = response?.message ?? (mode === 'create' ? t('menu.messages.productAddedSuccess') : t('menu.messages.productUpdatedSuccess'));
      const customizationSummary =
        Array.isArray(response?.customizations) && response.customizations.length > 0
          ? ` ${t('menu.messages.customizationsActive')} ${response.customizations.length}.`
          : normalizedCustomizations.length > 0
            ? ` ${t('menu.messages.customizationsSynced')}`
            : '';
      onSaved(`${baseMessage}${customizationSummary}`.trim());
    }
  };

  const modalTitle = mode === 'create' ? t('menu.products.add') : `${t('menu.products.edit')} — ${product?.name ?? ''}`;

  return (
    <Modal isOpen={open} title={modalTitle} size="full" onClose={onClose}>
      {error ? <InlineAlert variant="error" title={t('menu.messages.error')} message={error} /> : null}

      <form className="menu-product-form" onSubmit={handleSubmit}>
        <section className="menu-product-section">
          <header>
            <h3>📋 {t('menu.productModal.generalDetails')}</h3>
            <p>{t('menu.productModal.generalDetailsSubtitle')}</p>
          </header>

          <div className="menu-product-grid menu-product-grid--two">
            <label className="menu-product-field">
              <span>{t('menu.productModal.productName')} *</span>
              <input
                type="text"
                value={formState.name}
                onChange={handleInputChange('name')}
                required
                placeholder={t('menu.productModal.productNamePlaceholder')}
              />
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.productNameEn')}</span>
              <input
                type="text"
                value={formState.nameEn}
                onChange={handleInputChange('nameEn')}
                placeholder={t('menu.productModal.productNameEnPlaceholder')}
              />
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.category')} *</span>
              <input
                list="menu-category-options"
                value={formState.category}
                onChange={handleInputChange('category')}
                required
                placeholder={t('menu.productModal.categoryPlaceholder')}
              />
              <datalist id="menu-category-options">
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.categoryEn')}</span>
              <input
                type="text"
                value={formState.categoryEn}
                onChange={handleInputChange('categoryEn')}
                placeholder={t('menu.productModal.categoryEnPlaceholder')}
              />
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.priceRon')} *</span>
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
              <span>{t('menu.productModal.vatPercent')}</span>
              <select value={formState.vatRate} onChange={handleInputChange('vatRate')}>
                {VAT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.unitOfMeasure')}</span>
              <select value={formState.unit} onChange={handleInputChange('unit')}>
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.weightVolume')}</span>
              <input
                type="text"
                value={formState.weight}
                onChange={handleInputChange('weight')}
                placeholder={t('menu.productModal.weightVolumePlaceholder')}
              />
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.displayOrder')}</span>
              <input
                type="number"
                min="0"
                value={formState.displayOrder}
                onChange={handleInputChange('displayOrder')}
                placeholder={t('menu.productModal.displayOrderPlaceholder')}
              />
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.costPrice')}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.costPrice}
                onChange={handleInputChange('costPrice')}
                placeholder={t('menu.productModal.costPricePlaceholder')}
              />
            </label>
          </div>

          <div className="menu-product-switches">
            <label>
              <input type="checkbox" checked={formState.isSellable} onChange={handleCheckboxChange('isSellable')} />
              {t('menu.productModal.availableForSale')}
            </label>
            <label>
              <input type="checkbox" checked={formState.isActive} onChange={handleCheckboxChange('isActive')} />
              {t('menu.productModal.activeInMenu')}
            </label>
            <label>
              <input type="checkbox" checked={formState.isFraction} onChange={handleCheckboxChange('isFraction')} />
              {t('menu.productModal.allowFractions')}
            </label>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🏭 {t('menu.productModal.inventoryPreparation')}</h3>
            <p>{t('menu.productModal.inventoryPreparationSubtitle')}</p>
          </header>

          <div className="menu-product-grid menu-product-grid--three">
            <label className="menu-product-field">
              <span>{t('menu.productModal.stockManagement')}</span>
              <input
                list="menu-stock-options"
                value={formState.stockManagement}
                onChange={handleInputChange('stockManagement')}
                placeholder={t('menu.productModal.stockManagementPlaceholder')}
              />
              <datalist id="menu-stock-options">
                {STOCK_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.preparationSection')}</span>
              <input
                list="menu-preparation-options"
                value={formState.preparationSection}
                onChange={handleInputChange('preparationSection')}
                placeholder={t('menu.productModal.preparationSectionPlaceholder')}
              />
              <datalist id="menu-preparation-options">
                {PREPARATION_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>{t('menu.productModal.preparationTime')}</span>
              <input
                type="number"
                min="0"
                value={formState.prepTime}
                onChange={handleInputChange('prepTime')}
                placeholder={t('menu.productModal.preparationTimePlaceholder')}
              />
            </label>
          </div>

          <div className="menu-product-switches">
            <label>
              <input type="checkbox" checked={formState.isVegetarian} onChange={handleCheckboxChange('isVegetarian')} />
              🌱 {t('menu.productModal.vegetarian')}
            </label>
            <label>
              <input type="checkbox" checked={formState.isSpicy} onChange={handleCheckboxChange('isSpicy')} />
              🌶️ {t('menu.productModal.spicy')}
            </label>
            <label>
              <input type="checkbox" checked={formState.isTakeoutOnly} onChange={handleCheckboxChange('isTakeoutOnly')} />
              📦 {t('menu.productModal.takeoutOnly')}
            </label>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>📝 {t('menu.productModal.descriptionInfo')}</h3>
            <p>{t('menu.productModal.descriptionInfoSubtitle')}</p>
          </header>

          <label className="menu-product-field menu-product-field--full">
            <span>{t('menu.productModal.descriptionRo')}</span>
            <textarea
              value={formState.description}
              onChange={handleInputChange("Description")}
              placeholder={t('menu.productModal.descriptionRoPlaceholder')}
              rows={3}
            />
          </label>

          <label className="menu-product-field menu-product-field--full">
            <span>{t('menu.productModal.descriptionEn')}</span>
            <textarea
              value={formState.descriptionEn}
              onChange={handleInputChange('descriptionEn')}
              placeholder={t('menu.productModal.descriptionEnPlaceholder')}
              rows={3}
            />
          </label>

          <div className="menu-product-field menu-product-field--full">
            <AllergenSelector
              value={formState.allergens}
              onChange={(value) => {
                setFormState((prev) => ({ ...prev, allergens: value }));
              }}
              label={t('menu.productModal.allergens')}
              placeholder={t('menu.productModal.descriptionRoPlaceholder')}
            />
          </div>
          
          {/* Additives selector */}
          <div className="menu-product-field menu-product-field--full mt-3">
            <AdditiveSelector
              value={formState.allergensEn || '[]'} // Reuse allergensEn field for additives JSON
              onChange={(value) => {
                setFormState((prev) => ({ ...prev, allergensEn: value }));
              }}
              label={t('menu.productModal.additives')}
              placeholder={t('menu.productModal.descriptionRoPlaceholder')}
            />
          </div>

          <label className="menu-product-field menu-product-field--full">
            <span>{t('menu.productModal.ingredients')}</span>
            <textarea
              value={formState.info}
              onChange={handleInputChange('info')}
              placeholder={t('menu.productModal.ingredientsPlaceholder')}
              rows={2}
            />
          </label>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🎛️ {t('menu.productModal.customizations')}</h3>
            <p>{t('menu.productModal.customizationsSubtitle')}</p>
          </header>

          {customizationsLoading ? (
            <div className="menu-customizations-state">{t('common.loading')}</div>
          ) : null}

          {customizationsError ? (
            <InlineAlert variant="warning" title={t('menu.productModal.customizations')} message={customizationsError} />
          ) : null}

          <div className="menu-customizations-table">
            <div className="menu-customizations-header">
              <span>#</span>
              <span>{t('menu.productModal.customizationName')} (RO)</span>
              <span>{t('menu.productModal.customizationNameEn')}</span>
              <span>{t('common.type')}</span>
              <span>{t('menu.productModal.customizationPrice')} (RON)</span>
              <span />
            </div>

            {customizations.map((customization, index) => (
              <div className="menu-customizations-row" key={`${customization.id ?? 'new'}-"Index"`}>
                <span className="menu-customizations-index">{index + 1}</span>

                <div className="menu-customizations-cell">
                  <input
                    type="text"
                    value={customization.optionName}
                    onChange={(event) => handleCustomizationChange(index, 'optionName', event.target.value)}
                    placeholder={t('menu.productModal.customizationNamePlaceholder')}
                    aria-label={`${t('menu.productModal.customizationName')} ${index + 1}`}
                  />
                  {customization.id ? <small>ID #{customization.id}</small> : null}
                </div>

                <div className="menu-customizations-cell">
                  <input
                    type="text"
                    value={customization.optionNameEn}
                    onChange={(event) => handleCustomizationChange(index, 'optionNameEn', event.target.value)}
                    placeholder={t('menu.productModal.customizationNameEnPlaceholder')}
                    aria-label={`${t('menu.productModal.customizationNameEn')} ${index + 1}`}
                  />
                </div>

                <div className="menu-customizations-cell">
                  <input
                    type="text"
                    list="menu-customization-type-options"
                    value={customization.optionType}
                    onChange={(event) => handleCustomizationChange(index, 'optionType', event.target.value)}
                    placeholder="option"
                    aria-label={`${t('common.type')} ${index + 1}`}
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
                    aria-label={`${t('menu.productModal.customizationPrice')} ${index + 1}`}
                  />
                </div>

                <div className="menu-customizations-actions">
                  <button
                    type="button"
                    className="menu-product-button menu-product-button--ghost"
                    onClick={() => handleRemoveCustomization(index)}
                    title={t('actions.delete')}
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
              ➕ {t('menu.productModal.addCustomization')}
            </button>
            <p>
              {t('menu.productModal.customizationsSubtitle')}
            </p>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🍽️ {t('menu.productModal.nutritionalInfo')}</h3>
            <p>{t('menu.productModal.nutritionalInfoSubtitle')}</p>
          </header>

          <div className="menu-product-grid menu-product-grid--four">
            <label className="menu-product-field">
              <span>{t('menu.productModal.calories')}</span>
              <input type="number" value={formState.calories} onChange={handleInputChange('calories')} placeholder="kcal" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.protein')}</span>
              <input type="number" value={formState.protein} onChange={handleInputChange('protein')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.carbs')}</span>
              <input type="number" value={formState.carbs} onChange={handleInputChange('carbs')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.fat')}</span>
              <input type="number" value={formState.fat} onChange={handleInputChange('fat')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.fiber')}</span>
              <input type="number" value={formState.fiber} onChange={handleInputChange('fiber')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.sodium')}</span>
              <input type="number" value={formState.sodium} onChange={handleInputChange('sodium')} placeholder="mg" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.sugar')}</span>
              <input type="number" value={formState.sugar} onChange={handleInputChange('sugar')} placeholder="g" />
            </label>
            <label className="menu-product-field">
              <span>{t('menu.productModal.salt')}</span>
              <input type="number" value={formState.salt} onChange={handleInputChange('salt')} placeholder="g" />
            </label>
          </div>

          <div className="menu-product-hint">
            <span>🔗 {t('common.status')}: {formState.hasRecipe ? t('common.active') : t('common.inactive')}</span>
            <span>{t('menu.productModal.ingredients')}</span>
          </div>

          <label className="menu-product-field menu-product-field--full">
            <span>{t('menu.productModal.ingredients')} (JSON)</span>
            <textarea
              value={formState.ingredients}
              onChange={handleInputChange('ingredients')}
              placeholder={t('menu.productModal.ingredientsPlaceholder')}
              rows={3}
            />
          </label>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>📸 {t('menu.productModal.productImage')}</h3>
            <p>{t('menu.productModal.productImageSubtitle')}</p>
          </header>

          <div className="menu-product-image">
            <div 
              className="menu-product-image__preview"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add('drag-over');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('drag-over');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  setFormState((prev) => ({ ...prev, imageFile: file }));
                  if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                  }
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              style={{ 
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt={t('menu.productModal.imagePreview')}
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="menu-product-image__placeholder">
                  <span role="img" aria-label="camera" style={{ fontSize: '48px' }}>
                    📷
                  </span>
                  <p>{t('menu.productModal.uploadImage')}</p>
                  <small style={{ color: '#666' }}>{t('menu.productModal.productImageSubtitle')}</small>
                </div>
              )}
            </div>

            <div className="menu-product-image__actions">
              <label className="menu-product-button menu-product-button--secondary">
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                {t('menu.productModal.uploadImage')}
              {imagePreview ? (
                <button type="button" className="menu-product-button menu-product-button--ghost" onClick={handleRemoveImage}>"elimina imaginea"</button>
                <button type="button" className="menu-product-button menu-product-button--ghost" onClick={handleRemoveImage}>
                  {t('menu.productModal.removeImage')}
                </button>
        </section>

        <footer className="menu-product-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>
            {t('actions.cancel')}
          </button>
            disabled={loading || customizationsLoading}
          >
            {loading || customizationsLoading ? t('menu.productModal.saving') : t('menu.productModal.saveChanges')}
          </button>
        </footer>
      </form>
    </Modal>
  );
}





