import { I18nContext } from '@/i18n/I18nContext';
import React, { Component, ErrorInfo, ReactNode, useContext } from 'react';
// CRITICAL: Nu folosim react-bootstrap în ErrorBoundary pentru a evita "Invalid hook call"
// când hooks-urile nu sunt disponibile (multiple React instances sau bundling issues)

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  t?: (key: string) => string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary pentru captarea erorilor React
 * Previne crash-ul aplicației și afișează un mesaj user-friendly
 */
class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state pentru a afișa fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log eroarea pentru debugging
    console.error('🚨 ErrorBoundary Caught error:', error);
    console.error('🚨 ErrorBoundary Component stack:', errorInfo.componentStack);
    
    // Update state cu detalii complete
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { t } = this.props;
    const translate = (key: string) => t ? t(key) : key;

    if (this.state.hasError) {
      // Custom fallback UI dacă e furnizat
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI - folosim HTML simplu pentru a evita probleme cu hooks
      // când React nu este disponibil corect (multiple instances sau bundling issues)
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#0f1419',
          color: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#dc2626',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>
              ⚠️ Ceva nu a mers bine
            </h2>
            <p style={{ marginBottom: '1rem' }}>{translate("Aplicația a întâmpinat o eroare neașteptată. Echipa tehnică a fost notificată.")}</p>
            {this.state.error && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Detalii tehnice (dev only)
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  backgroundColor: '#1e2742',
                  border: '1px solid #3a4563',
                  borderRadius: '0.25rem',
                  overflow: "Auto",
                  fontSize: '0.875rem'
                }}>
                  <code style={{ color: '#ffffff' }}>{this.state.error.toString()}</code>
                  {this.state.errorInfo && (
                    <>
                      <hr style={{ borderColor: '#3a4563', margin: '1rem 0' }} />
                      <code style={{ color: '#ffffff' }}>{this.state.errorInfo.componentStack}</code>
                    </>
                  )}
                </pre>
              </details>
            )}
            <hr style={{ borderColor: '#ef4444', margin: '1rem 0' }} />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={this.handleReset}
              >
                ↻ Încearcă din nou
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #64748b',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => window.location.href = '/admin-vite/dashboard'}
              >
                🏠 Mergi la Dashboard
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #64748b',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => window.location.reload()}
              >
                🔄 Reîncarcă pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = (props: Props) => {
  const context = React.useContext(I18nContext);
  const t = context ? context.t : (key: string) => key;
  return <ErrorBoundaryInner {...props} t={t} />;
};

export default ErrorBoundary;

