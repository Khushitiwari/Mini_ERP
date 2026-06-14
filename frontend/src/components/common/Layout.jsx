import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useAuth } from '../../context/AuthContext';
import { MENU_ITEMS, ROLE_MENU } from '../../utils/helpers';
import AnimatedTooltip from '../aceternity/AnimatedTooltip';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allowedKeys = ROLE_MENU[user?.role] ?? [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Shiv Furniture</h1>
          <span>Mini ERP</span>
        </div>
        <nav className="sidebar-nav">
          {MENU_ITEMS.filter((item) => allowedKeys.includes(item.key)).map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <AnimatedTooltip content={`${user?.name} — ${user?.role}`}>
            <div className="user-info cursor-default">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </AnimatedTooltip>
          <Button variant="outlined" size="small" color="inherit" onClick={handleLogout} sx={{ mt: 1 }}>
            Logout
          </Button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
