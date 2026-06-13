import { useCallback, useState } from 'react';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';
import * as productApi from '../api/productApi';
import { mapProductFromApi, mapProductToApi } from '../api/mappers';
import { usePolling } from '../hooks/usePolling';
import { canWriteProducts, formatCurrency, showError } from '../utils/helpers';

const emptyProduct = {
  name: '',
  sku: '',
  type: 'Finished Good',
  typeRaw: 'FINISHED_GOOD',
  salesPrice: 0,
  costPrice: 0,
  onHand: 0,
  procurementStrategy: 'MTS',
  procureOnDemand: false,
  procurementType: '',
  defaultVendorId: '',
};

export default function Products() {
  const { data, updateData, addAuditLog, syncStockFromBackend } = useERP();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });

  const canWrite = canWriteProducts(user?.role);

  const poll = useCallback(async () => {
    try {
      await syncStockFromBackend();
    } catch {
      /* silent poll failure */
    }
  }, [syncStockFromBackend]);

  usePolling(poll, 4000);

  const resetForm = () => {
    setForm({ ...emptyProduct });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      ...product,
      typeRaw: product.type === 'Raw Material' ? 'RAW_MATERIAL' : 'FINISHED_GOOD',
      defaultVendorId: product.defaultVendorId ?? '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) {
      alert('Name and SKU are required');
      return;
    }
    try {
      const payload = mapProductToApi(form);
      if (editingId) {
        const updated = await productApi.updateProduct(editingId, payload);
        const mapped = mapProductFromApi(updated);
        updateData(
          'products',
          data.products.map((p) => (p.id === mapped.id ? mapped : p))
        );
      } else {
        const created = await productApi.createProduct(payload);
        const mapped = mapProductFromApi(created);
        updateData('products', [...data.products, mapped]);
      }
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      updateData('products', data.products.filter((p) => p.id !== id));
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to delete product');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="page-subtitle">
            {canWrite ? 'Manage product catalog' : 'View product catalog (read-only)'}
          </p>
        </div>
        {canWrite && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Product'}
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Product' : 'Create Product'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input className="form-control" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                className="form-control"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    typeRaw: e.target.value === 'Raw Material' ? 'RAW_MATERIAL' : 'FINISHED_GOOD',
                  })
                }
              >
                <option value="Finished Good">Finished Good</option>
                <option value="Raw Material">Raw Material</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sales Price</label>
              <input type="number" className="form-control" value={form.salesPrice} onChange={(e) => setForm({ ...form, salesPrice: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Cost Price</label>
              <input type="number" className="form-control" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            {!editingId && (
              <div className="form-group">
                <label>Initial Stock</label>
                <input type="number" className="form-control" value={form.onHand} onChange={(e) => setForm({ ...form, onHand: e.target.value })} />
              </div>
            )}
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            {editingId ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Sales Price</th>
              <th>Cost Price</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Free</th>
              {canWrite && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.type}</td>
                <td>{formatCurrency(p.salesPrice)}</td>
                <td>{formatCurrency(p.costPrice)}</td>
                <td>{p.onHand}</td>
                <td>{p.reserved}</td>
                <td>{p.freeToUse}</td>
                {canWrite && (
                  <td className="actions-cell">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
