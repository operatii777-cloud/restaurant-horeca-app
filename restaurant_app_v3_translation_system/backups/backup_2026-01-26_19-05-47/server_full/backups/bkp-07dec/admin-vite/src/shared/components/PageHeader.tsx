import './PageHeader.css';

type HeaderAction = {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: HeaderAction[];
};

export const PageHeader = ({ title, description, actions = [] }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-header__title">{title}</h2>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      {actions.length ? (
        <div className="page-header__actions">
          {actions.map(({ label, variant = 'secondary', onClick }) => (
            <button
              key={label}
              type="button"
              className={`page-header__button page-header__button--${variant}`}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
