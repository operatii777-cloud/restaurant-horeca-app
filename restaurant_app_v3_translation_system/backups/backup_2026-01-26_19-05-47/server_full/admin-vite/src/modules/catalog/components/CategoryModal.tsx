// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/shared/components/Modal';
import { SmartForm, type SmartFormField } from '@/shared/components/SmartForm';
import { InlineAlert } from '@/shared/components/InlineAlert';
import type { CatalogCategory } from '@/types/catalog';

type CategoryModalProps = {
  open: boolean;
  categories: CatalogCategory[];
  initialCategory?: CatalogCategory | null;
  parentId?: number | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; name_en?: string | null; icon?: string | null; parent_id: number | null }) => Promise<void>;
};

type CategoryFormValues = {
  name: string;
  name_en?: string;
  icon?: string;
  parent_id?: string;
};

export const CategoryModal = ({ open, categories, initialCategory, parentId = null, onClose, onSubmit }: CategoryModalProps) => {
//   const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: CategoryFormValues = useMemo(
    () => ({
      name: initialCategory?.name ?? '',
      name_en: initialCategory?.name_en ?? undefined,
      icon: initialCategory?.icon ?? '📁',
      parent_id:
        initialCategory && initialCategory.parent_id
          ? String(initialCategory.parent_id)
          : parentId !== null
            ? String(parentId)
            : '',
    }),
    [initialCategory, parentId],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setSubmitError(null);
    }
  }, [defaultValues, open, reset]);

  const categoryOptions = useMemo(() => {
    const flatten = (nodes: CatalogCategory[], depth = 0): { label: string; value: string }[] =>
      nodes.flatMap((node) => {
        if (initialCategory && node.id === initialCategory.id) {
          return [];
        }
        const label = `${'‒ '.repeat(depth)}${node.name}`;
        const current = [{ label, value: String(node.id) }];
        const children = node.children ? flatten(node.children, depth + 1) : [];
        return [...current, ...children];
      });

    return flatten(categories, 0);
  }, [categories, initialCategory]);

  const fields: SmartFormField[] = [
    {
      name: 'name',
      label: 'Nume categorie',
      type: 'text',
      required: true,
      placeholder: 'Ex: Cocktailuri',
    },
    {
      name: 'name_en',
      label: 'Nume (EN)',
      type: 'text',
      placeholder: 'Ex: Cocktails',
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'text',
      helperText: 'Folosește un emoji sau două caractere',
      placeholder: '🍹',
    },
    {
      name: 'parent_id',
      label: 'Categorie părinte',
      type: 'select',
      options: [
        { label: 'Fără părinte (nivel root)', value: '' },
        ...categoryOptions,
      ],
    },
  ];

  const submitHandler = async (values: CategoryFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        name: values.name.trim(),
        name_en: values.name_en?.trim() || null,
        icon: values.icon?.trim() || null,
        parent_id: values.parent_id ? Number(values.parent_id) : null,
      });
      onClose();
      reset(defaultValues);
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
        (error instanceof Error ? error.message : 'Nu s-a putut salva categoria.');
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!submitting) {
          onClose();
        }
      }}
      title={initialCategory ? `Editează categoria „${initialCategory.name}”` : 'Adaugă categorie nouă'}
      description="Administrează structura meniurilor și a meniurilor digitale."
      size="md"
    >
      {submitError ? <InlineAlert variant="error" message={submitError} /> : null}
      <SmartForm
        fields={fields}
        control={control}
        errors={errors}
        onSubmit={handleSubmit(submitHandler)}
        submitLabel={initialCategory ? 'Salvează modificările' : 'Creează categoria'}
        loading={submitting}
        layoutColumns={1}
        secondaryAction={
          <button type="button" className="smart-form__cancel" onClick={onClose} disabled={submitting}>"Anulează"</button>
        }
      />
    </Modal>
  );
};




