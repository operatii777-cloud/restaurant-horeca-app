// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { SideDrawer } from '@/shared/components/SideDrawer';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import type { Ingredient } from '@/types/ingredients';
import './IngredientDetailsDrawer.css';

type IngredientDocument = {
  id: number;
  document_type?: string | null;
  file_path?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

type IngredientSupplierLink = {
  id: number;
  supplier_id: number;
  name: string;
  is_primary?: number | boolean;
  supplier_code?: string | null;
  lead_time_days?: number | null;
  delivery_terms?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: number | boolean;
};

type IngredientTraceRow = {
  order_id: number;
  batch_id: number;
  quantity_used: number;
  created_at?: string;
  order_timestamp?: string;
  order_status?: string;
  is_paid?: number | boolean;
  batch_number?: string | null;
  purchase_date?: string | null;
  expiry_date?: string | null;
  supplier?: string | null;
};

type ActiveTab = 'overview' | 'documents' | 'suppliers' | 'traceability';

interface IngredientDetailsDrawerProps {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
  onVisibilityChanged: (action: 'hide' | 'restore') => Promise<void>;
  initialTab?: ActiveTab;
}

const DOCUMENT_TYPES = [
  { label: 'Certificat veterinar', value: 'vet_certificate' },
  { label: 'Analize laborator', value: 'lab_report' },
  { label: 'Registru temperatură', value: 'temperature_log' },
  { label: 'Notificare recall', value: 'recall_notice' },
  { label: 'Alt document', value: 'other' },
];

export function IngredientDetailsDrawer({
  ingredient,
  open,
  onClose,
  onVisibilityChanged,
  initialTab = 'overview',
}: IngredientDetailsDrawerProps) {
//   const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [documents, setDocuments] = useState<IngredientDocument[]>([]);
  const [suppliers, setSuppliers] = useState<IngredientSupplierLink[]>([]);
  const [traceRows, setTraceRows] = useState<IngredientTraceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentForm, setDocumentForm] = useState({
    document_type: 'vet_certificate',
    file_path: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
  });
  const [documentSubmitting, setDocumentSubmitting] = useState(false);

  const ingredientId = ingredient?.id ?? null;

  useEffect(() => {
    if (!open || !ingredientId) return;

    setLoading(true);
    setError(null);

    const fetchDocuments = httpClient
      .get(`/api/ingredients/${ingredientId}/documents`)
      .then((response) => (Array.isArray(response.data?.data) ? response.data.data : []))
      .catch((apiError) => {
        console.error('❌ Eroare la încărcarea documentelor ingredient:', apiError);
        throw new Error(apiError?.response?.data?.error ?? 'Nu s-au putut încărca documentele.');
      });

    const fetchSuppliers = httpClient
      .get(`/api/ingredients/${ingredientId}/suppliers`)
      .then((response) => (Array.isArray(response.data?.data) ? response.data.data : []))
      .catch((apiError) => {
        console.error('❌ Eroare la încărcarea furnizorilor ingredientului:', apiError);
        throw new Error(apiError?.response?.data?.error ?? 'Nu s-au putut încărca furnizorii.');
      });

    const fetchTrace = httpClient
      .get(`/api/ingredients/${ingredientId}/traceability`)
      .then((response) => (Array.isArray(response.data?.data) ? response.data.data : []))
      .catch((apiError) => {
        console.error('❌ Eroare la încărcarea trasabilității ingredientului:', apiError);
        throw new Error(apiError?.response?.data?.error ?? 'Nu s-a putut încărca trasabilitatea.');
      });

    Promise.allSettled([fetchDocuments, fetchSuppliers, fetchTrace])
      .then((results) => {
        const [docsResult, suppliersResult, traceResult] = results;
        if (docsResult.status === 'fulfilled') {
          setDocuments(docsResult.value);
        }
        if (suppliersResult.status === 'fulfilled') {
          setSuppliers(suppliersResult.value);
        }
        if (traceResult.status === 'fulfilled') {
          setTraceRows(traceResult.value);
        }

        const firstRejected = results.find((result) => result.status === 'rejected');
        if (firstRejected && firstRejected.status === 'rejected') {
          setError(firstRejected.reason?.message ?? 'Nu s-au putut încărca toate datele.');
        }
      })
      .finally(() => setLoading(false));
  }, [open, ingredientId]);

  useEffect(() => {
    if (!open) {
      setActiveTab(initialTab);
      setError(null);
      setDocumentSubmitting(false);
    } else {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const handleDeleteDocument = useCallback(
    async (documentId: number) => {
      try {
        await httpClient.delete(`/api/ingredients/documents/${documentId}`);
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      } catch (apiError: any) {
        console.error('❌ Eroare la ștergerea documentului ingredient:', apiError);
        setError(apiError?.response?.data?.error ?? 'Nu s-a putut șterge documentul.');
      }
    },
    [],
  );

  const handleDocumentFormChange = useCallback(
    (field: keyof typeof documentForm, value: string) => {
      setDocumentForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmitDocument = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ingredientId) return;

      if (!documentForm.file_path.trim()) {
        setError('Completează calea fișierului sau referința documentului.');
        return;
      }

      setDocumentSubmitting(true);
      setError(null);
      try {
        const payload = {
          document_type: documentForm.document_type,
          file_path: documentForm.file_path.trim(),
          issue_date: documentForm.issue_date || null,
          expiry_date: documentForm.expiry_date || null,
          notes: documentForm.notes?.trim() || null,
        };
        const response = await httpClient.post(`/api/ingredients/${ingredientId}/documents`, payload);
        const newId = response.data?.document_id;
        setDocuments((prev) => [
          {
            id: newId ?? Math.random(),
            ...payload,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setDocumentForm({
          document_type: 'vet_certificate',
          file_path: '',
          issue_date: '',
          expiry_date: '',
          notes: '',
        });
      } catch (apiError: any) {
        console.error('❌ Eroare la adăugarea documentului ingredient:', apiError);
        setError(apiError?.response?.data?.error ?? 'Nu s-a putut adăuga documentul.');
      } finally {
        setDocumentSubmitting(false);
      }
    },
    [documentForm, ingredientId],
  );

  const formattedTraceRows = useMemo(() => {
//   const { t } = useTranslation();
    return traceRows.map((row) => ({
      ...row,
      orderTimestamp: row.order_timestamp ? new Date(row.order_timestamp).toLocaleString('ro-RO') : '-',
      batchExpiry: row.expiry_date ? new Date(row.expiry_date).toLocaleDateString('ro-RO') : '-',
      batchPurchase: row.purchase_date ? new Date(row.purchase_date).toLocaleDateString('ro-RO') : '-',
      createdAt: row.created_at ? new Date(row.created_at).toLocaleString('ro-RO') : '-',
      isPaidLabel: row.is_paid ? 'Da' : 'Nu',
    }));
  }, [traceRows]);

  const handleVisibilityAction = useCallback(
    async (action: 'hide' | 'restore') => {
      if (!ingredientId) return;
      try {
        await onVisibilityChanged(action);
      } catch (apiError: any) {
        console.error(`❌ Eroare la ${action === 'hide' ? 'ascunderea' : 'restaurarea'} ingredientului din drawer`, apiError);
        setError(apiError?.response?.data?.error ?? 'Operațiunea de vizibilitate a eșuat.');
      }
    },
    [ingredientId, onVisibilityChanged],
  );

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      width={560}
      title={ingredient ? `Detalii ingredient · ${ingredient.name}` : 'Detalii ingredient'}
      description={
        ingredient
          ? `Unitate: ${ingredient.unit ?? '-'} · Categorie: ${ingredient.category ?? 'n/a'}`
          : undefined
      }
    >
      <div className="ingredient-details">
        <div className="ingredient-details__tabs" role="tablist">
          <button
            type="button"
            className={activeTab === 'overview' ? 'is-active' : ''}
            onClick={() => setActiveTab('overview')}
            role="tab"
          >
            Overview
          </button>
          <button
            type="button"
            className={activeTab === 'documents' ? 'is-active' : ''}
            onClick={() => setActiveTab('documents')}
            role="tab"
          >"documente haccp"</button>
          <button
            type="button"
            className={activeTab === 'suppliers' ? 'is-active' : ''}
            onClick={() => setActiveTab('suppliers')}
            role="tab"
          >
            Furnizori
          </button>
          <button
            type="button"
            className={activeTab === 'traceability' ? 'is-active' : ''}
            onClick={() => setActiveTab('traceability')}
            role="tab"
          >
            Trasabilitate
          </button>
        </div>

        {error ? (
          <InlineAlert variant="warning" title="Atenție" message={error} />
        ) : null}

        {loading ? <p className="ingredient-details__loading">"se incarca detaliile"</p> : null}

        {ingredient && activeTab === 'overview' ? (
          <section className="ingredient-details__section">
            <h3>"informatii generale"</h3>
            <ul className="ingredient-details__list">
              <li>
                <span>"nume oficial"</span>
                <strong>{ingredient.official_name || '—'}</strong>
              </li>
              <li>
                <span>"denumire en"</span>
                <strong>{ingredient.name_en || '—'}</strong>
              </li>
              <li>
                <span>"tara origine"</span>
                <strong>{ingredient.origin_country || '—'}</strong>
              </li>
              <li>
                <span>"stoc curent"</span>
                <strong>
                  {ingredient.current_stock !== undefined ? `${ingredient.current_stock} ${ingredient.unit ?? ''}` : '—'}
                </strong>
              </li>
              <li>
                <span>Stoc minim</span>
                <strong>{ingredient.min_stock !== undefined ? ingredient.min_stock : '—'}</strong>
              </li>
              <li>
                <span>Cost / unitate</span>
                <strong>
                  {ingredient.cost_per_unit !== undefined ? `${Number(ingredient.cost_per_unit).toFixed(2)} RON` : '—'}
                </strong>
              </li>
              <li>
                <span>"temperatura depozitare"</span>
                <strong>
                  {ingredient.storage_temp_min !== null && ingredient.storage_temp_min !== undefined
                    ? `${ingredient.storage_temp_min}°C`
                    : '—'}' '
                  /' '
                  {ingredient.storage_temp_max !== null && ingredient.storage_temp_max !== undefined
                    ? `${ingredient.storage_temp_max}°C`
                    : '—'}
                </strong>
              </li>
              <li>
                <span>Cod trasabilitate</span>
                <strong>{ingredient.traceability_code || '—'}</strong>
              </li>
              <li>
                <span>Note HACCP</span>
                <strong>{ingredient.haccp_notes || 'Nu au fost adăugate note HACCP.'}</strong>
              </li>
              <li>
                <span>"allergeni declarati"</span>
                <strong>{ingredient.allergens || '—'}</strong>
              </li>
              <li>
                <span>Pot. alergeni</span>
                <strong>{ingredient.potential_allergens || '—'}</strong>
              </li>
              <li>
                <span>Aditivi</span>
                <strong>{ingredient.additives || '—'}</strong>
              </li>
              <li>
                <span>Ultima actualizare</span>
                <strong>
                  {ingredient.last_updated ? new Date(ingredient.last_updated).toLocaleString('ro-RO') : '—'}
                </strong>
              </li>
            </ul>

            <div className="ingredient-details__actions">
              <button
                type="button"
                className="ingredient-details__action"
                onClick={() => handleVisibilityAction('hide')}
                disabled={ingredient.is_hidden === 1 || ingredient.is_hidden === true}
              >
                👻 Marchează neinventariabil
              </button>
              <button
                type="button"
                className="ingredient-details__action"
                onClick={() => handleVisibilityAction('restore')}
                disabled={!(ingredient.is_hidden === 1 || ingredient.is_hidden === true)}
              >
                ✅ Restaurează ingredientul
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === 'documents' ? (
          <section className="ingredient-details__section">
            <h3>"documente haccp"</h3>
            <form className="ingredient-document-form" onSubmit={handleSubmitDocument}>
              <label>
                <span>"tip document"</span>
                <select
                  value={documentForm.document_type}
                  onChange={(event) => handleDocumentFormChange('document_type', event.target.value)}
                >
                  {DOCUMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Fișier / referință</span>
                <input
                  type="text"
                  value={documentForm.file_path}
                  placeholder="Ex: /docs/haccp/lot-123.pdf"
                  onChange={(event) => handleDocumentFormChange('file_path', event.target.value)}
                />
              </label>
              <div className="ingredient-document-form__grid">
                <label>
                  <span>"emis la"</span>
                  <input
                    type="date"
                    value={documentForm.issue_date}
                    onChange={(event) => handleDocumentFormChange('issue_date', event.target.value)}
                  />
                </label>
                <label>
                  <span>"expira la"</span>
                  <input
                    type="date"
                    value={documentForm.expiry_date}
                    onChange={(event) => handleDocumentFormChange('expiry_date', event.target.value)}
                  />
                </label>
              </div>
              <label>
                <span>Note</span>
                <textarea
                  value={documentForm.notes}
                  rows={2}
                  onChange={(event) => handleDocumentFormChange('notes', event.target.value)}
                  placeholder='[ex_verificat_temperatura_la_receptie_4°c]'
                />
              </label>
              <button type="submit" className="ingredient-details__action" disabled={documentSubmitting}>
                {documentSubmitting ? 'Se adaugă…' : 'Adaugă document'}
              </button>
            </form>

            <table className="ingredient-details__table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Fișier / link</th>
                  <th>Emis</th>
                  <th>Expiră</th>
                  <th>Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="ingredient-details__empty">"nu exista documente atasate"</td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.document_type ?? '—'}</td>
                      <td className="ingredient-details__mono">{doc.file_path ?? '—'}</td>
                      <td>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('ro-RO') : '—'}</td>
                      <td>{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('ro-RO') : '—'}</td>
                      <td>{doc.notes ?? '—'}</td>
                      <td className="ingredient-details__actions-cell">
                        <button
                          type="button"
                          className="ingredient-details__action ingredient-details__action--destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >"Șterge"</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === 'suppliers' ? (
          <section className="ingredient-details__section">
            <h3>"furnizori asociati"</h3>
            <table className="ingredient-details__table">
              <thead>
                <tr>
                  <th>Furnizor</th>
                  <th>Principal</th>
                  <th>Cod intern</th>
                  <th>Lead time</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="ingredient-details__empty">"nu sunt furnizori asociati acestui ingredient"</td>
                  </tr>
                ) : (
                  suppliers.map((link) => (
                    <tr key={link.id}>
                      <td>{link.name}</td>
                      <td>{link.is_primary ? 'Da' : 'Nu'}</td>
                      <td>{link.supplier_code ?? '—'}</td>
                      <td>{link.lead_time_days ? `${link.lead_time_days} zile` : '—'}</td>
                      <td>
                        <div className="ingredient-details__contact">
                          <span>{link.phone ?? '—'}</span>
                          <span>{link.email ?? '—'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === 'traceability' ? (
          <section className="ingredient-details__section">
            <h3>"trasabilitate loturi si comenzi"</h3>
            <table className="ingredient-details__table">
              <thead>
                <tr>
                  <th>"id comanda"</th>
                  <th>Lot</th>
                  <th>Cantitate</th>
                  <th>"data comanda"</th>
                  <th>Statut</th>
                  <th>"Plătită"</th>
                  <th>Furnizor lot</th>
                  <th>Expiră</th>
                </tr>
              </thead>
              <tbody>
                {formattedTraceRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ingredient-details__empty">"nu exista trasabilitate disponibila pentru acest i"</td>
                  </tr>
                ) : (
                  formattedTraceRows.map((row) => (
                    <tr key={`${row.order_id}-${row.batch_id}-${row.created_at}`}>
                      <td>#{row.order_id}</td>
                      <td>{row.batch_number ?? `Lot ${row.batch_id}`}</td>
                      <td>{`${row.quantity_used} ${ingredient?.unit ?? ''}`}</td>
                      <td>{row.orderTimestamp}</td>
                      <td>{row.order_status ?? '—'}</td>
                      <td>{row.isPaidLabel}</td>
                      <td>{row.supplier ?? '—'}</td>
                      <td>{row.batchExpiry}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </SideDrawer>
  );
}





