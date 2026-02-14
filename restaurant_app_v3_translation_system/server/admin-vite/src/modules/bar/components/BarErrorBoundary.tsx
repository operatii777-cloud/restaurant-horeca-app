/**
 * Bar Error Boundary
 * Specialized error handling for Bar module
 * Bar-appropriate messaging and quick recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BarErrorBoundary extends Component<Props, State> {
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
    console.error('🚨 Bar Error:', error);
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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#171717',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff'
        }}>
          <div style={{
            maxWidth: '700px',
            textAlign: 'center',
            backgroundColor: '#262626',
            padding: '3rem',
            borderRadius: '1rem',
            border: '3px solid #f59e0b'
          }}>
            <div style={{ 
              fontSize: '5rem', 
              marginBottom: '1.5rem' 
            }}>
              🍸
            </div>
            
            <h1 style={{ 
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#f59e0b'
            }}>
              BAR DISPLAY ERROR
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              lineHeight: 1.6,
              color: '#cbd5e1'
            }}>
              <strong>⚠️ ALERT:</strong> The bar display system has encountered an error. Please reload or contact technical support.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '1.5rem 2.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  minWidth: '200px',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
                }}
              >
                ↻ RESET
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '1.5rem 2.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  minWidth: '200px',
                  boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
                }}
              >
                🔄 RELOAD
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '2rem',
                textAlign: 'left',
                backgroundColor: '#171717',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  Technical Details
                </summary>
                <pre style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
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

export default BarErrorBoundary;
