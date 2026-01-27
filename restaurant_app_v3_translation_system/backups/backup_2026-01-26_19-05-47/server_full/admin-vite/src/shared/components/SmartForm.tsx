import { useMemo, type FormEvent, type ReactNode } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import './SmartForm.css';

type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime-local';

type Option = {
  label: string;
  value: string | number;
};

type SmartFormField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  options?: Option[];
  allowCustomOption?: boolean;
  customOptionLabel?: string;
  customFieldPlaceholder?: string;
  colSpan?: 1 | 2;
  min?: number | string;
  max?: number | string;
  step?: number;
  disabled?: boolean;
};

type SmartFormProps<TFieldValues extends FieldValues> = {
  fields: SmartFormField[];
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  loading?: boolean;
  layoutColumns?: 1 | 2;
  secondaryAction?: ReactNode;
};

export function SmartForm<TFieldValues extends FieldValues>({
  fields,
  control,
  errors,
  onSubmit,
  submitLabel = 'Salvează',
  loading = false,
  layoutColumns = 2,
  secondaryAction,
}: SmartFormProps<TFieldValues>) {
  const showColumnsClass = useMemo(() => `smart-form smart-form--cols-${layoutColumns}`, [layoutColumns]);
  const typedErrors = errors as FieldErrors<Record<string, unknown>>;

  return (
    <form className={showColumnsClass} onSubmit={onSubmit}>
      {fields.map((field) => {
        const colSpanClass = field.colSpan === 2 ? 'smart-form__field--span2' : '';
        const errorMessage = typedErrors[field.name]?.message as string | undefined;

        return (
          <div key={field.name} className={`smart-form__field ${colSpanClass}`}>
            <label className="smart-form__label" htmlFor={field.name}>
              {field.label}
              {field.required ? <span className="smart-form__required" aria-hidden="true">*</span> : null}
            </label>

            {field.type === 'textarea' ? (
              <Controller
                name={field.name as Path<TFieldValues>}
                control={control}
                render={({ field: controllerField }) => (
                  <textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    className={`smart-form__control ${errorMessage ? 'smart-form__control--error' : ''}`}
                    disabled={field.disabled}
                    rows={4}
                    {...controllerField}
                    value={(controllerField.value as string | undefined) ?? ''}
                  />
                )}
              />
            ) : null}

            {field.type === 'text' || field.type === 'number' || field.type === 'date' || field.type === 'datetime-local' ? (
              <Controller
                name={field.name as Path<TFieldValues>}
                control={control}
                render={({ field: controllerField }) => (
                  <input
                    id={field.name}
                    type={field.type === 'number' ? 'number' : field.type}
                    placeholder={field.placeholder}
                    className={`smart-form__control ${errorMessage ? 'smart-form__control--error' : ''}`}
                    disabled={field.disabled}
                    min={field.min as number | string | undefined}
                    max={field.max as number | string | undefined}
                    step={field.step}
                    {...controllerField}
                    value={
                      controllerField.value === null || controllerField.value === undefined
                        ? ''
                        : (controllerField.value as string | number)
                    }
                    onChange={(event) => controllerField.onChange(event.target.value)}
                  />
                )}
              />
            ) : null}

            {field.type === 'select' ? (
              <Controller
                name={field.name as Path<TFieldValues>}
                control={control}
                render={({ field: controllerField }) => (
                  <>
                    <select
                      id={field.name}
                      className={`smart-form__control ${errorMessage ? 'smart-form__control--error' : ''}`}
                      disabled={field.disabled}
                      value={(controllerField.value as string | number | undefined) ?? ''}
                      onChange={(event) => controllerField.onChange(event.target.value)}
                    >
                      <option value="">Selectează</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                      {field.allowCustomOption ? (
                        <option value="__custom__">{field.customOptionLabel ?? 'Altă opțiune'}</option>
                      ) : null}
                    </select>
                    {field.allowCustomOption && controllerField.value === '__custom__' ? (
                      <Controller
                        name={`${field.name}_custom` as Path<TFieldValues>}
                        control={control}
                        render={({ field: customField }) => (
                          <input
                            className="smart-form__control smart-form__control--nested"
                            placeholder={field.customFieldPlaceholder ?? 'Introduceți valoarea personalizată'}
                            {...customField}
                            value={(customField.value as string | undefined) ?? ''}
                          />
                        )}
                      />
                    ) : null}
                  </>
                )}
              />
            ) : null}

            {field.type === 'checkbox' ? (
              <Controller
                name={field.name as Path<TFieldValues>}
                control={control}
                render={({ field: controllerField }) => (
                  <label className="smart-form__checkbox">
                    <input
                      type="checkbox"
                      disabled={field.disabled}
                      checked={Boolean(controllerField.value)}
                      onChange={(event) => controllerField.onChange(event.target.checked)}
                    />
                    <span>{field.placeholder ?? 'Activ'}</span>
                  </label>
                )}
              />
            ) : null}

            {field.helperText ? <span className="smart-form__helper">{field.helperText}</span> : null}
            {errorMessage ? <span className="smart-form__error">{errorMessage}</span> : null}
          </div>
        );
      })}

      <div className="smart-form__actions">
        {secondaryAction}
        <button type="submit" className="smart-form__submit" disabled={loading}>
          {loading ? 'Se salvează…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export type { SmartFormField };
