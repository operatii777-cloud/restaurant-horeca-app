import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/Modal';
import { SmartForm, type SmartFormField } from '@/shared/components/SmartForm';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { lotFormSchema, type LotFormValues } from '@/modules/lots/validators/lotForm';
import './LotEditorModal.css';

interface LotEditorModalProps {
  open: boolean;
  ingredientId: number | null;
  ingredientName?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function LotEditorModal({ open, ingredientId, ingredientName, onClose, onSaved }: LotEditorModalProps) {
  const { mutate, loading, error, reset } = useApiMutation();

  const defaultValues = useMemo<LotFormValues>(
    () => ({
      batch_number: '',
      barcode: undefined,
      quantity: 0,
      unit_cost: undefined,
      purchase_date: new Date().toISOString().split('T')[0],
      expiry_date: null,
      supplier: undefined,
      invoice_number: undefined,
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<LotFormValues>({
    resolver: zodResolver(lotFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      resetForm(defaultValues);
      reset();
    }
  }, [open, resetForm, defaultValues, reset]);

  const fields = useMemo<SmartFormField[]>(
    () => [
      {
        name: 'batch_number',
        label: 'Număr lot',
        type: 'text',
        required: true,
        placeholder: 'Ex: LOT-2025-001',
      },
      {
        name: 'barcode',
        label: 'Cod de bare',
        type: 'text',
        placeholder: 'Opțional',
      },
      {
        name: 'quantity',
        label: 'Cantitate recepționată',
        type: 'number',
        required: true,
        step: 0.01,
      },
      {
        name: 'unit_cost',
        label: 'Cost / unitate (RON)',
        type: 'number',
        step: 0.01,
      },
      {
        name: 'purchase_date',
        label: 'Dată recepție',
        type: 'date',
        required: true,
      },
      {
        name: 'expiry_date',
        label: 'Dată expirare',
        type: 'date',
      },
      {
        name: 'supplier',
        label: 'Furnizor',
        type: 'text',
        placeholder: 'Ex: Metro Cash & Carry',
      },
      {
        name: 'invoice_number',
        label: 'Număr factură',
        type: 'text',
        placeholder: 'Ex: FACT-1023',
      },
    ],
    [],
  );

  const onSubmit = async (values: LotFormValues) => {
    if (!ingredientId) return;

    const payload = {
      ...values,
      ingredient_id: ingredientId,
    };

    const result = await mutate({ url: '/api/admin/inventory/batches', method: 'post', data: payload });
    if (result !== null) {
      onSaved();
      resetForm(defaultValues);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        resetForm(defaultValues);
        reset();
        onClose();
      }}
      title={ingredientName ? `Adaugă lot pentru ${ingredientName}` : 'Adaugă lot'}
      description="Înregistrează un lot nou pentru trasabilitate și scăderea din stoc."
      size="md"
    >
      {error ? <InlineAlert type="error" message={error} /> : null}
      <SmartForm
        fields={fields}
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Salvează lotul"
        loading={loading}
        layoutColumns={1}
        secondaryAction={
          <button
            type="button"
            className="smart-form__cancel"
            onClick={() => {
              resetForm(defaultValues);
              reset();
              onClose();
            }}
          >
            Anulează
          </button>
        }
      />
    </Modal>
  );
}
