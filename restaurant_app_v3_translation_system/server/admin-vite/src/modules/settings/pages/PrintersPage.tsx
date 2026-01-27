// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './PrintersPage.css';

interface Printer {
  id?: number;
  name: string;
  type: string; // 'kitchen', 'bar', 'receipt', "Label", 'fiscal'
  location_id?: number;
  ip_address?: string;
  port: number;
  connection_type: string; // 'network', 'usb', 'serial'
  is_active: boolean;
  auto_print: boolean;
  print_categories?: string; // JSON array
  paper_width: number;
  test_print_count: number;
  last_test_print?: string;
}

const PRINTER_TYPES = [
  { value: 'kitchen', label: 'Bucătărie' },
  { value: 'bar', label: 'Bar' },
  { value: 'receipt', label: 'Bon' },
  { value: "Label", label: 'Etichetă' },
  { value: 'fiscal', label: 'Fiscal' },
];

export const PrintersPage: React.FC = () => {
//   const { t } = useTranslation();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, refetch } = useApiQuery<Printer[]>('/api/settings/printers');
  const createMutation = useApiMutation();
  const updateMutation = useApiMutation();
  const deleteMutation = useApiMutation();
  const testMutation = useApiMutation();

  useEffect(() => {
    if (data) {
      setPrinters(data);
      setLoading(false);
    }
  }, [data]);

  const handleSave = async (printer: Printer) => {
    try {
      if (editingPrinter?.id) {
        await updateMutation.mutate({
          url: `/api/settings/printers/${editingPrinter.id}`,
          method: 'PUT',
          data: printer
        });
        setAlert({ type: 'success', message: 'Imprimantă actualizată cu succes!' });
      } else {
        await createMutation.mutate({
          url: '/api/settings/printers',
          method: 'POST',
          data: printer
        });
        setAlert({ type: 'success', message: 'Imprimantă adăugată cu succes!' });
      }
      setShowModal(false);
      setEditingPrinter(null);
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur doriți să ștergeți această imprimantă?')) return;
    
    try {
      await deleteMutation.mutate({
        url: `/api/settings/printers/"Id"`,
        method: 'DELETE'
      });
      setAlert({ type: 'success', message: 'Imprimantă ștearsă cu succes!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la ștergere' });
    }
  };

  const handleTestPrint = async (id: number) => {
    try {
      await testMutation.mutate({
        url: `/api/settings/printers/"Id"/test`,
        method: 'POST'
      });
      setAlert({ type: 'success', message: 'Test print trimis!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la test print' });
    }
  };

  if (loading) {
    return <div className="printers-page">Se încarcă...</div>;
  }

  return (
    <div className="printers-page">
      <PageHeader
        title='imprimante & periferice'
        description="Gestionare imprimante pentru bucătărie, bar, bon și etichetă"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="printers-page__actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingPrinter(null);
            setShowModal(true);
          }}
        >
          ➕ Adaugă Imprimantă
        </button>
      </div>

      <div className="printers-page__table">
        <table className="table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Tip</th>
              <th>IP/Port</th>
              <th>Conectare</th>
              <th>Status</th>
              <th>Test Print</th>
              <th>"Acțiuni"</th>
            </tr>
          </thead>
          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">"nu exista imprimante configurate"</td>
              </tr>
            ) : (
              printers.map((printer) => (
                <tr key={printer.id}>
                  <td><strong>{printer.name}</strong></td>
                  <td>
                    <span className="badge badge-info">
                      {PRINTER_TYPES.find(t => t.value === printer.type)?.label || printer.type}
                    </span>
                  </td>
                  <td>
                    {printer.ip_address ? (
                      <code>{printer.ip_address}:{printer.port}</code>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>{printer.connection_type}</td>
                  <td>
                    <span className={`badge ${printer.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {printer.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>
                    {printer.test_print_count > 0 && (
                      <span className="text-muted">
                        {printer.test_print_count} teste
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => printer.id && handleTestPrint(printer.id)}
                    >
                      🖨️ Test
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setEditingPrinter(printer);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => printer.id && handleDelete(printer.id)}
                    >
                      🗑️ Șterge
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PrinterModal
          printer={editingPrinter}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPrinter(null);
          }}
        />
      )}
    </div>
  );
};

interface PrinterModalProps {
  printer: Printer | null;
  onSave: (printer: Printer) => void;
  onClose: () => void;
}

const PrinterModal: React.FC<PrinterModalProps> = ({ printer, onSave, onClose }) => {
  const [formData, setFormData] = useState<Printer>({
    name: printer?.name || '',
    type: printer?.type || 'kitchen',
    ip_address: printer?.ip_address || '',
    port: printer?.port || 9100,
    connection_type: printer?.connection_type || 'network',
    is_active: printer?.is_active ?? true,
    auto_print: printer?.auto_print ?? true,
    paper_width: printer?.paper_width || 80,
    test_print_count: printer?.test_print_count || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{printer ? 'Editare Imprimantă' : 'Adaugă Imprimantă'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Tip *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {PRINTER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tip Conectare *</label>
            <select
              value={formData.connection_type}
              onChange={(e) => setFormData({ ...formData, connection_type: e.target.value })}
              required
            >
              <option value="network">Network (IP)</option>
              <option value="usb">USB</option>
              <option value="serial">Serial (COM)</option>
            </select>
          </div>
          {formData.connection_type === 'network' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>IP Address *</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    required
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="form-group">
                  <label>Port *</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 9100 })}
                    required
                  />
                </div>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Lățime Hârtie (mm)</label>
            <input
              type="number"
              value={formData.paper_width}
              onChange={(e) => setFormData({ ...formData, paper_width: parseInt(e.target.value) || 80 })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.auto_print}
                onChange={(e) => setFormData({ ...formData, auto_print: e.target.checked })}
              />"print automat la comanda"</label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />"Activă"</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>"Anulează"</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




