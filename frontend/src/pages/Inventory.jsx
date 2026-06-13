import { useCallback, useEffect, useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as stockApi from '../api/stockApi';
import { usePolling } from '../hooks/usePolling';
import { formatDate, showError } from '../utils/helpers';

export default function Inventory() {
  const { data, updateData, syncStockFromBackend, refreshStockLedger } = useERP();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [ledger, setLedger] = useState([]);

  const poll = useCallback(async () => {
    try {
      await syncStockFromBackend();
    } catch {
      /* silent poll failure */
    }
  }, [syncStockFromBackend]);

  usePolling(poll, 4000);

  useEffect(() => {
    if (!selectedProductId) {
      setLedger([]);
      return;
    }
    stockApi
      .getStockLedger(Number(selectedProductId))
      .then((entries) => {
        const product = data.products.find((p) => p.id === Number(selectedProductId));
        const mapped = entries.map((e) => ({
          id: e.id,
          productId: e.productId,
          productName: product?.name ?? '',
          changeQty: e.changeQty,
          reason: e.reason,
          referenceId: e.referenceId,
          referenceType: e.referenceType,
          timestamp: e.timestamp,
        }));
        setLedger(mapped);
        updateData('stockLedger', mapped);
      })
      .catch((err) => showError(err, 'Failed to load ledger'));
  }, [selectedProductId, data.products, updateData]);

  const handleAdjust = async () => {
    if (!selectedProductId || !adjustQty) {
      alert('Select product and enter adjustment quantity');
      return;
    }
    try {
      await stockApi.adjustStock(Number(selectedProductId), {
        changeQty: Number(adjustQty),
        reason: 'MANUAL_ADJUSTMENT',
      });
      await syncStockFromBackend();
      await refreshStockLedger(Number(selectedProductId));
      const entries = await stockApi.getStockLedger(Number(selectedProductId));
      const product = data.products.find((p) => p.id === Number(selectedProductId));
      const mapped = entries.map((e) => ({
        id: e.id,
        productId: e.productId,
        productName: product?.name ?? '',
        changeQty: e.changeQty,
        reason: e.reason,
        referenceId: e.referenceId,
        referenceType: e.referenceType,
        timestamp: e.timestamp,
      }));
      setLedger(mapped);
      setAdjustQty('');
    } catch (err) {
      showError(err, 'Failed to adjust stock');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Inventory & Stock</h2>
        <p className="page-subtitle">Stock levels and movement history (updates every 4s)</p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Type</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Free to Use</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.type}</td>
                <td>{p.onHand}</td>
                <td>{p.reserved}</td>
                <td>{p.freeToUse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card form-card">
        <h3>Stock Ledger</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Product</label>
            <select className="form-control" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
              <option value="">Select product</option>
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Manual Adjustment (+/-)</label>
            <input
              type="number"
              className="form-control"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. 10 or -5"
            />
          </div>
          <div className="form-group form-group-btn">
            <label>&nbsp;</label>
            <button type="button" className="btn btn-primary" onClick={handleAdjust}>
              Adjust Stock
            </button>
          </div>
        </div>

        {selectedProductId && (
          <table className="data-table">
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
        )}
      </div>
    </div>
  );
}
