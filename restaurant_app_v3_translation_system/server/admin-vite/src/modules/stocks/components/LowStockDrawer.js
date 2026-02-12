"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowStockDrawer = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var SideDrawer_1 = require("@/shared/components/SideDrawer");
require("./LowStockDrawer.css");
var LowStockDrawer = function (_a) {
    var open = _a.open, alerts = _a.alerts, onClose = _a.onClose;
    //   const { t } = useTranslation();
    return (<SideDrawer_1.SideDrawer open={open} title="stocuri critice" width={640} onClose={onClose}>
      <div className="low-stock-drawer">
        {alerts.length === 0 ? (<div className="low-stock-drawer__empty">"nu exista ingrediente cu stoc scazut in acest mome"</div>) : (<table className="low-stock-drawer__table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Categorie</th>
                <th>"stoc curent"</th>
                <th>Stoc minim</th>
                <th>"nivel alerta"</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(function (alert) {
                var _a, _b;
                var id = (_b = (_a = alert.ingredient_id) !== null && _a !== void 0 ? _a : alert.product_id) !== null && _b !== void 0 ? _b : alert.name;
                var alertLabel = alert.alert_level === 'critical' ? 'Critic' : alert.alert_level === 'out' ? 'Epuizat' : 'Scăzut';
                return (<tr key={id}>
                    <td>
                      <strong>{alert.name}</strong>
                    </td>
                    <td>{alert.category || '—'}</td>
                    <td>{alert.current_stock} {alert.unit || ''}</td>
                    <td>{alert.min_stock}</td>
                    <td>
                      <span className={"low-stock-drawer__badge low-stock-drawer__badge--".concat(alert.alert_level || 'low')}>
                        {alertLabel}
                      </span>
                    </td>
                  </tr>);
            })}
            </tbody>
          </table>)}
      </div>
    </SideDrawer_1.SideDrawer>);
};
exports.LowStockDrawer = LowStockDrawer;
