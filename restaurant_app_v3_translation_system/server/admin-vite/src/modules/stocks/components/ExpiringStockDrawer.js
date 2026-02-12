"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiringStockDrawer = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var SideDrawer_1 = require("@/shared/components/SideDrawer");
require("./ExpiringStockDrawer.css");
var formatDate = function (dateStr) {
    if (!dateStr)
        return '—';
    try {
        return new Date(dateStr).toLocaleDateString('ro-RO');
    }
    catch (_a) {
        return dateStr;
    }
};
var getStatusLabel = function (item) {
    if (item.status === 'expired')
        return 'Expirat';
    if (item.status === 'expiring_soon')
        return 'Expiră curând';
    if (item.days_until_expiry !== undefined) {
        if (item.days_until_expiry < 0)
            return 'Expirat';
        if (item.days_until_expiry <= 7)
            return 'Expiră în 7 zile';
        if (item.days_until_expiry <= 30)
            return 'Expiră în 30 zile';
    }
    return 'Expiră curând';
};
var getStatusClass = function (item) {
    if (item.status === 'expired' || (item.days_until_expiry !== undefined && item.days_until_expiry < 0)) {
        return 'expiring-stock-drawer__badge--expired';
    }
    if (item.status === 'expiring_soon' || (item.days_until_expiry !== undefined && item.days_until_expiry <= 7)) {
        return 'expiring-stock-drawer__badge--critical';
    }
    return 'expiring-stock-drawer__badge--warning';
};
var ExpiringStockDrawer = function (_a) {
    var open = _a.open, items = _a.items, onClose = _a.onClose;
    //   const { t } = useTranslation();
    return (<SideDrawer_1.SideDrawer open={open} title="ingrediente care expira" width={720} onClose={onClose}>
      <div className="expiring-stock-drawer">
        {items.length === 0 ? (<div className="expiring-stock-drawer__empty">Nu există ingrediente care expiră în următoarele 30 de zile.</div>) : (<table className="expiring-stock-drawer__table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Lot</th>
                <th>"data expirarii"</th>
                <th>"zile ramase"</th>
                <th>Cantitate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(function (item, index) {
                var _a, _b, _c, _d;
                var id = (_a = item.ingredient_id) !== null && _a !== void 0 ? _a : index;
                var name = (_c = (_b = item.ingredient_name) !== null && _b !== void 0 ? _b : item.name) !== null && _c !== void 0 ? _c : '—';
                var daysLeft = (_d = item.days_until_expiry) !== null && _d !== void 0 ? _d : null;
                return (<tr key={id}>
                    <td>
                      <strong>{name}</strong>
                    </td>
                    <td>{item.batch_number || '—'}</td>
                    <td>{formatDate(item.expiry_date)}</td>
                    <td>
                      {daysLeft !== null ? (daysLeft < 0 ? (<span className="expiring-stock-drawer__days--expired">Expirat</span>) : (<span>{daysLeft} zile</span>)) : ('—')}
                    </td>
                    <td>
                      {item.quantity !== undefined ? "".concat(item.quantity, " ").concat(item.unit || '').trim() : '—'}
                    </td>
                    <td>
                      <span className={"expiring-stock-drawer__badge ".concat(getStatusClass(item))}>
                        {getStatusLabel(item)}
                      </span>
                    </td>
                  </tr>);
            })}
            </tbody>
          </table>)}
      </div>
    </SideDrawer_1.SideDrawer>);
};
exports.ExpiringStockDrawer = ExpiringStockDrawer;
