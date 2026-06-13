import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_MENU } from '../../utils/helpers';

export default function ProtectedRoute({ children, menuKey, allowedRoles }) {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace state={{ accessDenied: true }} />;
  }

  if (menuKey) {
    const allowed = ROLE_MENU[user.role] ?? [];
    if (!allowed.includes(menuKey)) {
      return <Navigate to="/" replace state={{ accessDenied: true }} />;
    }
  }

  return children;
}
