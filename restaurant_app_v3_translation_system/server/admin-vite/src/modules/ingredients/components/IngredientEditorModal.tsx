// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/Modal';
import { SmartForm, type SmartFormField } from '@/shared/components/SmartForm';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import type { Ingredient } from '@/types/ingredients';
import { httpClient } from '@/shared/api/httpClient';
import { ingredientFormSchema, type IngredientFormValues } from '@/modules/ingredients/validators/ingredientForm';
import './IngredientEditorModal.css';

const UNIT_OPTIONS = ['g', 'kg', 'ml', 'l', 'pcs', 'buc', 'portie', 'cutie', 'litru'];

interface IngredientEditorModalProps {
  open: boolean;
  ingredient?: Ingredient | null;
  onClose: () => void;
  onSaved: () => void;
}

type CategoryRecord = {
  id: number;
  name_ro: string;
  name_en?: string;
  parent_id?: number | null;
};

type SupplierRecord = {
  id: number;
  name: string;
  is_active?: number | boolean;
};

export function IngredientEditorModal({ open, ingredient, onClose, onSaved }: IngredientEditorModalProps) {
//   const { t } = useTranslation();
  const isEditing = Boolean(ingredient?.id);

  const { data: categoriesData } = useApiQuery<CategoryRecord[]>(
    open ? '/api/ingredient-categories?activeOnly=true' : null,
  );
  const { data: suppliersData } = useApiQuery<SupplierRecord[]>(open ? '/api/suppliers?activeOnly=true' : null);

  const categoryOptions = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) {
      return [];
    }
    return categoriesData.map((category) => ({
      label: category.name_ro,
      value: category.name_ro,
    }));
  }, [categoriesData]);

  const supplierOptions = useMemo(() => {
    if (!suppliersData || !Array.isArray(suppliersData)) {
      return [];
    }
    return suppliersData.map((supplier) => ({
      label: supplier.name,
      value: supplier.id,
    }));
  }, [suppliersData]);

  const { mutate, loading, error, reset } = useApiMutation();

  const defaultValues = useMemo<IngredientFormValues>(() => {
    if (!ingredient) {
      return {
        name: '',
        official_name: undefined,
        category: '',
        category_custom: undefined,
        unit: '',
        unit_custom: undefined,
        current_stock: undefined,
        min_stock: undefined,
        max_stock: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
        safety_stock: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
        reorder_quantity: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
        purchase_unit: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
        recipe_unit: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
        inventory_unit: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
        purchase_to_inventory_factor: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
        inventory_to_recipe_factor: undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
        cost_per_unit: undefined,
        origin_country: undefined,
        default_supplier_id: null,
        default_supplier_id_custom: undefined,
        haccp_notes: undefined,
        is_visible: true,
      };
    }

    return {
      name: ingredient.name ?? '',
      official_name: ingredient.official_name ?? undefined,
      category: ingredient.category ?? '',
      category_custom: undefined,
      unit: ingredient.unit ?? '',
      unit_custom: undefined,
      current_stock: ingredient.current_stock ?? undefined,
      min_stock: ingredient.min_stock ?? undefined,
      max_stock: (ingredient as any).max_stock ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
      safety_stock: (ingredient as any).safety_stock ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
      reorder_quantity: (ingredient as any).reorder_quantity ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
      purchase_unit: (ingredient as any).purchase_unit ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      recipe_unit: (ingredient as any).recipe_unit ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      inventory_unit: (ingredient as any).inventory_unit ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      purchase_to_inventory_factor: (ingredient as any).purchase_to_inventory_factor ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      inventory_to_recipe_factor: (ingredient as any).inventory_to_recipe_factor ?? undefined,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      cost_per_unit: ingredient.cost_per_unit ?? undefined,
      origin_country: ingredient.origin_country ?? undefined,
      default_supplier_id: ingredient.default_supplier_id ?? null,
      default_supplier_id_custom: undefined,
      haccp_notes: ingredient.haccp_notes ?? undefined,
      is_visible: !(ingredient.is_hidden === 1 || ingredient.is_hidden === true),
    };
  }, [ingredient]);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset();
      resetForm(defaultValues);
    } else {
      resetForm(defaultValues);
    }
  }, [open, reset, resetForm, defaultValues]);

  const fields = useMemo<SmartFormField[]>(
    () => [
      {
        name: 'name',
        label: 'Nume ingredient',
        type: 'text',
        placeholder: 'Ex: Anchois file',
        required: true,
      },
      {
        name: 'official_name',
        label: 'Denumire oficială',
        type: 'text',
        placeholder: 'Ex: Pește Anchois file (conservat în ulei)',
      },
      {
        name: 'category',
        label: 'Categorie',
        type: 'select',
        options: categoryOptions,
        required: true,
        allowCustomOption: true,
        customOptionLabel: 'Introdu categorie personalizată',
        customFieldPlaceholder: 'Categorie nouă (ex: Pește)',
      },
      {
        name: 'unit',
        label: 'Unitate de măsură (inventar)',
        type: 'select',
        options: UNIT_OPTIONS.map((unit) => ({ label: unit.toUpperCase(), value: unit })),
        required: true,
        allowCustomOption: true,
        customOptionLabel: 'Altă unitate',
        customFieldPlaceholder: 'Introdu unitate (ex: bax)',
        helperText: 'Unitatea folosită în gestiune (inventar)',
      },
      // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4: Purchase Units
      {
        name: 'purchase_unit',
        label: 'Unitate de cumpărare',
        type: 'select',
        options: UNIT_OPTIONS.map((unit) => ({ label: unit.toUpperCase(), value: unit })),
        allowCustomOption: true,
        customOptionLabel: 'Altă unitate',
        customFieldPlaceholder: 'Introdu unitate (ex: cutie)',
        helperText: 'Unitatea în care se cumpără de la furnizor (ex: cutie de 10kg)',
      },
      {
        name: 'recipe_unit',
        label: 'Unitate în rețete',
        type: 'select',
        options: UNIT_OPTIONS.map((unit) => ({ label: unit.toUpperCase(), value: unit })),
        allowCustomOption: true,
        customOptionLabel: 'Altă unitate',
        customFieldPlaceholder: 'Introdu unitate (ex: lingură)',
        helperText: 'Unitatea folosită în rețete (poate diferi de inventar)',
      },
      {
        name: 'purchase_to_inventory_factor',
        label: 'Factor conversie: Cumpărare â†’ Inventar',
        type: 'number',
        placeholder: '1',
        step: 0.001,
        helperText: 'Ex: 1 cutie = 10 kg â†’ factor = 10',
      },
      {
        name: 'inventory_to_recipe_factor',
        label: 'Factor conversie: Inventar â†’ Rețetă',
        type: 'number',
        placeholder: '1',
        step: 0.001,
        helperText: 'Ex: 1 kg = 1000 g â†’ factor = 1000',
      },
      {
        name: "Stoc Actual",
        label: 'Stoc curent',
        type: 'number',
        placeholder: '0',
        helperText: 'Valoarea actuală din gestiune (se poate lăsa 0 pentru ingrediente noi)',
      },
      {
        name: "Stoc Minim",
        label: 'Stoc minim (Reorder Point)',
        type: 'number',
        placeholder: '5',
        helperText: 'Când stocul scade sub această valoare, sistemul va genera alertă',
      },
      {
        name: 'safety_stock',
        label: 'Stoc siguranță',
        type: 'number',
        placeholder: '2',
        helperText: 'Buffer pentru cerere neașteptată (trebuie să fie între min și max)',
      },
      {
        name: "Stoc Maxim",
        label: 'Stoc maxim (Par Level)',
        type: 'number',
        placeholder: '50',
        helperText: 'Cantitatea maximă recomandată în stoc (trebuie să fie > min_stock)',
      },
      {
        name: 'reorder_quantity',
        label: 'Cantitate comandă',
        type: 'number',
        placeholder: '20',
        helperText: 'Cantitatea recomandată la comandă (EOQ - Economic Order Quantity)',
      },
      {
        name: "Cost/Unitate",
        label: 'Cost / unitate (RON)',
        type: 'number',
        placeholder: '0.00',
        step: 0.01,
      },
      {
        name: 'origin_country',
        label: 'Èšară de origine',
        type: 'text',
        placeholder: 'Ex: Spania',
      },
      {
        name: 'default_supplier_id',
        label: 'Furnizor principal',
        type: 'select',
        options: supplierOptions,
        allowCustomOption: true,
        customOptionLabel: 'Adaugă furnizor nou',
        customFieldPlaceholder: 'Nume furnizor nou',
      },
      {
        name: 'haccp_notes',
        label: 'Note HACCP / trasabilitate',
        type: 'textarea',
        placeholder: 'Respectă lanțul rece 0-4Â°C. Consum în max. 48h după deschiderea lotului.',
        colSpan: 2,
      },
      {
        name: 'is_visible',
        label: 'Disponibil în aplicație',
        type: 'checkbox',
        placeholder: 'Ingredient vizibil în rețete și stocuri',
      },
    ],
    [categoryOptions, supplierOptions],
  );

  const onSubmit = async (values: IngredientFormValues) => {
    const categoryValue = values.category === '__custom__' ? values.category_custom : values.category;
    const unitValue = values.unit === '__custom__' ? values.unit_custom : values.unit;

    let defaultSupplierId: number | null = null;
    if (values.default_supplier_id === '__custom__') {
      const customSupplierName = values.default_supplier_id_custom;
      if (customSupplierName) {
        const response = await httpClient.post('/api/suppliers', { company_name: customSupplierName });
        const supplierId = (response.data as { supplier_id?: number })?.supplier_id;
        if (supplierId) {
          defaultSupplierId = supplierId;
        }
      }
    } else if (typeof values.default_supplier_id === 'number') {
      defaultSupplierId = values.default_supplier_id;
    } else if (values.default_supplier_id === null) {
      defaultSupplierId = null;
    }

    const payload: Record<string, unknown> = {
      name: values.name,
      official_name: values.official_name ?? null,
      category: categoryValue ?? null,
      unit: unitValue ?? null,
      current_stock: values.current_stock ?? 0,
      min_stock: values.min_stock ?? 0,
      max_stock: (values as any).max_stock ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
      safety_stock: (values as any).safety_stock ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
      reorder_quantity: (values as any).reorder_quantity ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 1 - ZIUA 4
      purchase_unit: (values as any).purchase_unit ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      recipe_unit: (values as any).recipe_unit ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      inventory_unit: (values as any).inventory_unit ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      purchase_to_inventory_factor: (values as any).purchase_to_inventory_factor ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      inventory_to_recipe_factor: (values as any).inventory_to_recipe_factor ?? null,  // [Check] SÄ‚PTÄ‚MÃ‚NA 2 - ZIUA 4
      cost_per_unit: values.cost_per_unit ?? 0,
      origin_country: values.origin_country ?? null,
      default_supplier_id: defaultSupplierId,
      haccp_notes: values.haccp_notes ?? null,
      is_hidden: values.is_visible ? 0 : 1,
    };

    const endpoint = isEditing && ingredient ? `/api/ingredients/${ingredient.id}` : '/api/ingredients';
    const method = isEditing ? 'put' : 'post';

    const result = await mutate({ url: endpoint, method, data: payload });

    if (result !== null) {
      onSaved();
      resetForm(defaultValues);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEditing ? `Editează ingredientul "ž${ingredient?.name}"` : 'Adaugă ingredient'}
      description="Completează informațiile pentru trasabilitate și gestiune stocuri. Câmpurile obligatorii sunt marcate cu *."
      size="xl"
    >
      {error ? <InlineAlert type="error" message={error} /> : null}
      <SmartForm
        fields={fields}
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={isEditing ? 'Actualizează ingredientul' : 'Adaugă ingredientul'}
        loading={loading}
        layoutColumns={2}
        secondaryAction={
          <button
            type="button"
            className="smart-form__cancel"
            onClick={() => {
              reset();
              resetForm(defaultValues);
              onClose();
            }}
          >"Anulează"</button>
        }
      />
    </Modal>
  );
}




