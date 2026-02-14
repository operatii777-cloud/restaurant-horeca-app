"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - ProfitLossPage PRO Version
 * Raport Profit & Loss cu COGS din S13 Engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitLossPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var ExcelPageLayout_1 = require("@/shared/components/page/ExcelPageLayout");
var useDailyCogsSummary_1 = require("../hooks/useDailyCogsSummary");
var DailyCogsTimelineChart_1 = require("../components/DailyCogsTimelineChart");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./ProfitLossPage.css");
var ProfitLossPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1); // Ultima lună
        return date.toISOString().split('T')[0];
    }), startDate = _a[0], setStartDate = _a[1];
    var _b = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _b[0], setEndDate = _b[1];
    var filters = (0, react_1.useMemo)(function () { return ({
        dateFrom: startDate,
        dateTo: endDate,
    }); }, [startDate, endDate]);
    var _c = (0, useDailyCogsSummary_1.useDailyCogsSummary)(filters), data = _c.data, chartData = _c.chartData, kpiBlocks = _c.kpiBlocks, loading = _c.loading, error = _c.error, refetch = _c.refetch;
    var handleDateChange = function () {
        refetch();
    };
    // Header Actions - Compact
    var headerActions = null; // Nu avem acțiuni în header pentru moment
    // Toolbar - Filtre Perioadă Compact
    var toolbar = (<>
      {error && (<div style={{
                padding: '6px 12px',
                background: 'var(--error-light, #fee2e2)',
                color: 'var(--error, #ef4444)',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>)}
      <input type="date" className="excel-input" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }} onBlur={handleDateChange} style={{ width: '140px' }} title="De la dată"/>
      <input type="date" className="excel-input" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }} onBlur={handleDateChange} style={{ width: '140px' }} title="Până la dată"/>
      <button type="button" className="excel-button excel-button--primary" onClick={refetch} disabled={loading}>
        <span>{loading ? '⏳' : '🔄'}</span>
        <span>{loading ? 'Se încarcă...' : 'Reîmprospătează'}</span>
      </button>
    </>);
    // Footer - Totaluri
    var footer = (<>
      <div>
        Total zile: <strong>{data.length}</strong>
      </div>
      <div>Restaurant App V3 powered by QrOMS</div>
    </>);
    return (<ExcelPageLayout_1.ExcelPageLayout title="💰 Raport Profit & Loss (P&L)" subtitle="Analiză profitabilitate zilnică cu costuri (COGS) din S13" headerActions={headerActions} toolbar={toolbar} footer={footer}>
      {/* KPI Cards - Mutate în partea de sus, layout orizontal compact */}
      <div className="kpi-cards-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
            padding: '0',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            zIndex: 1,
            width: '100%',
            minHeight: '80px',
            backgroundColor: 'transparent'
        }}>
        <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
            {kpiBlocks.totalRevenue.title}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#000000',
            lineHeight: '1.2',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {loading ? '...' : kpiBlocks.totalRevenue.value}
          </div>
          {kpiBlocks.totalRevenue.subtitle && (<div style={{ fontSize: '11px', color: '#6b7280' }}>{kpiBlocks.totalRevenue.subtitle}</div>)}
        </div>
        <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
            {kpiBlocks.totalCogs.title}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#000000',
            lineHeight: '1.2',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {loading ? '...' : kpiBlocks.totalCogs.value}
          </div>
          {kpiBlocks.totalCogs.subtitle && (<div style={{ fontSize: '11px', color: '#6b7280' }}>{kpiBlocks.totalCogs.subtitle}</div>)}
        </div>
        <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
            {kpiBlocks.grossProfit.title}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#000000',
            lineHeight: '1.2',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {loading ? '...' : kpiBlocks.grossProfit.value}
          </div>
          {kpiBlocks.grossProfit.subtitle && (<div style={{ fontSize: '11px', color: '#6b7280' }}>{kpiBlocks.grossProfit.subtitle}</div>)}
        </div>
        <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
            {kpiBlocks.avgFoodCostPercent.title}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#000000',
            lineHeight: '1.2',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {loading ? '...' : kpiBlocks.avgFoodCostPercent.value}
          </div>
          {kpiBlocks.avgFoodCostPercent.subtitle && (<div style={{ fontSize: '11px', color: '#6b7280' }}>{kpiBlocks.avgFoodCostPercent.subtitle}</div>)}
        </div>
        <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
            {kpiBlocks.avgMarginPercent.title}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#000000',
            lineHeight: '1.2',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {loading ? '...' : kpiBlocks.avgMarginPercent.value}
          </div>
          {kpiBlocks.avgMarginPercent.subtitle && (<div style={{ fontSize: '11px', color: '#6b7280' }}>{kpiBlocks.avgMarginPercent.subtitle}</div>)}
        </div>
      </div>

      {/* Timeline Chart - Compact Card */}
      <div className="excel-card">
        <div className="excel-card__header">
          <h3 className="excel-card__title">Evoluție zilnică venituri, COGS și profit</h3>
        </div>
        <div className="excel-card__body" style={{ maxHeight: '250px', overflowY: "auto" }}>
          <DailyCogsTimelineChart_1.DailyCogsTimelineChart data={chartData} loading={loading} height={250}/>
        </div>
      </div>

      {/* Details Table - Compact Card */}
      <div className="excel-card">
        <div className="excel-card__header">
          <h3 className="excel-card__title">Detalii Zilnice</h3>
        </div>
        <div className="excel-card__body">
          <react_bootstrap_1.Table striped hover responsive className="table-sm" style={{ margin: 0, fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Venituri</th>
                <th>COGS</th>
                <th>Profit</th>
                <th>Food Cost %</th>
                <th>Marjă %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr>
                  <td colSpan={6} className="text-center text-muted">
                    <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă datele...</td>
                </tr>) : data.length === 0 ? (<tr>
                  <td colSpan={6} className="text-center text-muted">Nu există date pentru perioada selectată</td>
                </tr>) : (data.map(function (item, index) { return (<tr key={index}>
                    <td>{new Date(item.day).toLocaleDateString('ro-RO')}</td>
                    <td>{item.revenue.toFixed(2)} RON</td>
                    <td>{item.cogsTotal.toFixed(2)} RON</td>
                    <td>
                      <strong>{item.profit.toFixed(2)} RON</strong>
                    </td>
                    <td>
                      {item.foodCostPercent !== null ? (<span className={item.foodCostPercent > 35
                    ? 'text-danger'
                    : item.foodCostPercent > 30
                        ? 'text-warning'
                        : 'text-success'}>
                          {item.foodCostPercent.toFixed(1)}%
                        </span>) : (<span className="text-muted">-</span>)}
                    </td>
                    <td>
                      {item.marginPercent !== null ? (<span className={item.marginPercent < 50 ? 'text-warning' : 'text-success'}>
                          {item.marginPercent.toFixed(1)}%
                        </span>) : (<span className="text-muted">-</span>)}
                    </td>
                  </tr>); }))}
            </tbody>
          </react_bootstrap_1.Table>
        </div>
      </div>
    </ExcelPageLayout_1.ExcelPageLayout>);
};
exports.ProfitLossPage = ProfitLossPage;
