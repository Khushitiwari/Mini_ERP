import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchase from './pages/Purchase';
import Manufacturing from './pages/Manufacturing';
import BoM from './pages/BoM';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';

export default function App() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProtectedRoute menuKey="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="sales" element={<ProtectedRoute menuKey="sales"><Sales /></ProtectedRoute>} />
        <Route path="purchase" element={<ProtectedRoute menuKey="purchase"><Purchase /></ProtectedRoute>} />
        <Route path="manufacturing" element={<ProtectedRoute menuKey="manufacturing"><Manufacturing /></ProtectedRoute>} />
        <Route path="bom" element={<ProtectedRoute menuKey="bom"><BoM /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute menuKey="inventory"><Inventory /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute menuKey="products"><Products /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute menuKey="audit"><AuditLogs /></ProtectedRoute>} />
        <Route
          path="users"
          element={
            <ProtectedRoute menuKey="users" allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
