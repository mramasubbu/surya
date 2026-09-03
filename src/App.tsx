import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthContext';
import { AdminRoute } from './admin/components/AdminRoute';

const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileActionBar } from './components/layout/MobileActionBar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Menu } from './pages/Menu';
import { Gallery } from './pages/Gallery';
import { Reservations } from './pages/Reservations';
import { Contact } from './pages/Contact';

// Layout wrapper for customer-facing public pages
const PublicLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <MobileActionBar />
    </>
  );
};

const AdminLoadingFallback: React.FC = () => (
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
      width: '36px',
      height: '36px',
      border: '3px solid var(--color-border)',
      borderTopColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p>Loading Admin Console...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Customer Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Authentication */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminLogin />
              </Suspense>
            }
          />

          {/* Protected Admin Console */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
