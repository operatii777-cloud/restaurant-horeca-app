// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/Modal';
import { SmartForm, type SmartFormField } from '@/shared/components/SmartForm';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import type { CatalogProduct } from '@/types/catalog';
import { productFormSchema, type ProductFormValues } from '@/modules/catalog/validators/productForm';
import './ProductEditorModal.css';

type CategoryTreeNode = {
  id: number;
  name: string;
  name_en?: string;
  children?: CategoryTreeNode[];
};

interface ProductEditorModalProps {
  open: boolean;
  product?: CatalogProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

const STOCK_OPTIONS = [
  { label: 'FIFO / scade din stoc', value: 'fifo' },
  { label: 'Fără gestiune stoc', value: 'none' },
];

const PREPARATION_SECTIONS = ['Bucătărie', 'Pizzerie', 'Bar', 'Desert', 'Livrare'];

export function ProductEditorModal({ open, product, onClose, onSaved }: ProductEditorModalProps) {
//   const { t } = useTranslation();
  const isEditing = Boolean(product?.id);

  const { data: categoriesData } = useApiQuery<CategoryTreeNode[]>(open ? '/api/catalog/categories/tree' : null);

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(categoriesData)) return [];

    const flatten = (nodes: CategoryTreeNode[], prefix = ''): { label: string; value: string }[] => {
      return nodes.flatMap((node) => {
        const label = prefix ? `"Prefix" › ${node.name}` : node.name;
        const current = [{ label, value: node.name }];
        const children = node.children ? flatten(node.children, label) : [];
        return [...current, ...children];
      });
    };

    return flatten(categoriesData);
  }, [categoriesData]);

  const { mutate, loading, error, reset } = useApiMutation();

  const defaultValues = useMemo<ProductFormValues>(() => {
    if (!product) {
      return {
        name: '',
        name_en: undefined,
        category: '',
        price: 0,
        vat_rate: 9,
        unit: '',
        preparation_section: '',
        preparation_section_custom: undefined,
        stock_management: 'fifo',
        display_order: null,
        for_sale: true,
        has_recipe: false,
        description: undefined,
        description_en: undefined,
      };
    }

    const stockManagement: 'fifo' | 'none' = product.stock_management === 'none' ? 'none' : 'fifo';

    return {
      name: product.name ?? '',
      name_en: product.name_en ?? undefined,
      category: product.category ?? '',
      price: product.price ?? 0,
      vat_rate: product.vat_rate ?? 9,
      unit: product.unit ?? '',
      preparation_section: product.preparation_section ?? '',
      preparation_section_custom: undefined,
      stock_management: stockManagement,
      display_order: product.display_order ?? null,
      for_sale: product.for_sale === 1 || product.for_sale === true,
      has_recipe: product.has_recipe === 1 || product.has_recipe === true,
      description: product.description ?? undefined,
      description_en: product.description_en ?? undefined,
    };
  }, [product]);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
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
      { name: 'name', label: 'Nume produs', type: 'text', required: true, placeholder: 'Ex: Gin Tonic' },
      { name: 'name_en', label: 'Nume (EN)', type: 'text', placeholder: 'Ex: Gin & Tonic' },
      {
        name: 'category',
        label: 'Categorie',
        type: 'select',
        options: categoryOptions,
        required: true,
      },
      {
        name: 'price',
        label: 'Preț vânzare (RON)',
        type: 'number',
        step: 0.1,
        required: true,
      },
      {
        name: 'vat_rate',
        label: 'TVA %',
        type: 'number',
        step: 1,
        required: true,
        helperText: 'Ex: 9 pentru alimentație, 19 pentru băuturi alcoolice',
      },
      {
        name: 'unit',
        label: 'Unitate de măsură',
        type: 'text',
        placeholder: 'Ex: buc, ml, portie',
        required: true,
      },
      {
        name: 'preparation_section',
        label: 'Secțiune de preparare',
        type: 'select',
        options: PREPARATION_SECTIONS.map((section) => ({ label: section, value: section })),
        allowCustomOption: true,
        customOptionLabel: 'Secțiune nouă',
        customFieldPlaceholder: 'Ex: Coffee Bar',
      },
      {
        name: 'stock_management',
        label: 'Gestionare stoc',
        type: 'select',
        options: STOCK_OPTIONS,
        required: true,
      },
      {
        name: 'display_order',
        label: 'Ordine în meniu',
        type: 'number',
        helperText: 'Număr mai mic = apare mai sus în meniu',
      },
      {
        name: 'for_sale',
        label: 'Disponibil la vânzare',
        type: 'checkbox',
        placeholder: 'Produsul apare în meniuri și comenzi',
      },
      {
        name: 'has_recipe',
        label: 'Are rețetă asociată',
        type: 'checkbox',
        placeholder: 'Produsul folosește componente din stoc',
      },
      {
        name: "Description",
        label: 'Descriere (RO)',
        type: 'textarea',
        colSpan: 2,
        placeholder: 'Notează ingrediente, alergeni și informații din meniu.',
      },
      {
        name: 'description_en',
        label: 'Descriere (EN)',
        type: 'textarea',
        colSpan: 2,
      },
    ],
    [categoryOptions],
  );

  const onSubmit = async (values: ProductFormValues) => {
    const preparationSection =
      values.preparation_section === '__custom__' ? values.preparation_section_custom : values.preparation_section;

    const payload: Record<string, unknown> = {
      name: values.name,
      name_en: values.name_en ?? null,
      category: values.category,
      price: values.price,
      vat_rate: values.vat_rate,
      unit: values.unit,
      description: values.description ?? null,
      description_en: values.description_en ?? null,
      preparation_section: preparationSection ?? null,
      stock_management: values.stock_management || 'fifo',
      display_order: values.display_order ?? null,
      is_sellable: values.for_sale ? 1 : 0,
      has_recipe: values.has_recipe ? 1 : 0,
      is_active: values.for_sale ? 1 : 0,
    };

    const endpoint = isEditing && product ? `/api/catalog/products/${product.id}` : '/api/catalog/products';
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
      size="xl"
      title={isEditing ? `Editează produsul „${product?.name}”` : 'Adaugă produs în catalog'}
      description="Configurează produsul pentru meniuri digitale, PDF și POS."
    >
      {error ? <InlineAlert type="error" message={error} /> : null}

      <SmartForm
        fields={fields}
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={isEditing ? 'Actualizează produsul' : 'Adaugă produsul'}
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



