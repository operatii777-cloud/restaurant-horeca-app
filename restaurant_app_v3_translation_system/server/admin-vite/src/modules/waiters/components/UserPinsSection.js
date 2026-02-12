"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPinsSection = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var DataGrid_1 = require("@/shared/components/DataGrid");
var TableFilter_1 = require("@/shared/components/TableFilter");
var useDebouncedValue_1 = require("@/shared/hooks/useDebouncedValue");
require("./UserPinsSection.css");
var UserPinsSection = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(''), filter = _a[0], setFilter = _a[1];
    var debouncedFilter = (0, useDebouncedValue_1.useDebouncedValue)(filter, 250);
    var _b = (0, useApiQuery_1.useApiQuery)('/api/admin/user-pins'), data = _b.data, loading = _b.loading, error = _b.error;
    var pins = (0, react_1.useMemo)(function () {
        if (!data || !data.pins)
            return [];
        return data.pins;
    }, []);
    var filteredPins = (0, react_1.useMemo)(function () {
        if (!debouncedFilter)
            return pins;
        var lowerFilter = debouncedFilter.toLowerCase();
        return pins.filter(function (p) {
            var _a, _b, _c, _d;
            return ((_a = p.username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(lowerFilter)) ||
                ((_b = p.pin) === null || _b === void 0 ? void 0 : _b.includes(debouncedFilter)) ||
                ((_c = p.role) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(lowerFilter)) ||
                ((_d = p.email) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(lowerFilter));
        });
    }, [pins, debouncedFilter]);
    var columnDefs = [
        {
            headerName: 'Utilizator',
            field: 'username',
            pinned: 'left',
            minWidth: 180,
            cellRenderer: function (params) {
                var pin = params.data;
                if (!pin)
                    return params.value;
                return (<div className="user-pin__user">
            <span className="user-pin__username">{pin.username}</span>
            {pin.is_default && (<span className="user-pin__badge" title="PIN default sistem">Default</span>)}
            {pin.type === 'legacy' && (<span className="user-pin__badge user-pin__badge--legacy" title="PIN legacy">
                Legacy
              </span>)}
          </div>);
            },
        },
        {
            headerName: 'PIN',
            field: 'pin',
            width: 120,
            cellRenderer: function (params) {
                var pin = params.value;
                if (!pin)
                    return '—';
                return <span className="user-pin__pin-value">{pin}</span>;
            },
        },
        {
            headerName: 'Rol',
            field: 'role',
            width: 120,
            cellRenderer: function (params) {
                var role = params.value;
                var roleLabels = {
                    admin: 'Administrator',
                    manager: 'Manager',
                    waiter: 'Ospătar',
                    chef: 'Bucătar',
                    supervisor: 'Supervisor',
                };
                return <span>{roleLabels[role] || role}</span>;
            },
        },
        {
            headerName: 'Email',
            field: "Email:",
            minWidth: 200,
            valueFormatter: function (params) { return params.value || '—'; },
        },
        {
            headerName: 'Tip',
            field: 'type',
            width: 100,
            cellRenderer: function (params) {
                var type = params.value;
                var typeLabels = {
                    user: 'Utilizator',
                    waiter: 'Ospătar',
                    legacy: 'Legacy',
                };
                return <span>{typeLabels[type] || type}</span>;
            },
        },
        {
            headerName: 'Status',
            field: 'is_active',
            width: 100,
            cellRenderer: function (params) {
                var _a;
                var isActive = (_a = params.data) === null || _a === void 0 ? void 0 : _a.is_active;
                if (isActive === undefined)
                    return '—';
                return (<span className={isActive ? 'user-pin__status--active' : 'user-pin__status--inactive'}>
            {isActive ? 'Activ' : 'Inactiv'}
          </span>);
            },
        },
        {
            headerName: 'Ultima utilizare',
            field: 'last_used',
            width: 180,
            valueFormatter: function (params) {
                if (!params.value)
                    return '—';
                try {
                    var date = new Date(params.value);
                    return date.toLocaleString('ro-RO');
                }
                catch (_a) {
                    return params.value;
                }
            },
        },
    ];
    return (<div className="user-pins-section">
      <div className="user-pins-section__header">
        <h3>PIN-uri Utilizatori</h3>
        <p className="user-pins-section__description">Lista tuturor PIN-urilor pentru utilizatori, ospătari și administratori din aplicație.</p>
      </div>

      {error && (<div className="user-pins-section__error">
          Eroare la încărcarea PIN-urilor: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </div>)}

      <section className="user-pins-section__toolbar">
        <TableFilter_1.TableFilter value={filter} onChange={setFilter} placeholder="cauta dupa utilizator pin rol sau email"/>
      </section>

      <section className="user-pins-section__grid">
        <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={filteredPins} loading={loading} quickFilterText={debouncedFilter} height="60vh"/>
      </section>
    </div>);
};
exports.UserPinsSection = UserPinsSection;
