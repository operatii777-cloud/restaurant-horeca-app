"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ERROR BOUNDARY - React Error Handling
 * Prinde erorile React și afișează UI friendly
 * Windows-style: clean, minimal, helpful
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
var react_1 = require("react");
var ErrorBoundaryInner = /** @class */ (function (_super) {
    __extends(ErrorBoundaryInner, _super);
    function ErrorBoundaryInner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleReset = function () {
            _this.setState({
                hasError: false,
                error: null,
            });
        };
        _this.state = {
            hasError: false,
            error: null,
        };
        return _this;
    }
    ErrorBoundaryInner.getDerivedStateFromError = function (error) {
        return {
            hasError: true,
            error: error,
        };
    };
    ErrorBoundaryInner.prototype.componentDidCatch = function (error, errorInfo) {
        // Log error
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // Call custom error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    };
    ErrorBoundaryInner.prototype.render = function () {
        var t = this.props.t;
        var translate = function (key) { return t ? t(key) : key; };
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (<div className="error-boundary" role="alert" aria-live="assertive" aria-atomic="true" style={{
                    padding: '32px',
                    textAlign: 'center',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                }}>
          <div style={{
                    maxWidth: '500px',
                    margin: '0 auto',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d1d1',
                    borderRadius: '6px',
                }}>
            <h2 id="error-title" style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#202020',
                    marginBottom: '12px',
                }}>{translate("Ceva nu a funcționat corect")}</h2>
            <p style={{
                    fontSize: '14px',
                    color: '#606060',
                }} className="margin-bottom-20">{translate("A apărut o eroare neașteptată. Te rugăm să reîmprospătezi pagina.")}</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (<details style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#f3f3f3',
                        borderRadius: '4px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                    }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Detalii eroare (doar în development)
                </summary>
                <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: '#d13438',
                    }}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>)}
            <button onClick={this.handleReset} aria-label="reincearca aplicatia dupa eroare" style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#0078d4',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                    minHeight: '44px',
                    minWidth: '44px',
                }} onMouseOver={function (e) {
                    e.currentTarget.style.backgroundColor = '#106ebe';
                }} onMouseOut={function (e) {
                    e.currentTarget.style.backgroundColor = '#0078d4';
                }}>{translate("Reîncearcă")}</button>
          </div>
        </div>);
        }
        return this.props.children;
    };
    return ErrorBoundaryInner;
}(react_1.Component));
var ErrorBoundary = function (props) {
    //   const { t } = useTranslation();
    return <ErrorBoundaryInner {...props} t={t}/>;
};
exports.ErrorBoundary = ErrorBoundary;
