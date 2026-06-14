import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import * as authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../utils/helpers';
import BackgroundBeams from '../components/aceternity/BackgroundBeams';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page relative overflow-hidden">
      <BackgroundBeams />
      <Card className="login-card relative z-10 !shadow-xl" sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <h2 className="text-2xl font-bold text-center mb-1">Shiv Furniture Works</h2>
          <p className="login-subtitle text-center mb-6">Sign in to Mini ERP</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            {error && <p className="form-error">{error}</p>}
            <Button type="submit" variant="contained" fullWidth disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
        </CardContent>
      </Card>
    </div>
  );
}
