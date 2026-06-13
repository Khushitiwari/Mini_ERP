import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { usePolling } from '../hooks/usePolling';
import { BentoGrid, BentoGridItem } from '../components/aceternity/BentoGrid';

export default function Dashboard() {
  const { data, refreshDashboard } = useERP();
  const location = useLocation();
  const summary = data.dashboard ?? {};
  const accessDenied = location.state?.accessDenied;

  useEffect(() => {
    if (accessDenied) {
      window.history.replaceState({}, document.title);
    }
  }, [accessDenied]);

  const poll = useCallback(async () => {
    try {
      await refreshDashboard();
    } catch {
      /* silent poll failure */
    }
  }, [refreshDashboard]);

  usePolling(poll, 4000);

  const cards = [
    { label: 'Total Sales Orders', value: summary.totalSalesOrders ?? 0, icon: <ClipboardList size={24} /> },
    { label: 'Pending Deliveries', value: summary.pendingDeliveries ?? 0, icon: <Clock size={24} /> },
    { label: 'MO In Progress', value: summary.manufacturingOrdersInProgress ?? 0, icon: <Package size={24} /> },
    { label: 'Delayed Orders', value: summary.delayedOrders ?? 0, icon: <AlertTriangle size={24} /> },
    { label: 'Total Purchase Orders', value: summary.totalPurchaseOrders ?? 0, icon: <ClipboardList size={24} /> },
    { label: 'Partial Receipts', value: summary.partialReceipts ?? 0, icon: <CheckCircle size={24} /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Overview of operations (updates every 4s)</p>
      </div>
      {accessDenied && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Access denied — you do not have permission to view that page.
        </Alert>
      )}
      <BentoGrid>
        {cards.map((card) => (
          <BentoGridItem
            key={card.label}
            title={card.label}
            description={String(card.value)}
            icon={card.icon}
          />
        ))}
      </BentoGrid>
    </div>
  );
}
