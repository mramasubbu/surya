import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../components/common/Button';
import './AdminLayout.css';

export type AdminTab =
  | 'overview'
  | 'orders'
  | 'categories'
  | 'menu'
  | 'offers'
  | 'bookings'
  | 'messages'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  pendingOrdersCount?: number;
  pendingBookingsCount?: number;
  unreadMessagesCount?: number;
  children: React.ReactNode;
}

interface NavItem {
  id: AdminTab;
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const SIDEBAR_STORAGE_KEY = 'surya_admin_sidebar_collapsed';

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  pendingOrdersCount = 0,
  pendingBookingsCount = 0,
  unreadMessagesCount = 0,
  children,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop sidebar collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Mobile sidebar drawer open/close
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore quota/storage errors
      }
      return next;
    });
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const navItems: NavItem[] = [
    {
      id: 'overview',
      path: '/admin/overview',
      label: 'Overview',
      icon: '📊',
    },
    {
      id: 'orders',
      path: '/admin/orders',
      label: 'Orders',
      icon: '🛵',
      badge: pendingOrdersCount,
    },
    {
      id: 'categories',
      path: '/admin/categories',
      label: 'Categories',
      icon: '📁',
    },
    {
      id: 'menu',
      path: '/admin/menu',
      label: 'Menu Items',
      icon: '🍛',
    },
    {
      id: 'offers',
      path: '/admin/offers',
      label: 'Offers',
      icon: '🏷️',
    },
    {
      id: 'bookings',
      path: '/admin/bookings',
      label: 'Bookings',
      icon: '📅',
      badge: pendingBookingsCount,
    },
    {
      id: 'messages',
      path: '/admin/messages',
      label: 'Inquiries',
      icon: '✉️',
      badge: unreadMessagesCount,
    },
    {
      id: 'settings',
      path: '/admin/settings',
      label: 'Settings',
      icon: '⚙️',
    },
  ];

  const currentItem = navItems.find((item) => item.id === currentTab) || navItems[0];

  return (
    <div className={`admin-container ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===================== LEFT SIDEBAR ===================== */}
      <aside
        className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Admin Navigation Sidebar"
      >
        {/* Sidebar Brand Header */}
        <div className="admin-sidebar-header">
          <Link to="/admin/overview" className="admin-sidebar-brand">
            <img src="/images/branding/logo.svg" alt="Surya Logo" className="admin-sidebar-logo" />
            {!isCollapsed && (
              <div className="admin-sidebar-brand-text">
                <h2>Surya</h2>
                <span>Management Console</span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button in Header */}
          <button
            type="button"
            className="admin-sidebar-toggle-btn desktop-only"
            onClick={toggleCollapsed}
            title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="toggle-icon">{isCollapsed ? '▶' : '◀'}</span>
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="admin-sidebar-close-btn mobile-only"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation sidebar"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="admin-sidebar-nav" role="navigation">
          <div className="admin-sidebar-section-title">
            {!isCollapsed ? 'MAIN MENU' : '•••'}
          </div>

          <ul className="admin-nav-list">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <li key={item.id} className="admin-nav-item">
                  <Link
                    to={item.path}
                    className={`admin-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (onSelectTab) onSelectTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="admin-nav-icon">{item.icon}</span>
                    {!isCollapsed && <span className="admin-nav-label">{item.label}</span>}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className={`admin-badge-count ${isCollapsed ? 'mini-badge' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          {/* User Profile Card */}
          <div className="admin-user-card" title={user?.email || 'Administrator'}>
            <div className="admin-avatar">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </div>
            {!isCollapsed && (
              <div className="admin-user-meta">
                <span className="user-email-text">{user?.email || 'Administrator'}</span>
                <span className="user-role-tag">Staff Admin</span>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="admin-sidebar-actions">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-sidebar-action-btn"
              title="View Public Customer Website"
            >
              <span className="action-icon">🌐</span>
              {!isCollapsed && <span>View Site</span>}
            </a>
            <button
              type="button"
              className="admin-sidebar-action-btn logout-btn"
              onClick={handleSignOut}
              title="Sign out of Admin Console"
            >
              <span className="action-icon">🚪</span>
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>

          {/* Bottom Sidebar Collapse Toggle */}
          <button
            type="button"
            className="admin-collapse-toggle-bar desktop-only"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="collapse-arrow">{isCollapsed ? '→' : '←'}</span>
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* ===================== RIGHT MAIN CONTENT WRAPPER ===================== */}
      <div className="admin-main-wrapper">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="admin-hamburger-btn mobile-only"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-icon">☰</span>
            </button>

            {/* Breadcrumb / Title */}
            <div className="admin-topbar-title">
              <span className="topbar-crumb-prefix">Console</span>
              <span className="topbar-crumb-separator">/</span>
              <h1 className="topbar-crumb-current">
                <span className="topbar-crumb-icon">{currentItem.icon}</span>
                <span>{currentItem.label}</span>
              </h1>
            </div>
          </div>

          {/* Topbar Right Actions */}
          <div className="admin-topbar-right">
            {pendingOrdersCount > 0 && (
              <Link
                to="/admin/orders"
                className="admin-topbar-pill alert-pill"
                onClick={() => onSelectTab && onSelectTab('orders')}
                title="View Pending Delivery Orders"
              >
                <span className="pill-dot blink" />
                <span>🛵 {pendingOrdersCount} Pending Order{pendingOrdersCount > 1 ? 's' : ''}</span>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              href="/"
              target="_blank"
              className="desktop-only"
            >
              🌐 View Site
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="desktop-only"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};
