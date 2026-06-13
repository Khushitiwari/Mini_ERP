import { useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as purchaseOrderApi from '../api/purchaseOrderApi';
import { mapPurchaseOrderFromApi, toReceivePayload } from '../api/mappers';
import { formatCurrency, formatDate, showError } from '../utils/helpers';

const emptyItem = { productId: '', quantity: 1 };

export default function Purchase() {
  const { data, updateData, addAuditLog, syncStockFromBackend } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);

  const rawMaterials = data.products.filter((p) => p.type === 'Raw Material');

  const calcTotal = (lineItems) =>
    lineItems.reduce((sum, item) => {
      const product = data.products.find((p) => p.id === Number(item.productId));
      return sum + (Number(item.quantity) || 0) * (product?.costPrice ?? 0);
    }, 0);

  const handleAddLine = () => setItems([...items, { ...emptyItem }]);

  const handleRemoveLine = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const resetForm = () => {
    setVendorId('');
    setItems([{ ...emptyItem }]);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!vendorId || items.some((i) => !i.productId || !i.quantity)) {
      alert('Please select vendor and fill all line items');
      return;
    }
    try {
      const payload = {
        vendorId: Number(vendorId),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      };
      const created = await purchaseOrderApi.createPurchaseOrder(payload);
      const mapped = mapPurchaseOrderFromApi(created);
      if (!mapped.total) mapped.total = calcTotal(items);
      updateData('purchaseOrders', [...data.purchaseOrders, mapped]);
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to create purchase order');
    }
  };

  const advanceStatus = async (order) => {
    try {
      let updated;
      if (order.status === 'Draft') {
        updated = await purchaseOrderApi.confirmPurchaseOrder(order.id);
      } else if (order.status === 'Confirmed' || order.status === 'Partially Received') {
        const receiveItems = toReceivePayload(order.items);
        updated = await purchaseOrderApi.receivePurchaseOrder(order.id, receiveItems);
        await syncStockFromBackend();
      } else {
        return;
      }

      const mapped = mapPurchaseOrderFromApi(updated);
      updateData(
        'purchaseOrders',
        data.purchaseOrders.map((o) => (o.id === mapped.id ? mapped : o))
      );
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to update purchase order');
    }
  };

  const handleCancel = async (order) => {
    try {
      const updated = await purchaseOrderApi.cancelPurchaseOrder(order.id);
      const mapped = mapPurchaseOrderFromApi(updated);
      updateData(
        'purchaseOrders',
        data.purchaseOrders.map((o) => (o.id === mapped.id ? mapped : o))
      );
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to cancel purchase order');
    }
  };

  const getActionLabel = (status) => {
    if (status === 'Draft') return 'Confirm';
    if (status === 'Confirmed' || status === 'Partially Received') return 'Receive';
    return null;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Purchase Orders</h2>
          <p className="page-subtitle">Create, confirm, and receive purchase orders</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Purchase Order'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>Create Purchase Order</h3>
          <div className="form-group">
            <label>Vendor</label>
            <select className="form-control" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">Select vendor</option>
              {data.vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="line-items">
            <h4>Line Items</h4>
            {items.map((item, idx) => (
              <div key={idx} className="line-item-row">
                <select
                  className="form-control"
                  value={item.productId}
                  onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                >
                  <option value="">Select product</option>
                  {rawMaterials.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleRemoveLine(idx)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLine}>
              Add Line
            </button>
          </div>
          <p className="order-total">Total: {formatCurrency(calcTotal(items))}</p>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create Order
          </button>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.purchaseOrders.map((order) => (
              <tr key={order.id}>
                <td>PO-{order.id}</td>
                <td>{order.vendorName}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td><span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>{order.status}</span></td>
                <td>{formatCurrency(order.total)}</td>
                <td className="actions-cell">
                  {getActionLabel(order.status) && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => advanceStatus(order)}>
                      {getActionLabel(order.status)}
                    </button>
                  )}
                  {!['Fully Received', 'Cancelled'].includes(order.status) && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(order)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.purchaseOrders.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No purchase orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
