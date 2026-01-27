// import { useTranslation } from '@/i18n/I18nContext';
import './PlaceholderCard.css';

type PlaceholderCardProps = {
  title: string;
  description: string;
};

export const PlaceholderCard = ({ title, description }: PlaceholderCardProps) => {
//   const { t } = useTranslation();
  return (
    <div className="placeholder-card">
      <div className="placeholder-card__tag">"in lucru"</div>
      <h3 className="placeholder-card__title">{title}</h3>
      <p className="placeholder-card__description">{description}</p>
      <ul className="placeholder-card__checklist">
        <li>📡 Conectare AG Grid la API</li>
        <li>🧮 Configurare coloane dinamice + export Excel</li>
        <li>⚡ Performanță optimizată pentru dataset-uri mari</li>
      </ul>
    </div>
  );
};



