"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialReportsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var ProfitLossPage_1 = require("@/modules/reports/pages/ProfitLossPage");
var useFinancialReports_1 = require("@/modules/reports/hooks/useFinancialReports");
var FinancialKpiCard_1 = require("@/modules/reports/components/financial/FinancialKpiCard");
var FinancialPnlChart_1 = require("@/modules/reports/components/financial/FinancialPnlChart");
var FinancialCashflowChart_1 = require("@/modules/reports/components/financial/FinancialCashflowChart");
var CategoryMixChart_1 = require("@/modules/reports/components/financial/CategoryMixChart");
var DailySummaryTable_1 = require("@/modules/reports/components/financial/DailySummaryTable");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FinancialReportsPage.css");
var FinancialReportsPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
    //   const { t } = useTranslation();
    var _4 = (0, react_1.useState)('overview'), activeTab = _4[0], setActiveTab = _4[1];
    var _5 = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _5[0], setStartDate = _5[1];
    var _6 = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _6[0], setEndDate = _6[1];
    // S15 Hooks - using new financial API
    var filters = { dateFrom: startDate, dateTo: endDate };
    var dailySummary = (0, useFinancialReports_1.useDailyFinancialSummary)(filters);
    var pnl = (0, useFinancialReports_1.usePnl)(filters);
    var cashflow = (0, useFinancialReports_1.useCashflow)(filters);
    var categoryMix = (0, useFinancialReports_1.useCategoryMix)(filters);
    // Combined loading state
    var isLoading = dailySummary.isLoading ||
        pnl.isLoading ||
        cashflow.isLoading ||
        categoryMix.isLoading;
    // Combined error state
    var error = dailySummary.error ||
        pnl.error ||
        cashflow.error ||
        categoryMix.error;
    var handleRefresh = function () {
        dailySummary.refetch();
        pnl.refetch();
        cashflow.refetch();
        categoryMix.refetch();
    };
    return (<div className="financial-reports-page">
      <div className="page-header">
        <h1>💰 Rapoarte Financiare</h1>
        <p>Rapoarte financiare complete: Profit & Loss, TVA, venituri și analiză financiară</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* KPI Row */}
      {pnl.data && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={3}>
            <FinancialKpiCard_1.FinancialKpiCard title="Venit Total" value={(_b = (_a = pnl.data) === null || _a === void 0 ? void 0 : _a.revenue) !== null && _b !== void 0 ? _b : 0} variant="success" format="currency"/>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <FinancialKpiCard_1.FinancialKpiCard title="Costuri (COGS)" value={(_d = (_c = pnl.data) === null || _c === void 0 ? void 0 : _c.cogsTotal) !== null && _d !== void 0 ? _d : 0} variant="danger" format="currency"/>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <FinancialKpiCard_1.FinancialKpiCard title="Profit Brut" value={(_f = (_e = pnl.data) === null || _e === void 0 ? void 0 : _e.grossProfit) !== null && _f !== void 0 ? _f : 0} variant="success" format="currency"/>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <FinancialKpiCard_1.FinancialKpiCard title="Food Cost %" value={(_g = pnl.data.foodCostPercent) !== null && _g !== void 0 ? _g : 0} variant={((_h = pnl.data.foodCostPercent) !== null && _h !== void 0 ? _h : 0) > 40 ? 'danger' : ((_j = pnl.data.foodCostPercent) !== null && _j !== void 0 ? _j : 0) > 30 ? 'warning' : 'success'} format="percent"/>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {pnl.data && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={3}>
            <FinancialKpiCard_1.FinancialKpiCard title="Profit Net" value={(_l = (_k = pnl.data) === null || _k === void 0 ? void 0 : _k.netProfit) !== null && _l !== void 0 ? _l : 0} variant={((_o = (_m = pnl.data) === null || _m === void 0 ? void 0 : _m.netProfit) !== null && _o !== void 0 ? _o : 0) >= 0 ? 'success' : 'danger'} format="currency" subtitle={((_q = (_p = pnl.data) === null || _p === void 0 ? void 0 : _p.operatingExpenses) !== null && _q !== void 0 ? _q : 0) > 0 ? 'După cheltuieli operaționale' : 'Estimat (fără cheltuieli op.)'}/>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <FinancialKpiCard_1.FinancialKpiCard title="Marjă %" value={(_s = (_r = pnl.data) === null || _r === void 0 ? void 0 : _r.marginPercent) !== null && _s !== void 0 ? _s : 0} variant={((_u = (_t = pnl.data) === null || _t === void 0 ? void 0 : _t.marginPercent) !== null && _u !== void 0 ? _u : 0) > 60 ? 'success' : ((_w = (_v = pnl.data) === null || _v === void 0 ? void 0 : _v.marginPercent) !== null && _w !== void 0 ? _w : 0) > 40 ? 'warning' : 'danger'} format="percent"/>
          </react_bootstrap_1.Col>
          {cashflow.data && (<>
              <react_bootstrap_1.Col md={3}>
                <FinancialKpiCard_1.FinancialKpiCard title="Flux numerar net" value={(_y = (_x = cashflow.data) === null || _x === void 0 ? void 0 : _x.netCashflow) !== null && _y !== void 0 ? _y : 0} variant={((_0 = (_z = cashflow.data) === null || _z === void 0 ? void 0 : _z.netCashflow) !== null && _0 !== void 0 ? _0 : 0) >= 0 ? 'success' : 'danger'} format="currency"/>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={3}>
                <FinancialKpiCard_1.FinancialKpiCard title="Intrări totale" value={(_3 = (_2 = (_1 = cashflow.data) === null || _1 === void 0 ? void 0 : _1.inflows) === null || _2 === void 0 ? void 0 : _2.total) !== null && _3 !== void 0 ? _3 : 0} variant="primary" format="currency"/>
              </react_bootstrap_1.Col>
            </>)}
        </react_bootstrap_1.Row>)}

      {/* Filters */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <div>
                <react_bootstrap_1.Button variant="primary" onClick={handleRefresh} disabled={isLoading}>
                  <i className={"fas ".concat(isLoading ? 'fa-spinner fa-spin' : 'fa-sync', " me-2")}></i>
                  {isLoading ? 'Se încarcă...' : 'Actualizează'}
                </react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tabs */}
      <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
        <react_bootstrap_1.Tab eventKey="overview" title="📊 Overview">
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={12}>
              {dailySummary.data && dailySummary.data.length > 0 && (<FinancialPnlChart_1.FinancialPnlChart data={dailySummary.data} chartType="bar" title="Profit & Loss Timeline"/>)}
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={6}>
              {cashflow.data && (<FinancialCashflowChart_1.FinancialCashflowChart data={cashflow.data} title="Cashflow Analysis"/>)}
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={6}>
              {categoryMix.data && categoryMix.data.categories && categoryMix.data.categories.length > 0 && (<CategoryMixChart_1.CategoryMixChart categories={categoryMix.data.categories} chartType="pie" title="Category Mix"/>)}
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="daily" title="📅 Daily Summary">
          {dailySummary.data && dailySummary.data.length > 0 ? (<DailySummaryTable_1.DailySummaryTable data={dailySummary.data} title="Daily Financial Summary"/>) : (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>)}
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="category-mix" title="📊 Category Mix">
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={12}>
              {categoryMix.data && categoryMix.data.categories && categoryMix.data.categories.length > 0 && (<>
                  <CategoryMixChart_1.CategoryMixChart categories={categoryMix.data.categories} chartType="bar" title="Distribuție venituri pe categorii"/>
                  <react_bootstrap_1.Card className="mt-4">
                    <react_bootstrap_1.Card.Header>
                      <h5 className="mb-0">Detalii categorii</h5>
                    </react_bootstrap_1.Card.Header>
                    <react_bootstrap_1.Card.Body>
                      <react_bootstrap_1.Table striped hover responsive>
                        <thead>
                          <tr>
                            <th>Categorie</th>
                            <th className="text-end">Venituri</th>
                            <th className="text-end">COGS</th>
                            <th className="text-end">Profit Brut</th>
                            <th className="text-end">Food Cost %</th>
                            <th className="text-end">Margin %</th>
                            <th className="text-end">Share of Revenue %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryMix.data.categories
                .sort(function (a, b) { var _a, _b; return ((_a = b.shareOfRevenue) !== null && _a !== void 0 ? _a : 0) - ((_b = a.shareOfRevenue) !== null && _b !== void 0 ? _b : 0); })
                .map(function (cat, index) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                return (<tr key={index}>
                                <td>
                                  <strong>{cat.categoryName}</strong>
                                </td>
                                <td className="text-end">{((_a = cat.revenue) !== null && _a !== void 0 ? _a : 0).toFixed(2)} RON</td>
                                <td className="text-end">{((_b = cat.cogsTotal) !== null && _b !== void 0 ? _b : 0).toFixed(2)} RON</td>
                                <td className="text-end">
                                  <strong className={((_c = cat.grossProfit) !== null && _c !== void 0 ? _c : 0) >= 0 ? 'text-success' : 'text-danger'}>
                                    {((_d = cat.grossProfit) !== null && _d !== void 0 ? _d : 0).toFixed(2)} RON
                                  </strong>
                                </td>
                                <td className="text-end">
                                  <span className={((_e = cat.foodCostPercent) !== null && _e !== void 0 ? _e : 0) > 40
                        ? 'text-danger'
                        : ((_f = cat.foodCostPercent) !== null && _f !== void 0 ? _f : 0) > 30
                            ? 'text-warning'
                            : 'text-success'}>
                                    {((_g = cat.foodCostPercent) !== null && _g !== void 0 ? _g : 0).toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-end">
                                  <span className={((_h = cat.marginPercent) !== null && _h !== void 0 ? _h : 0) > 60
                        ? 'text-success'
                        : ((_j = cat.marginPercent) !== null && _j !== void 0 ? _j : 0) > 40
                            ? 'text-warning'
                            : 'text-danger'}>
                                    {((_k = cat.marginPercent) !== null && _k !== void 0 ? _k : 0).toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-end">
                                  <strong>{((_l = cat.shareOfRevenue) !== null && _l !== void 0 ? _l : 0).toFixed(1)}%</strong>
                                </td>
                              </tr>);
            })}
                        </tbody>
                      </react_bootstrap_1.Table>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </>)}
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="profit-loss" title="💰 Profit & Loss">
          <ProfitLossPage_1.ProfitLossPage />
        </react_bootstrap_1.Tab>
      </react_bootstrap_1.Tabs>
    </div>);
};
exports.FinancialReportsPage = FinancialReportsPage;
