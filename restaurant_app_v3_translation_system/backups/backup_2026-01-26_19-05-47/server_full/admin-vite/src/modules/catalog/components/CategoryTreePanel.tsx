// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { CatalogCategory } from '@/types/catalog';
import './CategoryTreePanel.css';

type CategoryTreePanelProps = {
  categories: CatalogCategory[];
  selectedCategoryId: number | null;
  loading?: boolean;
  onSelectCategory: (category: CatalogCategory | null) => void;
  onCreateCategory: (parentId: number | null) => void;
  onEditCategory: (category: CatalogCategory) => void;
  onDeleteCategory: (category: CatalogCategory) => void;
  onRefresh?: () => void;
};

type VisibleNode = {
  category: CatalogCategory;
  depth: number;
};

export const CategoryTreePanel = ({
  categories,
  selectedCategoryId,
  loading = false,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onRefresh,
}: CategoryTreePanelProps) => {
//   const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const initialExpanded = new Set<number>();
    const collectIds = (nodes: CatalogCategory[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          initialExpanded.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(categories);
    setExpandedIds(initialExpanded);
  }, [categories]);

  const toggleExpanded = (categoryId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const visibleNodes = useMemo(() => {
    const buildNodes = (nodes: CatalogCategory[], depth = 0): VisibleNode[] => {
      return nodes.flatMap((node) => {
        const current: VisibleNode[] = [{ category: node, depth }];
        if (node.children && node.children.length > 0 && expandedIds.has(node.id)) {
          current.push(...buildNodes(node.children, depth + 1));
        }
        return current;
      });
    };

    return buildNodes(categories, 0);
  }, [categories, expandedIds]);

  return (
    <div className="category-tree-panel">
      <header className="category-tree-panel__header">
        <div>
          <p className="category-tree-panel__subtitle">"structura meniuri"</p>
          <h3>Catalog categorii</h3>
        </div>
        <div className="category-tree-panel__header-actions">
          <button
            type="button"
            className="category-tree-panel__icon-button"
            onClick={() => onCreateCategory(null)}
            title="adauga categorie"
          >
            ➕
          </button>
          <button
            type="button"
            className="category-tree-panel__icon-button"
            onClick={() => onRefresh?.()}
            title="Reîmprospătează"
          >
            ⟳
          </button>
        </div>
      </header>

      <div className="category-tree-panel__body">
        <button
          type="button"
          className={classNames('category-tree-panel__root', {
            'is-selected': selectedCategoryId === null,
          })}
          onClick={() => onSelectCategory(null)}
        >
          <span>📦 Toate produsele</span>
        </button>

        <div className="category-tree-panel__divider" />

        {loading ? (
          <div className="category-tree-panel__placeholder">"se incarca structura"</div>
        ) : visibleNodes.length === 0 ? (
          <div className="category-tree-panel__placeholder">"nu exista categorii active creeaza una noua pentru"</div>
        ) : (
          <ul className="category-tree-panel__list">
            {visibleNodes.map(({ category, depth }) => {
              const hasChildren = Boolean(category.children && category.children.length > 0);
              const isExpanded = expandedIds.has(category.id);

              const isHovered = hoveredCategoryId === category.id;

              return (
                <li 
                  key={category.id}
                  className="category-tree-panel__item-wrapper"
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  {/* Butoane de acțiune deasupra dropdown-ului */}
                  {isHovered && (
                    <div className="category-tree-panel__actions-bar">
                      <button
                        type="button"
                        className="category-tree-panel__action-btn"
                        title="adauga subcategorie"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCreateCategory(category.id);
                        }}
                      >
                        ➕
                      </button>
                      <button
                        type="button"
                        className="category-tree-panel__action-btn"
                        title="editeaza categorie"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditCategory(category);
                        }}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="category-tree-panel__action-btn"
                        title="sterge categorie"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteCategory(category);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  {/* Dropdown pentru categorie */}
                  <div
                    className={classNames('category-tree-panel__dropdown', {
                      'is-selected': category.id === selectedCategoryId,
                      'is-hovered': isHovered,
                    })}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                  >
                    <div className="category-tree-panel__dropdown-header">
                      {hasChildren ? (
                        <button
                          type="button"
                          className="category-tree-panel__toggle"
                          onClick={() => toggleExpanded(category.id)}
                          aria-label={isExpanded ? 'Restrânge subcategoriile' : 'Extinde subcategoriile'}
                        >
                          {isExpanded ? '▾' : '▸'}
                        </button>
                      ) : (
                        <span className="category-tree-panel__toggle category-tree-panel__toggle--placeholder" />
                      )}

                      <button
                        type="button"
                        className="category-tree-panel__dropdown-button"
                        onClick={() => onSelectCategory(category)}
                      >
                        <span className="category-tree-panel__icon">{category.icon || '📁'}</span>
                        <span className="category-tree-panel__name">{category.name}</span>
                        {typeof category.product_count === 'number' ? (
                          <span className="category-tree-panel__count">{category.product_count}</span>
                        ) : null}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};




