import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import * as authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../utils/helpers';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Shiv Furniture Works</h2>
        <p className="login-subtitle">Sign in to Mini ERP</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-hints">
          <p><strong>Demo Accounts</strong> (password: password123)</p>
          {DEMO_ACCOUNTS.map((account) => (
            <p key={account.email}>
              {account.email} — {account.role}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
