import { useCallback, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useERP } from '../context/ERPContext';
import * as stockApi from '../api/stockApi';
import StockChip from '../components/common/StockChip';
import { formatDate, showError } from '../utils/helpers';

export default function Inventory() {
  const { data, syncStockFromBackend } = useERP();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [adjustQty, setAdjustQty] = useState('');

  const loadLedger = useCallback(async (productId) => {
    const entries = await stockApi.getStockLedger(productId);
    const product = data.products.find((p) => p.id === productId);
    return entries.map((e) => ({
      id: e.id,
      productId: e.productId,
      productName: product?.name ?? '',
      changeQty: e.changeQty,
      reason: e.reason,
      referenceId: e.referenceId,
      referenceType: e.referenceType,
      timestamp: e.timestamp,
    }));
  }, [data.products]);

  const openProductDrawer = async (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
    try {
      const mapped = await loadLedger(product.id);
      setLedger(mapped);
    } catch (err) {
      showError(err, 'Failed to load ledger');
    }
  };

  const handleAdjust = async () => {
    if (!selectedProduct || !adjustQty) {
      alert('Enter adjustment quantity');
      return;
    }
    try {
      await stockApi.adjustStock(selectedProduct.id, {
        changeQty: Number(adjustQty),
        reason: 'MANUAL_ADJUSTMENT',
      });
      await syncStockFromBackend();
      const mapped = await loadLedger(selectedProduct.id);
      setLedger(mapped);
      setAdjustQty('');
    } catch (err) {
      showError(err, 'Failed to adjust stock');
    }
  };

  const sparklineData = useMemo(() => {
    if (!ledger.length) return [];
    const sorted = [...ledger].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    let running = 0;
    return sorted.map((entry) => {
      running += entry.changeQty;
      return {
        date: formatDate(entry.timestamp),
        level: running,
      };
    });
  }, [ledger]);

  const columns = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      renderCell: ({ row }) => (
        <button
          type="button"
          className="text-indigo-600 hover:underline font-medium bg-transparent border-0 cursor-pointer"
          onClick={() => openProductDrawer(row)}
        >
          {row.name}
        </button>
      ),
    },
    { field: 'sku', headerName: 'SKU', width: 110 },
    { field: 'type', headerName: 'Type', width: 130 },
    {
      field: 'onHand',
      headerName: 'On Hand',
      width: 110,
      renderCell: ({ row }) => <StockChip qty={row.onHand} label="On Hand" />,
    },
    { field: 'reserved', headerName: 'Reserved', width: 100 },
    {
      field: 'freeToUse',
      headerName: 'Free to Use',
      width: 130,
      renderCell: ({ row }) => <StockChip qty={row.freeToUse} label="Free" />,
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Inventory & Stock</h2>
        <p className="page-subtitle">Stock levels and movement history (updates every 4s)</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataGrid
          rows={data.products}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </div>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="w-[480px] max-w-[90vw] p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{selectedProduct?.name} — Stock Ledger</h3>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <X size={18} />
            </IconButton>
          </div>

          {selectedProduct && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <StockChip qty={selectedProduct.onHand} label="On Hand" />
              <StockChip qty={selectedProduct.reserved} label="Reserved" />
              <StockChip qty={selectedProduct.freeToUse} label="Free" />
            </div>
          )}

          {sparklineData.length > 0 && (
            <div className="mb-6 h-32">
              <p className="text-xs text-slate-500 mb-1">Stock level over time</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="level" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex gap-2 mb-4 items-end">
            <TextField
              type="number"
              size="small"
              label="Manual Adjustment (+/-)"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. 10 or -5"
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={handleAdjust}>Adjust</Button>
          </div>

          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Change</th>
                <th>Reason</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.timestamp)}</td>
                  <td className={entry.changeQty >= 0 ? 'text-success' : 'text-danger'}>
                    {entry.changeQty >= 0 ? '+' : ''}{entry.changeQty}
                  </td>
                  <td>{entry.reason}</td>
                  <td>{entry.referenceType ? `${entry.referenceType} #${entry.referenceId}` : '—'}</td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr><td colSpan="4" className="empty-row">No ledger entries</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Drawer>
    </div>
  );
}
