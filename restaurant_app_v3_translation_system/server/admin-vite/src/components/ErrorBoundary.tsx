/**
 * ERROR BOUNDARY - React Error Handling
 * Catches React errors and displays user-friendly fallback UI
 * 
 * Features:
 * - Bilingual support (RO/EN)
 * - Development mode details
 * - Recovery options (retry, go home, reload)
 * - Logging for debugging
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  moduleName?: string; // For logging purposes (e.g., "POS", "Kiosk", "KDS")
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Usage:
 * <ErrorBoundary moduleName="POS">
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to display fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { moduleName, onError } = this.props;
    
    // Log error for debugging
    console.error(`🚨 ErrorBoundary [${moduleName || 'App'}] Caught error:`, error);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    
    // Update state with complete details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // TODO: Send error to logging service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService({ error, errorInfo, module: moduleName });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/admin-vite/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { moduleName } = this.props;
      const isDevelopment = process.env.NODE_ENV === 'development';

      // Default fallback UI - clean HTML to avoid React dependency issues
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          backgroundColor: '#0f1419',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#1e2742',
            border: '1px solid #3a4563',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '100%'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '2rem'
              }}>⚠️</div>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem',
                  fontWeight: 600 
                }}>
                  Ceva nu a mers bine
                </h2>
                <p style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#94a3b8'
                }}>
                  Something went wrong
                </p>
              </div>
            </div>

            {/* Message */}
            <div style={{
              backgroundColor: '#dc2626',
              border: '1px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                <strong>RO:</strong> Aplicația a întâmpinat o eroare neașteptată{moduleName ? ` în modulul ${moduleName}` : ''}. 
                Vă rugăm să încercați din nou sau să mergeți la pagina principală.
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                <strong>EN:</strong> The application encountered an unexpected error{moduleName ? ` in the ${moduleName} module` : ''}. 
                Please try again or go to the home page.
              </p>
            </div>

            {/* Technical Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <details style={{
                marginBottom: '1.5rem',
                backgroundColor: '#0f1419',
                border: '1px solid #3a4563',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: '#f59e0b'
                }}>
                  🔧 Technical Details (Development Mode)
                </summary>
                <div style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#1e2742',
                  borderRadius: '0.375rem',
                  border: '1px solid #3a4563'
                }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.813rem',
                    lineHeight: 1.6
                  }}>
                    <div style={{ color: '#ef4444', marginBottom: '0.5rem' }}>
                      <strong>Error:</strong>
                    </div>
                    <pre style={{
                      margin: '0 0 1rem 0',
                      padding: '0.5rem',
                      backgroundColor: '#0f1419',
                      borderRadius: '0.25rem',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {this.state.error.toString()}
                    </pre>
                    
                    {this.state.error.stack && (
                      <>
                        <div style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>
                          <strong>Stack Trace:</strong>
                        </div>
                        <pre style={{
                          margin: '0 0 1rem 0',
                          padding: '0.5rem',
                          backgroundColor: '#0f1419',
                          borderRadius: '0.25rem',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: '0.75rem'
                        }}>
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}

                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <>
                        <div style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>
                          <strong>Component Stack:</strong>
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '0.5rem',
                          backgroundColor: '#0f1419',
                          borderRadius: '0.25rem',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: '0.75rem'
                        }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap' 
            }}>
              <button
                style={{
                  flex: '1',
                  minWidth: '120px',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s'
                }}
                onClick={this.handleReset}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                ↻ Încearcă din nou / Try Again
              </button>
              <button
                style={{
                  flex: '1',
                  minWidth: '120px',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #64748b',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onClick={this.handleGoHome}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#64748b';
                }}
              >
                🏠 Pagina principală / Home
              </button>
              <button
                style={{
                  flex: '1',
                  minWidth: '120px',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #64748b',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onClick={this.handleReload}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#64748b';
                }}
              >
                🔄 Reîncarcă / Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

