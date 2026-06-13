import { Navigate } from 'react-router-dom';
import { useERP } from '../../context/ERPContext';
import { ROLE_MENU } from '../../utils/helpers';

export default function ProtectedRoute({ children, menuKey }) {
  const { user } = useERP();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (menuKey) {
    const allowed = ROLE_MENU[user.role] ?? [];
    if (!allowed.includes(menuKey)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
