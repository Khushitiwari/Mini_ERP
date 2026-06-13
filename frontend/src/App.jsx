import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useERP } from './context/ERPContext';
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
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import AuditLogs from './pages/AuditLogs';

function AppRoutes() {
  const { user, restoreSession } = useERP();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      restoreSession().catch(() => navigate('/login'));
    }
  }, [user, restoreSession, navigate]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
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
        <Route path="customers" element={<ProtectedRoute menuKey="customers"><Customers /></ProtectedRoute>} />
        <Route path="vendors" element={<ProtectedRoute menuKey="vendors"><Vendors /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute menuKey="audit"><AuditLogs /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
