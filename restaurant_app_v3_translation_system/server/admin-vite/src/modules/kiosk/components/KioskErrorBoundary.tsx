/**
 * Kiosk Error Boundary
 * Specialized error handling for Kiosk module
 * Fullscreen, touch-friendly error recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class KioskErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Kiosk Error:', error);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReturnToKioskHome = () => {
    window.location.href = '/admin-vite/kiosk';
  };

  render() {
    if (this.state.hasError) {
      // Fullscreen kiosk-friendly error UI
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          padding: '3rem',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff'
        }}>
          <div style={{
            maxWidth: '800px',
            textAlign: 'center'
          }}>
            {/* Large touch-friendly icon */}
            <div style={{ 
              fontSize: '8rem', 
              marginBottom: '2rem',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              ⚠️
            </div>
            
            {/* Bilingual error message */}
            <h1 style={{ 
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#ef4444'
            }}>
              System Error
            </h1>
            
            <p style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              lineHeight: 1.6,
              color: '#cbd5e1'
            }}>
              <strong>RO:</strong> Sistemul a întâmpinat o eroare. Vă rugăm să apăsați butonul de resetare sau să solicitați asistență.
            </p>
            
            <p style={{
              fontSize: '1.5rem',
              marginBottom: '3rem',
              lineHeight: 1.6,
              color: '#cbd5e1'
            }}>
              <strong>EN:</strong> The system encountered an error. Please press the reset button or request assistance.
            </p>
            
            {/* Large touch-friendly buttons */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '2rem 3rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  minWidth: '250px',
                  minHeight: '100px',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}
              >
                ↻ Reset / Resetare
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '2rem 3rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '3px solid #64748b',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  minWidth: '250px',
                  minHeight: '100px'
                }}
              >
                🔄 Reload / Reîncarcă
              </button>
            </div>

            {/* Optional staff access */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={this.handleReturnToKioskHome}
                style={{
                  marginTop: '2rem',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                🏠 Kiosk Home (Staff Only)
              </button>
            )}

            {/* Technical details for staff (hidden by default) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '3rem',
                textAlign: 'left',
                backgroundColor: '#1e293b',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}>
                  🔧 Technical Details (Staff)
                </summary>
                <pre style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default KioskErrorBoundary;
