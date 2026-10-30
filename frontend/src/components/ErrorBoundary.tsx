import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base, #F5F5F7)',
          padding: 24,
          fontFamily: "'Inter', sans-serif",
          color: '#1D1D1F',
        }}>
          <div style={{
            maxWidth: 520,
            width: '100%',
            background: '#ffffff',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <AlertTriangle size={30} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.5 }}>
              The application encountered an unexpected display error. You can reload the page or reset the local cache.
            </p>

            {this.state.error && (
              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 12,
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#DC2626',
                textAlign: 'left',
                maxHeight: 120,
                overflowY: 'auto',
                marginBottom: 24,
                wordBreak: 'break-word',
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#0066CC',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Home size={16} />
                Reset & Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
