import { useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as manufacturingOrderApi from '../api/manufacturingOrderApi';
import { mapManufacturingOrderFromApi } from '../api/mappers';
import { showError } from '../utils/helpers';

export default function Manufacturing() {
  const { data, updateData, addAuditLog, syncStockFromBackend } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const finishedGoods = data.products.filter((p) => p.type === 'Finished Good');

  const resetForm = () => {
    setProductId('');
    setQuantity(1);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!productId || !quantity) {
      alert('Please select product and quantity');
      return;
    }
    try {
      const created = await manufacturingOrderApi.createManufacturingOrder({
        productId: Number(productId),
        quantity: Number(quantity),
      });
      const mapped = mapManufacturingOrderFromApi(created);
      updateData('manufacturingOrders', [...data.manufacturingOrders, mapped]);
      await syncStockFromBackend();
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to create manufacturing order');
    }
  };

  const advanceStatus = async (mo) => {
    try {
      if (mo.status === 'Draft') {
        const updated = await manufacturingOrderApi.startMO(mo.id);
        const mapped = mapManufacturingOrderFromApi(updated);
        updateData(
          'manufacturingOrders',
          data.manufacturingOrders.map((o) => (o.id === mapped.id ? mapped : o))
        );
        addAuditLog();
        return;
      }

      if (mo.status === 'In Progress') {
        const activeWO = mo.workOrders.find((wo) => wo.status === 'In Progress');
        if (activeWO) {
          const updated = await manufacturingOrderApi.completeWorkOrder(mo.id, activeWO.id);
          const mapped = mapManufacturingOrderFromApi(updated);
          updateData(
            'manufacturingOrders',
            data.manufacturingOrders.map((o) => (o.id === mapped.id ? mapped : o))
          );
          addAuditLog();
          return;
        }

        const allDone = mo.workOrders.every((wo) => wo.status === 'Done');
        if (allDone) {
          const updated = await manufacturingOrderApi.completeMO(mo.id);
          const mapped = mapManufacturingOrderFromApi(updated);
          updateData(
            'manufacturingOrders',
            data.manufacturingOrders.map((o) => (o.id === mapped.id ? mapped : o))
          );
          await syncStockFromBackend();
          addAuditLog();
        }
      }
    } catch (err) {
      showError(err, 'Failed to update manufacturing order');
    }
  };

  const getActionLabel = (mo) => {
    if (mo.status === 'Draft') return 'Start';
    if (mo.status === 'In Progress') {
      const activeWO = mo.workOrders.find((wo) => wo.status === 'In Progress');
      if (activeWO) return `Complete: ${activeWO.operationName}`;
      const allDone = mo.workOrders.every((wo) => wo.status === 'Done');
      if (allDone) return 'Complete MO';
    }
    return null;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Manufacturing Orders</h2>
          <p className="page-subtitle">Create and manage production orders</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New MO'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>Create Manufacturing Order</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Finished Product</label>
              <select className="form-control" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Select product</option>
                {finishedGoods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create MO
          </button>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>MO #</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Work Orders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.manufacturingOrders.map((mo) => (
              <tr key={mo.id}>
                <td>MO-{mo.id}</td>
                <td>{mo.productName}</td>
                <td>{mo.quantity}</td>
                <td><span className={`status-badge status-${mo.status.replace(/\s+/g, '-').toLowerCase()}`}>{mo.status}</span></td>
                <td>
                  <ul className="wo-list">
                    {mo.workOrders.map((wo) => (
                      <li key={wo.id}>
                        {wo.operationName} — <span className="wo-status">{wo.status}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="actions-cell">
                  {getActionLabel(mo) && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => advanceStatus(mo)}>
                      {getActionLabel(mo)}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.manufacturingOrders.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No manufacturing orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
