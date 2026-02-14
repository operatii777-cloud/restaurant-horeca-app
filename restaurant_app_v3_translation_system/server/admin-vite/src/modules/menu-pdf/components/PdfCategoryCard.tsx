// import { useTranslation } from '@/i18n/I18nContext';
// components/PdfCategoryCard.tsx
import { useState } from 'react';
import type { PdfCategory, PdfProduct } from '../hooks/usePdfConfig';
import './PdfCategoryCard.css';

interface PdfCategoryCardProps {
  category: PdfCategory;
  onToggleVisibility: (categoryId: number, visible: boolean) => void;
  onTogglePageBreak: (categoryId: number, pageBreak: boolean) => void;
  onToggleProduct: (productId: number, visible: boolean) => void;
  onToggleAllProducts: (categoryId: number, visible: boolean) => void;
  onUploadImage: (categoryId: number, file: File) => void;
  onDeleteImage: (categoryId: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  index?: number;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export const PdfCategoryCard = ({
  category,
  onToggleVisibility,
  onTogglePageBreak,
  onToggleProduct,
  onToggleAllProducts,
  onUploadImage,
  onDeleteImage,
  index = 0,
  draggable = true,
  onDragStart,
  onDragOver,
  onDrop,
}: PdfCategoryCardProps) => {
//   const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const { t } = useTranslation();
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      onUploadImage(category.id, file);
      setTimeout(() => setUploading(false), 1000);
    }
  };

  const visibleProducts = category.products.filter((p) => p.display_in_pdf).length;
  const totalProducts = category.products.length;

  return (
    <div 
      className="pdf-category-card"
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
    >
      <div className="pdf-category-card__header">
        <div 
          className="pdf-category-card__drag-handle" 
          title="Drag pentru reordonare"
          style={{ cursor: draggable ? 'move' : 'default' }}
        >
          ⋮⋮
        </div>

        <label className="pdf-category-card__toggle">
          <input
            type="checkbox"
            checked={category.display_in_pdf}
            onChange={(e) => onToggleVisibility(category.id, e.target.checked)}
          />
          <span className="pdf-category-card__toggle-slider"></span>
        </label>

        <h4 className="pdf-category-card__name">{category.category_name}</h4>

        <div className="pdf-category-card__stats">
          {visibleProducts}/{totalProducts} produse
        </div>

        <button
          type="button"
          className="pdf-category-card__expand"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Ascunde' : 'Afișează'}
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="pdf-category-card__body">
          {/* Image Upload Section */}
          <div className="pdf-category-card__image-section">
            <label className="pdf-category-card__section-label">📷 Imagine Header Categorie</label>
            {category.header_image ? (
              <div className="pdf-category-card__image-preview">
                <img src={category.header_image} alt={category.category_name} />
                <button
                  type="button"
                  className="pdf-category-card__delete-image"
                  onClick={() => onDeleteImage(category.id)}
                  title="sterge imagine"
                >
                  🗑️
                </button>
              </div>
            ) : (
              <div className="pdf-category-card__image-upload">
                <label htmlFor={`upload-${category.id}`} className="pdf-category-card__upload-label">
                  {uploading ? '⏳ Se încarcă...' : '☁️ Click pentru upload imagine'}
                </label>
                <input
                  type="file"
                  id={`upload-${category.id}`}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </div>
            )}
          </div>

          {/* Page Break Section */}
          <div className="pdf-category-card__pagebreak-section">
            <label className="pdf-category-card__checkbox-label">
              <input
                type="checkbox"
                checked={category.page_break_after}
                onChange={(e) => onTogglePageBreak(category.id, e.target.checked)}
              />
              <span>📄 Forțează pagină nouă după această categorie</span>
            </label>
          </div>

          {/* Products Section */}
          <div className="pdf-category-card__products-section">
            <div className="pdf-category-card__section-label">
              🍽️ Produse ({totalProducts})
              <div className="pdf-category-card__product-actions">
                <button
                  type="button"
                  className="pdf-category-card__toggle-all"
                  onClick={() => onToggleAllProducts(category.id, true)}
                >"toate on"</button>
                <button
                  type="button"
                  className="pdf-category-card__toggle-all"
                  onClick={() => onToggleAllProducts(category.id, false)}
                >"toate off"</button>
              </div>
            </div>
            <div className="pdf-category-card__products-list">
              {category.products.map((product) => (
                <div key={product.id} className="pdf-category-card__product-item">
                  <label className="pdf-category-card__toggle pdf-category-card__toggle--small">
                    <input
                      type="checkbox"
                      checked={product.display_in_pdf}
                      onChange={(e) => onToggleProduct(product.id, e.target.checked)}
                    />
                    <span className="pdf-category-card__toggle-slider"></span>
                  </label>
                  <span className="pdf-category-card__product-name">{product.name}</span>
                  <span className="pdf-category-card__product-price">{product.price} RON</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




