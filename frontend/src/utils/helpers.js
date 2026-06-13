export const showError = (err, fallback = 'Something went wrong') => {
  const message = err?.response?.data?.message ?? err?.message ?? fallback;
  alert(message);
};

export const ROLE_MENU = {
  ADMIN: ['dashboard', 'sales', 'purchase', 'manufacturing', 'bom', 'inventory', 'products', 'customers', 'vendors', 'audit'],
  SALES: ['dashboard', 'sales'],
  PURCHASE: ['dashboard', 'purchase'],
  MANUFACTURING: ['dashboard', 'manufacturing', 'bom'],
  INVENTORY_MANAGER: ['dashboard', 'inventory'],
  OWNER: ['dashboard', 'products'],
};

export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'sales', label: 'Sales', path: '/sales' },
  { key: 'purchase', label: 'Purchase', path: '/purchase' },
  { key: 'manufacturing', label: 'Manufacturing', path: '/manufacturing' },
  { key: 'bom', label: 'BoM', path: '/bom' },
  { key: 'inventory', label: 'Inventory', path: '/inventory' },
  { key: 'products', label: 'Products', path: '/products' },
  { key: 'customers', label: 'Customers', path: '/customers' },
  { key: 'vendors', label: 'Vendors', path: '/vendors' },
  { key: 'audit', label: 'Audit Logs', path: '/audit' },
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
