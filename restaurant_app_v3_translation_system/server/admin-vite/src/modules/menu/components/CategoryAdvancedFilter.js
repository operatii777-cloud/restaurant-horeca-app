"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryAdvancedFilter = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./CategoryAdvancedFilter.css");
var CategoryAdvancedFilter = function (_a) {
    var categories = _a.categories, selectedCategory = _a.selectedCategory, sortBy = _a.sortBy, sortOrder = _a.sortOrder, onCategoryChange = _a.onCategoryChange, onSortChange = _a.onSortChange, onClear = _a.onClear;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(false), expanded = _b[0], setExpanded = _b[1];
    return (<react_bootstrap_1.Card className="category-advanced-filter mb-3">
      <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={function () { return setExpanded(!expanded); }}>
        <span>
          <i className="fas fa-filter me-2"></i>
          Filtrare & Sortare Avansată Categorii
        </span>
        <i className={"fas fa-chevron-".concat(expanded ? 'up' : 'down')}></i>
      </react_bootstrap_1.Card.Header>
      {expanded && (<react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={6}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Filtrare după categorie</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={selectedCategory} onChange={function (e) { return onCategoryChange(e.target.value); }}>
                  <option value="">Toate categoriile</option>
                  {categories.map(function (cat) { return (<option key={cat} value={cat}>
                      {cat}
                    </option>); })}
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Sortare după</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={sortBy} onChange={function (e) { return onSortChange(e.target.value, sortOrder); }}>
                  <option value="name">Nume</option>
                  <option value="productCount">Număr produse</option>
                  <option value="price">Preț mediu</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Ordine</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={sortOrder} onChange={function (e) { return onSortChange(sortBy, e.target.value); }}>
                  <option value="asc">Crescător</option>
                  <option value="desc">Descrescător</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <div className="mt-3">
            <react_bootstrap_1.Button variant="secondary" size="sm" onClick={onClear}>
              <i className="fas fa-times me-2"></i>Șterge filtrele</react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Body>)}
    </react_bootstrap_1.Card>);
};
exports.CategoryAdvancedFilter = CategoryAdvancedFilter;
