export const showError = (err, fallback = 'Something went wrong') => {
  const message = err?.response?.data?.message ?? err?.message ?? fallback;
  alert(message);
};

export const USER_ROLES = [
  'ADMIN',
  'SALES',
  'PURCHASE',
  'MANUFACTURING',
  'INVENTORY_MANAGER',
  'OWNER',
];

export const ROLE_MENU = {
  ADMIN: [
    'dashboard',
    'sales',
    'purchase',
    'manufacturing',
    'bom',
    'inventory',
    'products',
    'customers',
    'vendors',
    'audit',
    'users',
  ],
  SALES: ['dashboard', 'sales', 'customers'],
  PURCHASE: ['dashboard', 'purchase', 'vendors'],
  MANUFACTURING: ['dashboard', 'manufacturing', 'bom'],
  INVENTORY_MANAGER: ['dashboard', 'inventory'],
  OWNER: ['dashboard', 'products'],
};

export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'sales', label: 'Sales', path: '/sales-orders' },
  { key: 'purchase', label: 'Purchase', path: '/purchase' },
  { key: 'manufacturing', label: 'Manufacturing', path: '/manufacturing' },
  { key: 'bom', label: 'BoM', path: '/bom' },
  { key: 'inventory', label: 'Inventory', path: '/inventory' },
  { key: 'products', label: 'Products', path: '/products' },
  { key: 'customers', label: 'Customers', path: '/customers' },
  { key: 'vendors', label: 'Vendors', path: '/vendors' },
  { key: 'audit', label: 'Audit Logs', path: '/audit-logs' },
  { key: 'users', label: 'User Management', path: '/users' },
];

export const DEMO_ACCOUNTS = [
  { email: 'admin@shiv.com', role: 'ADMIN' },
  { email: 'sales@shiv.com', role: 'SALES' },
  { email: 'purchase@shiv.com', role: 'PURCHASE' },
  { email: 'manufacturing@shiv.com', role: 'MANUFACTURING' },
  { email: 'inventory@shiv.com', role: 'INVENTORY_MANAGER' },
  { email: 'owner@shiv.com', role: 'OWNER' },
];

export const canWriteProducts = (role) => ['ADMIN'].includes(role);

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;
