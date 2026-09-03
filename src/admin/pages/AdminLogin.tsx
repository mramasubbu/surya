import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../components/common/Button';
import './AdminLogin.css';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMessage(error.message);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <img src="/images/branding/logo.svg" alt="Surya Logo" width="36" height="36" />
          </div>
          <h1>Surya Admin Portal</h1>
          <p>Sign in with your administrative Supabase credentials</p>
        </div>

        {errorMessage && <div className="admin-login-error">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              type="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@surya.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="admin-back-link">
            ← Back to Surya Restaurant Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
