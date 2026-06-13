import { useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as salesOrderApi from '../api/salesOrderApi';
import { mapSalesOrderFromApi, toDeliverPayload } from '../api/mappers';
import { formatCurrency, formatDate, showError } from '../utils/helpers';

const emptyItem = { productId: '', quantity: 1 };

export default function Sales() {
  const { data, updateData, addAuditLog, syncStockFromBackend } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);

  const finishedGoods = data.products.filter((p) => p.type === 'Finished Good');

  const calcTotal = (lineItems) =>
    lineItems.reduce((sum, item) => {
      const product = data.products.find((p) => p.id === Number(item.productId));
      return sum + (Number(item.quantity) || 0) * (product?.salesPrice ?? 0);
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
    setCustomerId('');
    setItems([{ ...emptyItem }]);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!customerId || items.some((i) => !i.productId || !i.quantity)) {
      alert('Please select customer and fill all line items');
      return;
    }
    try {
      const payload = {
        customerId: Number(customerId),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      };
      const created = await salesOrderApi.createSalesOrder(payload);
      const mapped = mapSalesOrderFromApi(created);
      if (!mapped.total) mapped.total = calcTotal(items);
      updateData('salesOrders', [...data.salesOrders, mapped]);
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to create sales order');
    }
  };

  const advanceStatus = async (order) => {
    try {
      let updated;
      if (order.status === 'Draft') {
        updated = await salesOrderApi.confirmSalesOrder(order.id);
        await syncStockFromBackend();
      } else if (order.status === 'Confirmed' || order.status === 'Partially Delivered') {
        const deliverItems = toDeliverPayload(order.items);
        updated = await salesOrderApi.deliverSalesOrder(order.id, deliverItems);
        await syncStockFromBackend();
      } else {
        return;
      }

      const mapped = mapSalesOrderFromApi(updated);
      updateData(
        'salesOrders',
        data.salesOrders.map((o) => (o.id === mapped.id ? mapped : o))
      );
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to update sales order');
    }
  };

  const handleCancel = async (order) => {
    try {
      const updated = await salesOrderApi.cancelSalesOrder(order.id);
      const mapped = mapSalesOrderFromApi(updated);
      updateData(
        'salesOrders',
        data.salesOrders.map((o) => (o.id === mapped.id ? mapped : o))
      );
      await syncStockFromBackend();
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to cancel sales order');
    }
  };

  const getActionLabel = (status) => {
    if (status === 'Draft') return 'Confirm';
    if (status === 'Confirmed' || status === 'Partially Delivered') return 'Deliver';
    return null;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Sales Orders</h2>
          <p className="page-subtitle">Create, confirm, and deliver sales orders</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Sales Order'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>Create Sales Order</h3>
          <div className="form-group">
            <label>Customer</label>
            <select className="form-control" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer</option>
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
                  {finishedGoods.map((p) => (
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
              <th>SO #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.salesOrders.map((order) => (
              <tr key={order.id}>
                <td>SO-{order.id}</td>
                <td>{order.customerName}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td><span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>{order.status}</span></td>
                <td>{formatCurrency(order.total)}</td>
                <td className="actions-cell">
                  {getActionLabel(order.status) && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => advanceStatus(order)}>
                      {getActionLabel(order.status)}
                    </button>
                  )}
                  {!['Fully Delivered', 'Cancelled'].includes(order.status) && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(order)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.salesOrders.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No sales orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
