"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryTreePanel = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
require("./CategoryTreePanel.css");
var CategoryTreePanel = function (_a) {
    var categories = _a.categories, selectedCategoryId = _a.selectedCategoryId, _b = _a.loading, loading = _b === void 0 ? false : _b, onSelectCategory = _a.onSelectCategory, onCreateCategory = _a.onCreateCategory, onEditCategory = _a.onEditCategory, onDeleteCategory = _a.onDeleteCategory, onRefresh = _a.onRefresh;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(new Set()), expandedIds = _c[0], setExpandedIds = _c[1];
    var _d = (0, react_1.useState)(null), hoveredCategoryId = _d[0], setHoveredCategoryId = _d[1];
    (0, react_1.useEffect)(function () {
        var initialExpanded = new Set();
        var collectIds = function (nodes) {
            nodes.forEach(function (node) {
                if (node.children && node.children.length > 0) {
                    initialExpanded.add(node.id);
                    collectIds(node.children);
                }
            });
        };
        collectIds(categories);
        setExpandedIds(initialExpanded);
    }, [categories]);
    var toggleExpanded = function (categoryId) {
        setExpandedIds(function (prev) {
            var next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            }
            else {
                next.add(categoryId);
            }
            return next;
        });
    };
    var visibleNodes = (0, react_1.useMemo)(function () {
        var buildNodes = function (nodes, depth) {
            if (depth === void 0) { depth = 0; }
            return nodes.flatMap(function (node) {
                var current = [{ category: node, depth: depth }];
                if (node.children && node.children.length > 0 && expandedIds.has(node.id)) {
                    current.push.apply(current, buildNodes(node.children, depth + 1));
                }
                return current;
            });
        };
        return buildNodes(categories, 0);
    }, [categories, expandedIds]);
    return (<div className="category-tree-panel">
      <header className="category-tree-panel__header">
        <div>
          <p className="category-tree-panel__subtitle">"structura meniuri"</p>
          <h3>Catalog categorii</h3>
        </div>
        <div className="category-tree-panel__header-actions">
          <button type="button" className="category-tree-panel__icon-button" onClick={function () { return onCreateCategory(null); }} title="adauga categorie">
            ➕
          </button>
          <button type="button" className="category-tree-panel__icon-button" onClick={function () { return onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh(); }} title="Reîmprospătează">
            ⟳
          </button>
        </div>
      </header>

      <div className="category-tree-panel__body">
        <button type="button" className={(0, classnames_1.default)('category-tree-panel__root', {
            'is-selected': selectedCategoryId === null,
        })} onClick={function () { return onSelectCategory(null); }}>
          <span>📦 Toate produsele</span>
        </button>

        <div className="category-tree-panel__divider"/>

        {loading ? (<div className="category-tree-panel__placeholder">"se incarca structura"</div>) : visibleNodes.length === 0 ? (<div className="category-tree-panel__placeholder">"nu exista categorii active creeaza una noua pentru"</div>) : (<ul className="category-tree-panel__list">
            {visibleNodes.map(function (_a) {
                var category = _a.category, depth = _a.depth;
                var hasChildren = Boolean(category.children && category.children.length > 0);
                var isExpanded = expandedIds.has(category.id);
                var isHovered = hoveredCategoryId === category.id;
                return (<li key={category.id} className="category-tree-panel__item-wrapper" onMouseEnter={function () { return setHoveredCategoryId(category.id); }} onMouseLeave={function () { return setHoveredCategoryId(null); }}>
                  {/* Butoane de acțiune deasupra dropdown-ului */}
                  {isHovered && (<div className="category-tree-panel__actions-bar">
                      <button type="button" className="category-tree-panel__action-btn" title="adauga subcategorie" onClick={function (event) {
                            event.stopPropagation();
                            onCreateCategory(category.id);
                        }}>
                        ➕
                      </button>
                      <button type="button" className="category-tree-panel__action-btn" title="editeaza categorie" onClick={function (event) {
                            event.stopPropagation();
                            onEditCategory(category);
                        }}>
                        ✎
                      </button>
                      <button type="button" className="category-tree-panel__action-btn" title="sterge categorie" onClick={function (event) {
                            event.stopPropagation();
                            onDeleteCategory(category);
                        }}>
                        🗑️
                      </button>
                    </div>)}

                  {/* Dropdown pentru categorie */}
                  <div className={(0, classnames_1.default)('category-tree-panel__dropdown', {
                        'is-selected': category.id === selectedCategoryId,
                        'is-hovered': isHovered,
                    })} style={{ paddingLeft: "".concat(depth * 16 + 12, "px") }}>
                    <div className="category-tree-panel__dropdown-header">
                      {hasChildren ? (<button type="button" className="category-tree-panel__toggle" onClick={function () { return toggleExpanded(category.id); }} aria-label={isExpanded ? 'Restrânge subcategoriile' : 'Extinde subcategoriile'}>
                          {isExpanded ? '▾' : '▸'}
                        </button>) : (<span className="category-tree-panel__toggle category-tree-panel__toggle--placeholder"/>)}

                      <button type="button" className="category-tree-panel__dropdown-button" onClick={function () { return onSelectCategory(category); }}>
                        <span className="category-tree-panel__icon">{category.icon || '📁'}</span>
                        <span className="category-tree-panel__name">{category.name}</span>
                        {typeof category.product_count === 'number' ? (<span className="category-tree-panel__count">{category.product_count}</span>) : null}
                      </button>
                    </div>
                  </div>
                </li>);
            })}
          </ul>)}
      </div>
    </div>);
};
exports.CategoryTreePanel = CategoryTreePanel;
