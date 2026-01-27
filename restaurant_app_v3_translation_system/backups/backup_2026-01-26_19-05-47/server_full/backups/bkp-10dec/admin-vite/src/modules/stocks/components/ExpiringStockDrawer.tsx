import { SideDrawer } from '@/shared/components/SideDrawer';
import './ExpiringStockDrawer.css';

interface ExpiringItem {
  ingredient_id?: number;
  ingredient_name?: string;
  name?: string;
  batch_number?: string;
  expiry_date?: string;
  days_until_expiry?: number;
  quantity?: number;
  unit?: string;
  status?: 'expired' | 'expiring_soon' | 'warning';
}

interface ExpiringStockDrawerProps {
  open: boolean;
  items: ExpiringItem[];
  onClose: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ro-RO');
  } catch {
    return dateStr;
  }
};

const getStatusLabel = (item: ExpiringItem) => {
  if (item.status === 'expired') return 'Expirat';
  if (item.status === 'expiring_soon') return 'Expiră curând';
  if (item.days_until_expiry !== undefined) {
    if (item.days_until_expiry < 0) return 'Expirat';
    if (item.days_until_expiry <= 7) return 'Expiră în 7 zile';
    if (item.days_until_expiry <= 30) return 'Expiră în 30 zile';
  }
  return 'Expiră curând';
};

const getStatusClass = (item: ExpiringItem) => {
  if (item.status === 'expired' || (item.days_until_expiry !== undefined && item.days_until_expiry < 0)) {
    return 'expiring-stock-drawer__badge--expired';
  }
  if (item.status === 'expiring_soon' || (item.days_until_expiry !== undefined && item.days_until_expiry <= 7)) {
    return 'expiring-stock-drawer__badge--critical';
  }
  return 'expiring-stock-drawer__badge--warning';
};

export const ExpiringStockDrawer = ({ open, items, onClose }: ExpiringStockDrawerProps) => {
  return (
    <SideDrawer open={open} title="Ingrediente care expiră" width={720} onClose={onClose}>
      <div className="expiring-stock-drawer">
        {items.length === 0 ? (
          <div className="expiring-stock-drawer__empty">Nu există ingrediente care expiră în următoarele 30 de zile.</div>
        ) : (
          <table className="expiring-stock-drawer__table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Lot</th>
                <th>Data expirării</th>
                <th>Zile rămase</th>
                <th>Cantitate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const id = item.ingredient_id ?? index;
                const name = item.ingredient_name ?? item.name ?? '—';
                const daysLeft = item.days_until_expiry ?? null;
                return (
                  <tr key={id}>
                    <td>
                      <strong>{name}</strong>
                    </td>
                    <td>{item.batch_number || '—'}</td>
                    <td>{formatDate(item.expiry_date)}</td>
                    <td>
                      {daysLeft !== null ? (
                        daysLeft < 0 ? (
                          <span className="expiring-stock-drawer__days--expired">Expirat</span>
                        ) : (
                          <span>{daysLeft} zile</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {item.quantity !== undefined ? `${item.quantity} ${item.unit || ''}`.trim() : '—'}
                    </td>
                    <td>
                      <span className={`expiring-stock-drawer__badge ${getStatusClass(item)}`}>
                        {getStatusLabel(item)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </SideDrawer>
  );
};

