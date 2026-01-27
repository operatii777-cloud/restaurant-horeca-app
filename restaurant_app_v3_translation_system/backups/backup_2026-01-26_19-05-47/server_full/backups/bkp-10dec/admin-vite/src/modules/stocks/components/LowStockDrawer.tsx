import { SideDrawer } from '@/shared/components/SideDrawer';
import type { LowStockAlert } from '@/types/stocks';
import './LowStockDrawer.css';

interface LowStockDrawerProps {
  open: boolean;
  alerts: LowStockAlert[];
  onClose: () => void;
}

export const LowStockDrawer = ({ open, alerts, onClose }: LowStockDrawerProps) => {
  return (
    <SideDrawer open={open} title="Stocuri critice" width={640} onClose={onClose}>
      <div className="low-stock-drawer">
        {alerts.length === 0 ? (
          <div className="low-stock-drawer__empty">Nu există ingrediente cu stoc scăzut în acest moment.</div>
        ) : (
          <table className="low-stock-drawer__table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Categorie</th>
                <th>Stoc curent</th>
                <th>Stoc minim</th>
                <th>Nivel alertă</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const id = alert.ingredient_id ?? alert.product_id ?? alert.name;
                const alertLabel = alert.alert_level === 'critical' ? 'Critic' : alert.alert_level === 'out' ? 'Epuizat' : 'Scăzut';
                return (
                  <tr key={id}>
                    <td>
                      <strong>{alert.name}</strong>
                    </td>
                    <td>{alert.category || '—'}</td>
                    <td>{alert.current_stock} {alert.unit || ''}</td>
                    <td>{alert.min_stock}</td>
                    <td>
                      <span className={`low-stock-drawer__badge low-stock-drawer__badge--${alert.alert_level || 'low'}`}>
                        {alertLabel}
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
