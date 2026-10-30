import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DatasetsPage from './pages/DatasetsPage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import QueriesPage from './pages/QueriesPage';
import AnomaliesPage from './pages/AnomaliesPage';
import MetricsPage from './pages/MetricsPage';
import AuthPage from './pages/AuthPage';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './store/AuthContext';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, user, loading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-base, #F5F5F7)',
        color: 'var(--text-primary, #1D1D1F)',
        gap: 16
      }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(0, 102, 204, 0.15)',
            borderTopColor: '#0066CC',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, color: 'var(--text-secondary, #86868B)' }}>
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!session && !user && !isGuest) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/datasets" element={<DatasetsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/queries" element={<QueriesPage />} />
              <Route path="/anomalies" element={<AnomaliesPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
            </Route>
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
