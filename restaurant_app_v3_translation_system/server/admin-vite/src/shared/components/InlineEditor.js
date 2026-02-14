"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineEditor = void 0;
require("./InlineEditor.css");
var InlineEditor = function (_a) {
    var title = _a.title, description = _a.description, children = _a.children, footer = _a.footer, onCancel = _a.onCancel, onSave = _a.onSave, _b = _a.saveLabel, saveLabel = _b === void 0 ? 'Salvează' : _b, _c = _a.cancelLabel, cancelLabel = _c === void 0 ? 'Anulează' : _c, _d = _a.processing, processing = _d === void 0 ? false : _d;
    //   const { t } = useTranslation();
    return (<section className="inline-editor">
      <header className="inline-editor__header">
        {title ? <h3>{title}</h3> : null}
        {description ? <p>{description}</p> : null}
      </header>
      <div className="inline-editor__content">{children}</div>
      <footer className="inline-editor__footer">
        {footer}
        <div className="inline-editor__actions">
          {onCancel ? (<button type="button" className="inline-editor__button inline-editor__button--secondary" onClick={onCancel}>
              {cancelLabel}
            </button>) : null}
          {onSave ? (<button type="button" className="inline-editor__button inline-editor__button--primary" onClick={onSave} disabled={processing}>
              {processing ? 'Se salvează…' : saveLabel}
            </button>) : null}
        </div>
      </footer>
    </section>);
};
exports.InlineEditor = InlineEditor;
