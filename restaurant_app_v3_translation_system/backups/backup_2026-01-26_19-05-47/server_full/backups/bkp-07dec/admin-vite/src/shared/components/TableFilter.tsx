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
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
          aria-label="Șterge filtrul"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
};

