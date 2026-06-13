import { useEffect, useState } from 'react';
import * as authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { formatDate, showError, USER_ROLES } from '../utils/helpers';

const emptyForm = { name: '', email: '', password: '', role: 'SALES' };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await authApi.getAllUsers();
      setUsers(list);
    } catch (err) {
      showError(err, 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      alert('Name, email, and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await authApi.createUser(form);
      setUsers((prev) => [...prev, created]);
      setForm({ ...emptyForm });
      setShowModal(false);
    } catch (err) {
      showError(err, 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const updated = await authApi.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      showError(err, 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await authApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      showError(err, 'Failed to delete user');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p className="page-subtitle">Create and manage employee accounts (Admin only)</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="form-control form-control-sm"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {USER_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={u.id === currentUser?.id}
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="empty-row">No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add User</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={submitting} onClick={handleCreate}>
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
