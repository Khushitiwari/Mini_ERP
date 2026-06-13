import { useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as vendorApi from '../api/vendorApi';
import { showError } from '../utils/helpers';

const emptyVendor = { name: '', email: '', phone: '', address: '' };

export default function Vendors() {
  const { data, updateData, addAuditLog, refreshVendors } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyVendor });

  const resetForm = () => {
    setForm({ ...emptyVendor });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (vendor) => {
    setForm({
      name: vendor.name ?? '',
      email: vendor.email ?? '',
      phone: vendor.phone ?? '',
      address: vendor.address ?? '',
    });
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      alert('Name is required');
      return;
    }
    try {
      if (editingId) {
        await vendorApi.updateVendor(editingId, form);
        await refreshVendors();
      } else {
        await vendorApi.createVendor(form);
        await refreshVendors();
      }
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to save vendor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await vendorApi.deleteVendor(id);
      updateData('vendors', data.vendors.filter((v) => v.id !== id));
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to delete vendor');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Vendors</h2>
          <p className="page-subtitle">Manage vendor master data</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Vendor'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Vendor' : 'Create Vendor'}</h3>
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
            {data.vendors.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.email ?? '—'}</td>
                <td>{v.phone ?? '—'}</td>
                <td>{v.address ?? '—'}</td>
                <td className="actions-cell">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(v)}>Edit</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {data.vendors.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No vendors yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
