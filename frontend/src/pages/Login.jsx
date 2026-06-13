import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../context/ERPContext';
import { showError } from '../utils/helpers';

export default function Login() {
  const { login, user, restoreSession } = useERP();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@shiv.com');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    restoreSession()
      .then((ok) => {
        if (ok) navigate('/');
      })
      .finally(() => setChecking(false));
  }, [restoreSession, navigate]);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      showError(err, 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="login-hints">
          <p>Demo: admin@shiv.com / password123</p>
        </div>
      </div>
    </div>
  );
}
