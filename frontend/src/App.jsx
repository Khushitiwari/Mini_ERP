import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import SalesOrderDetail from './pages/SalesOrderDetail';
import Purchase from './pages/Purchase';
import Manufacturing from './pages/Manufacturing';
import ManufacturingOrderDetail from './pages/ManufacturingOrderDetail';
import BoM from './pages/BoM';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
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
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
      />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ProtectedRoute menuKey="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="sales-orders" element={<ProtectedRoute menuKey="sales"><Sales /></ProtectedRoute>} />
        <Route path="sales-orders/:id" element={<ProtectedRoute menuKey="sales"><SalesOrderDetail /></ProtectedRoute>} />
        <Route path="sales" element={<Navigate to="/sales-orders" replace />} />
        <Route path="purchase" element={<ProtectedRoute menuKey="purchase"><Purchase /></ProtectedRoute>} />
        <Route path="manufacturing" element={<ProtectedRoute menuKey="manufacturing"><Manufacturing /></ProtectedRoute>} />
        <Route
          path="manufacturing-orders/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANUFACTURING', 'INVENTORY_MANAGER', 'OWNER']}>
              <ManufacturingOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route path="bom" element={<ProtectedRoute menuKey="bom"><BoM /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute menuKey="inventory"><Inventory /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute menuKey="products"><Products /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute menuKey="customers"><Customers /></ProtectedRoute>} />
        <Route path="vendors" element={<ProtectedRoute menuKey="vendors"><Vendors /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute menuKey="audit"><AuditLogs /></ProtectedRoute>} />
        <Route path="audit" element={<Navigate to="/audit-logs" replace />} />
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
