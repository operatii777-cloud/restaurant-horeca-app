/**
 * POS Error Boundary
 * Specialized error handling for POS module
 * Provides POS-appropriate recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PosErrorBoundary extends Component<Props, State> {
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
    console.error('🚨 POS Error:', error);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReturnToOrders = () => {
    window.location.href = '/admin-vite/orders';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0f1419',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: '#1e2742',
            border: '2px solid #ef4444',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ 
              color: '#ffffff',
              fontSize: '1.75rem',
              marginBottom: '1rem'
            }}>
              POS System Error
            </h2>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1rem',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              The POS system encountered an error. Please try again or return to the orders page.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                ↻ Try Again
              </button>
              <button
                onClick={this.handleReturnToOrders}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '2px solid #64748b',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                📋 Orders Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '2rem',
                textAlign: 'left',
                backgroundColor: '#0f1419',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  color: '#f59e0b',
                  fontWeight: 600 
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

export default PosErrorBoundary;
