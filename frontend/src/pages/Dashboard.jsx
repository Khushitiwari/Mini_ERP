import { useCallback } from 'react';
import { useERP } from '../context/ERPContext';
import { usePolling } from '../hooks/usePolling';

export default function Dashboard() {
  const { data, refreshDashboard } = useERP();
  const summary = data.dashboard ?? {};

  const poll = useCallback(async () => {
    try {
      await refreshDashboard();
    } catch {
      /* silent poll failure */
    }
  }, [refreshDashboard]);

  usePolling(poll, 4000);

  const cards = [
    { label: 'Total Sales Orders', value: summary.totalSalesOrders ?? 0 },
    { label: 'Pending Deliveries', value: summary.pendingDeliveries ?? 0 },
    { label: 'MO In Progress', value: summary.manufacturingOrdersInProgress ?? 0 },
    { label: 'Delayed Orders', value: summary.delayedOrders ?? 0 },
    { label: 'Total Purchase Orders', value: summary.totalPurchaseOrders ?? 0 },
    { label: 'Partial Receipts', value: summary.partialReceipts ?? 0 },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Overview of operations (updates every 4s)</p>
      </div>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
