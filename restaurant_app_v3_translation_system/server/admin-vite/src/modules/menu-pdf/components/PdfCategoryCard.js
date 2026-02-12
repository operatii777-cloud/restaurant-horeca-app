"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfCategoryCard = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
// components/PdfCategoryCard.tsx
var react_1 = require("react");
require("./PdfCategoryCard.css");
var PdfCategoryCard = function (_a) {
    var category = _a.category, onToggleVisibility = _a.onToggleVisibility, onTogglePageBreak = _a.onTogglePageBreak, onToggleProduct = _a.onToggleProduct, onToggleAllProducts = _a.onToggleAllProducts, onUploadImage = _a.onUploadImage, onDeleteImage = _a.onDeleteImage;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(false), expanded = _b[0], setExpanded = _b[1];
    var _c = (0, react_1.useState)(false), uploading = _c[0], setUploading = _c[1];
    var handleImageUpload = function (e) {
        var _a;
        //   const { t } = useTranslation();
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            setUploading(true);
            onUploadImage(category.id, file);
            setTimeout(function () { return setUploading(false); }, 1000);
        }
    };
    var visibleProducts = category.products.filter(function (p) { return p.display_in_pdf; }).length;
    var totalProducts = category.products.length;
    return (<div className="pdf-category-card">
      <div className="pdf-category-card__header">
        <div className="pdf-category-card__drag-handle" title="drag pentru reordonare">
          ⋮⋮
        </div>

        <label className="pdf-category-card__toggle">
          <input type="checkbox" checked={category.display_in_pdf} onChange={function (e) { return onToggleVisibility(category.id, e.target.checked); }}/>
          <span className="pdf-category-card__toggle-slider"></span>
        </label>

        <h4 className="pdf-category-card__name">{category.category_name}</h4>

        <div className="pdf-category-card__stats">
          {visibleProducts}/{totalProducts} produse
        </div>

        <button type="button" className="pdf-category-card__expand" onClick={function () { return setExpanded(!expanded); }} title={expanded ? 'Ascunde' : 'Afișează'}>
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (<div className="pdf-category-card__body">
          {/* Image Upload Section */}
          <div className="pdf-category-card__image-section">
            <label className="pdf-category-card__section-label">📷 Imagine Header Categorie</label>
            {category.header_image ? (<div className="pdf-category-card__image-preview">
                <img src={category.header_image} alt={category.category_name}/>
                <button type="button" className="pdf-category-card__delete-image" onClick={function () { return onDeleteImage(category.id); }} title="sterge imagine">
                  🗑️
                </button>
              </div>) : (<div className="pdf-category-card__image-upload">
                <label htmlFor={"upload-".concat(category.id)} className="pdf-category-card__upload-label">
                  {uploading ? '⏳ Se încarcă...' : '☁️ Click pentru upload imagine'}
                </label>
                <input type="file" id={"upload-".concat(category.id)} accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading}/>
              </div>)}
          </div>

          {/* Page Break Section */}
          <div className="pdf-category-card__pagebreak-section">
            <label className="pdf-category-card__checkbox-label">
              <input type="checkbox" checked={category.page_break_after} onChange={function (e) { return onTogglePageBreak(category.id, e.target.checked); }}/>
              <span>📄 Forțează pagină nouă după această categorie</span>
            </label>
          </div>

          {/* Products Section */}
          <div className="pdf-category-card__products-section">
            <div className="pdf-category-card__section-label">
              🍽️ Produse ({totalProducts})
              <div className="pdf-category-card__product-actions">
                <button type="button" className="pdf-category-card__toggle-all" onClick={function () { return onToggleAllProducts(category.id, true); }}>"toate on"</button>
                <button type="button" className="pdf-category-card__toggle-all" onClick={function () { return onToggleAllProducts(category.id, false); }}>"toate off"</button>
              </div>
            </div>
            <div className="pdf-category-card__products-list">
              {category.products.map(function (product) { return (<div key={product.id} className="pdf-category-card__product-item">
                  <label className="pdf-category-card__toggle pdf-category-card__toggle--small">
                    <input type="checkbox" checked={product.display_in_pdf} onChange={function (e) { return onToggleProduct(product.id, e.target.checked); }}/>
                    <span className="pdf-category-card__toggle-slider"></span>
                  </label>
                  <span className="pdf-category-card__product-name">{product.name}</span>
                  <span className="pdf-category-card__product-price">{product.price} RON</span>
                </div>); })}
            </div>
          </div>
        </div>)}
    </div>);
};
exports.PdfCategoryCard = PdfCategoryCard;
