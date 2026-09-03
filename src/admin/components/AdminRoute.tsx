import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../../components/common/Button';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--color-text-secondary)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p>Verifying admin credentials...</p>
      </div>
    );
  }

  // If unauthenticated, always redirect to login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If Supabase is not configured yet, show preview notice banner on top of dashboard
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <div style={{
          backgroundColor: 'rgba(232, 114, 42, 0.15)',
          borderBottom: '1px solid var(--color-primary)',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          color: 'var(--color-accent)',
          fontSize: '0.875rem',
        }}>
          ⚠️ <strong>Supabase Not Configured:</strong> Running in local preview mode. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable live database updates.
        </div>
        {children}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
      }}>
        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</span>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-error)' }}>Access Restricted</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          You are authenticated as <strong>{user.email}</strong>, but your account is not registered in the <code>admin_users</code> table.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          <Button variant="primary" href="/">Return to Website</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
