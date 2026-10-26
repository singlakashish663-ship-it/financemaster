import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/globals.css';

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

// Global error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('React Error:', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#06041a', color: '#f8fafc', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '800px', width: '100%', background: '#12103a',
            padding: '2rem', borderRadius: '12px',
            border: '1px solid rgba(244,63,94,0.5)'
          }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '1rem', fontSize: '1.2rem' }}>
              ⚠️ App Crashed — Error Details:
            </h2>
            <div style={{ background: '#1e1b4b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ color: '#fbbf24', margin: 0, fontWeight: 'bold' }}>
                {this.state.error?.message || String(this.state.error)}
              </p>
            </div>
            <pre style={{
              color: '#94a3b8', whiteSpace: 'pre-wrap', fontSize: '11px',
              maxHeight: '300px', overflow: 'auto', background: '#0f0c29',
              padding: '1rem', borderRadius: '8px'
            }}>
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem', padding: '0.5rem 1.5rem',
                background: '#7c3aed', color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12103a',
            color: '#f8fafc',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#06041a' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#06041a' } },
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </ErrorBoundary>
);
