import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';

/**
 * Menu PDF Builder — temporary build-safe shell.
 * Full page source was corrupted (duplicate object keys / broken returns);
 * restore full UI in a follow-up once source is recovered.
 */
export const MenuPDFBuilderPage = () => {
  const [activeType, setActiveType] = useState<'food' | 'drinks'>('food');

  return (
    <div className="padding-20">
      <PageHeader title="Menu PDF Builder" description="Configurare meniu PDF" />
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn ${activeType === 'food' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveType('food')}
        >
          Food
        </button>
        <button
          className={`btn ${activeType === 'drinks' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveType('drinks')}
        >
          Drinks
        </button>
      </div>
      <div className="alert alert-warning">
        UI completă temporar indisponibilă (fișier sursă corupt în repo). Endpoint-urile PDF rămân pe backend.
        Tip activ: <strong>{activeType}</strong>
      </div>
    </div>
  );
};

export default MenuPDFBuilderPage;
