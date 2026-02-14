"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S15 — Daily Summary Table Component
 *
 * Table for displaying daily financial summary
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailySummaryTable = DailySummaryTable;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
function DailySummaryTable(_a) {
    var data = _a.data, _b = _a.title, title = _b === void 0 ? 'Daily Summary' : _b;
    //   const { t } = useTranslation();
    var formatCurrency = function (value) {
        //   const { t } = useTranslation();
        if (value === undefined || value === null || isNaN(value)) {
            return '0.00 RON';
        }
        return "".concat(Number(value).toFixed(2), " RON");
    };
    var formatPercent = function (value) {
        if (value === undefined || value === null || isNaN(value)) {
            return '0.0%';
        }
        return "".concat(Number(value).toFixed(1), "%");
    };
    return (<react_bootstrap_1.Card>
      <react_bootstrap_1.Card.Header>
        <h5 className="mb-0">{title}</h5>
      </react_bootstrap_1.Card.Header>
      <react_bootstrap_1.Card.Body>
        <react_bootstrap_1.Table striped hover responsive>
          <thead>
            <tr>
              <th>Zi</th>
              <th className="text-end">Venituri</th>
              <th className="text-end">COGS</th>
              <th className="text-end">Profit Brut</th>
              <th className="text-end">Food Cost %</th>
              <th className="text-end">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (<tr>
                <td colSpan={6} className="text-center text-muted">
                  Nu există date pentru perioada selectată
                </td>
              </tr>) : (data.map(function (item, index) { return (<tr key={index}>
                  <td>
                    <strong>{new Date(item.day).toLocaleDateString('ro-RO')}</strong>
                  </td>
                  <td className="text-end">{formatCurrency(item.revenue)}</td>
                  <td className="text-end">{formatCurrency(item.cogsTotal)}</td>
                  <td className="text-end">
                    <strong className={item.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(item.grossProfit)}
                    </strong>
                  </td>
                  <td className="text-end">
                    <span className={item.foodCostPercent > 40
                ? 'text-danger'
                : item.foodCostPercent > 30
                    ? 'text-warning'
                    : 'text-success'}>
                      {formatPercent(item.foodCostPercent)}
                    </span>
                  </td>
                  <td className="text-end">
                    <span className={item.marginPercent > 60
                ? 'text-success'
                : item.marginPercent > 40
                    ? 'text-warning'
                    : 'text-danger'}>
                      {formatPercent(item.marginPercent)}
                    </span>
                  </td>
                </tr>); }))}
          </tbody>
          {data.length > 0 && (<tfoot>
              <tr className="table-info">
                <td>
                  <strong>TOTAL</strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatCurrency(data.reduce(function (sum, item) { return sum + item.revenue; }, 0))}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatCurrency(data.reduce(function (sum, item) { return sum + item.cogsTotal; }, 0))}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatCurrency(data.reduce(function (sum, item) { return sum + item.grossProfit; }, 0))}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatPercent(data.reduce(function (sum, item) { return sum + item.revenue; }, 0) > 0
                ? (data.reduce(function (sum, item) { return sum + item.cogsTotal; }, 0) /
                    data.reduce(function (sum, item) { return sum + item.revenue; }, 0)) *
                    100
                : 0)}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatPercent(data.reduce(function (sum, item) { return sum + item.revenue; }, 0) > 0
                ? (data.reduce(function (sum, item) { return sum + item.grossProfit; }, 0) /
                    data.reduce(function (sum, item) { return sum + item.revenue; }, 0)) *
                    100
                : 0)}
                  </strong>
                </td>
              </tr>
            </tfoot>)}
        </react_bootstrap_1.Table>
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
}
