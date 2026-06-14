import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useERP } from '../context/ERPContext';
import { usePolling } from '../hooks/usePolling';
import { BentoGrid, BentoGridItem } from '../components/aceternity/BentoGrid';
import * as stockApi from '../api/stockApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { data, refreshDashboard } = useERP();
  const location = useLocation();
  const summary = data.dashboard ?? {};
  const [stockMovements, setStockMovements] = useState([]);
  const accessDenied = location.state?.accessDenied;

  useEffect(() => {
    if (accessDenied) {
      window.history.replaceState({}, document.title);
    }
  }, [accessDenied]);

  const fetchStockMovements = useCallback(async () => {
    try {
      const movements = await stockApi.getStockMovementSummary(30);
      setStockMovements(movements);
    } catch {
      /* silent fetch failure */
    }
  }, []);

  useEffect(() => {
    fetchStockMovements();
  }, [fetchStockMovements]);

  const poll = useCallback(async () => {
    try {
      await Promise.all([refreshDashboard(), fetchStockMovements()]);
    } catch {
      /* silent poll failure */
    }
  }, [refreshDashboard, fetchStockMovements]);

  usePolling(poll, 4000);

  const cards = [
    { label: 'Total Sales Orders', value: summary.totalSalesOrders ?? 0, icon: <ClipboardList size={24} /> },
    { label: 'Pending Deliveries', value: summary.pendingDeliveries ?? 0, icon: <Clock size={24} /> },
    { label: 'MO In Progress', value: summary.manufacturingOrdersInProgress ?? 0, icon: <Package size={24} /> },
    { label: 'Delayed Orders', value: summary.delayedOrders ?? 0, icon: <AlertTriangle size={24} /> },
    { label: 'Total Purchase Orders', value: summary.totalPurchaseOrders ?? 0, icon: <ClipboardList size={24} /> },
    { label: 'Partial Receipts', value: summary.partialReceipts ?? 0, icon: <CheckCircle size={24} /> },
  ];

  const products = data.products || [];

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

      <Grid container spacing={3} mt={1} alignItems="stretch">
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: '16px !important' }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Sales Orders by Status
              </Typography>
              <Box sx={{ flex: 1, position: 'relative', minHeight: 280 }}>
                <Doughnut
                  data={{
                    labels: ['Draft', 'Confirmed', 'Partially Delivered', 'Fully Delivered', 'Cancelled'],
                    datasets: [{
                      data: [
                        summary?.salesByStatus?.DRAFT || 0,
                        summary?.salesByStatus?.CONFIRMED || 0,
                        summary?.salesByStatus?.PARTIALLY_DELIVERED || 0,
                        summary?.salesByStatus?.FULLY_DELIVERED || 0,
                        summary?.salesByStatus?.CANCELLED || 0,
                      ],
                      backgroundColor: ['#94a3b8', '#6366f1', '#f59e0b', '#10b981', '#ef4444'],
                      borderWidth: 0,
                      hoverOffset: 8,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: '16px !important' }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Current Stock Levels
              </Typography>
              <Box sx={{ flex: 1, position: 'relative', minHeight: 320 }}>
                <Bar
                  data={{
                    labels: products.map((p) => (p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name)),
                    datasets: [
                      {
                        label: 'On Hand',
                        data: products.map((p) => p.onHandQty ?? p.onHand ?? 0),
                        backgroundColor: '#6366f1',
                        borderRadius: 4,
                      },
                      {
                        label: 'Reserved',
                        data: products.map((p) => p.reservedQty ?? p.reserved ?? 0),
                        backgroundColor: '#f59e0b',
                        borderRadius: 4,
                      },
                      {
                        label: 'Free to Use',
                        data: products.map((p) => (p.onHandQty ?? p.onHand ?? 0) - (p.reservedQty ?? p.reserved ?? 0)),
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { size: 12 } } } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: '16px !important' }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Manufacturing Orders
              </Typography>
              <Box sx={{ flex: 1, position: 'relative', minHeight: 280 }}>
                <Bar
                  data={{
                    labels: ['Draft', 'In Progress', 'Completed', 'Cancelled'],
                    datasets: [{
                      label: 'Orders',
                      data: [
                        summary?.moByStatus?.DRAFT || 0,
                        summary?.moByStatus?.IN_PROGRESS || 0,
                        summary?.moByStatus?.COMPLETED || 0,
                        summary?.moByStatus?.CANCELLED || 0,
                      ],
                      backgroundColor: ['#94a3b8', '#6366f1', '#10b981', '#ef4444'],
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={{
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
                      y: { grid: { display: false } },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: '16px !important' }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Stock Movement — Last 30 Days
              </Typography>
              <Box sx={{ flex: 1, position: 'relative', minHeight: 300 }}>
                <Line
                  data={{
                    labels: stockMovements.map((m) => {
                      const d = new Date(m.date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }),
                    datasets: [
                      {
                        label: 'Stock In',
                        data: stockMovements.map((m) => m.totalIn),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                      },
                      {
                        label: 'Stock Out',
                        data: stockMovements.map((m) => m.totalOut),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: { legend: { position: 'top', labels: { usePointStyle: true } } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
