// import { useTranslation } from '@/i18n/I18nContext';
import type { ChangeEvent } from 'react';
import './TableFilter.css';

export interface TableFilterProps {
  value: string;
  placeholder?: string;
  onChange: (nextValue: string) => void;
  icon?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const TableFilter = ({
  value,
  placeholder = 'Caută…',
  onChange,
  icon = '🔍',
  disabled = false,
  ...rest
}: TableFilterProps) => {
//   const { t } = useTranslation();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
//   const { t } = useTranslation();
    onChange(event.target.value);
  };

  return (
    <div className="table-filter">
      <span className="table-filter__icon" aria-hidden="true">
        {icon}
      </span>
      <input
        className="table-filter__input"
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          className="table-filter__clear"
          onClick={() => onChange('')}
          aria-label="sterge filtrul"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
};



