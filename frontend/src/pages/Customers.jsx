import { useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as customerApi from '../api/customerApi';
import { showError } from '../utils/helpers';

const emptyCustomer = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const { data, updateData, addAuditLog } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyCustomer });

  const resetForm = () => {
    setForm({ ...emptyCustomer });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (customer) => {
    setForm({
      name: customer.name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      alert('Name is required');
      return;
    }
    try {
      if (editingId) {
        const updated = await customerApi.updateCustomer(editingId, form);
        updateData(
          'customers',
          data.customers.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const created = await customerApi.createCustomer(form);
        updateData('customers', [...data.customers, created]);
      }
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await customerApi.deleteCustomer(id);
      updateData('customers', data.customers.filter((c) => c.id !== id));
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to delete customer');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p className="page-subtitle">Manage customer master data</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Customer'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Customer' : 'Create Customer'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
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
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email ?? '—'}</td>
                <td>{c.phone ?? '—'}</td>
                <td>{c.address ?? '—'}</td>
                <td className="actions-cell">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {data.customers.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
