import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useERP } from '../../context/ERPContext';
import { MENU_ITEMS, ROLE_MENU } from '../../utils/helpers';

export default function Layout() {
  const { user, logout } = useERP();
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
              end={item.path === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
