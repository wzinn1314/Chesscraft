import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    try {
      const errorLog = JSON.parse(localStorage.getItem('chesscraft_error_log') || '[]');
      errorLog.push(errorData);
      if (errorLog.length > 10) {
        errorLog.shift();
      }
      localStorage.setItem('chesscraft_error_log', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#121110',
          color: '#f3efe6',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '480px',
            padding: '32px',
            backgroundColor: '#1c1b18',
            borderRadius: '16px',
            border: '1px solid #2d2b27',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Não foi possível carregar esta tela</div>
            <h2 style={{ color: '#e58e26', margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>
              Algo deu errado
            </h2>
            <p style={{ color: '#bab4ab', margin: '0 0 24px', fontSize: '15px', lineHeight: '1.5' }}>
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: '#121110',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '13px',
                color: '#78736c',
              }}>
                <summary style={{ cursor: 'pointer', color: '#e58e26', fontWeight: 600, marginBottom: '8px' }}>
                  Detalhes do erro
                </summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#e58e26',
                color: '#161512',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                marginRight: '8px',
              }}
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'transparent',
                color: '#bab4ab',
                border: '1px solid #2d2b27',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
