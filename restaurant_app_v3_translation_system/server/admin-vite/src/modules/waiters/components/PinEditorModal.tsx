// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import './PinEditorModal.css';

const pinEditorSchema = z
  .object({
    pin: z
      .string()
      .regex(/^\d{4}$/, 'PIN-ul trebuie să conțină exact 4 cifre.'),
    confirmPin: z.string(),
  })
  .refine((values) => values.pin === values.confirmPin, {
    message: 'PIN-urile nu se potrivesc.',
    path: ['confirmPin'],
  });

type PinEditorValues = z.infer<typeof pinEditorSchema>;

type PinEditorModalProps = {
  open: boolean;
  interfaceId: string | null;
  interfaceLabel: string;
  onClose: () => void;
  onSuccess: (pinMasked: string | null) => void;
};

export const PinEditorModal = ({ open, interfaceId, interfaceLabel, onClose, onSuccess }: PinEditorModalProps) => {
//   const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<PinEditorValues>({
    resolver: zodResolver(pinEditorSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
    },
  });

  const { mutate, loading, error, reset: resetMutation } = useApiMutation<{ pin: string | null }>();

  useEffect(() => {
    if (open) {
      reset({ pin: '', confirmPin: '' });
      resetMutation();
      setTimeout(() => setFocus('pin'), 120);
    }
  }, [open, reset, setFocus, resetMutation]);

  const onSubmit = async (values: PinEditorValues) => {
    if (!interfaceId) {
      return;
    }

    const result = await mutate({
      url: '/api/admin/update-pin',
      method: 'post',
      data: {
        interface: interfaceId,
        pin: values.pin,
      },
    });

    if (result !== null) {
      onSuccess(result?.pin ?? null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Actualizează PIN – ${interfaceLabel}`}
      description="Introduce un PIN nou de 4 cifre și confirmă actualizarea. Rotația PIN-urilor este obligatorie pentru securitate."
      size="md"
    >
      {error ? <InlineAlert type="error" message={error} /> : null}
      <form className="pin-editor__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="pin-editor__field">
          <label htmlFor="pin">PIN nou (4 cifre)</label>
          <input
            id="pin"
            type="password"
            maxLength={4}
            autoComplete="one-time-code"
            inputMode="numeric"
            {...register('pin')}
          />
          {errors.pin ? <span className="pin-editor__error">{errors.pin.message}</span> : null}
        </div>
        <div className="pin-editor__field">
          <label htmlFor="confirmPin">Confirmare PIN</label>
          <input
            id="confirmPin"
            type="password"
            maxLength={4}
            autoComplete="one-time-code"
            inputMode="numeric"
            {...register('confirmPin')}
          />
          {errors.confirmPin ? <span className="pin-editor__error">{errors.confirmPin.message}</span> : null}
        </div>
        <div className="pin-editor__actions">
          <button type="button" onClick={onClose} className="pin-editor__button pin-editor__button--secondary">"Anulează"</button>
          <button type="submit" className="pin-editor__button pin-editor__button--primary" disabled={loading}>
            {loading ? 'Se salvează…' : 'Salvează PIN-ul'}
          </button>
        </div>
      </form>
    </Modal>
  );
};





