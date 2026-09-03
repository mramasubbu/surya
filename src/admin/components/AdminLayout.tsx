import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../components/common/Button';
import './AdminLayout.css';

export type AdminTab = 'overview' | 'categories' | 'menu' | 'offers' | 'bookings' | 'messages';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingBookingsCount?: number;
  unreadMessagesCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  pendingBookingsCount = 0,
  unreadMessagesCount = 0,
  children,
}) => {
  const { user, signOut } = useAuth();

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src="/images/branding/logo.svg" alt="Surya Logo" />
          <div className="admin-header-title">
            <h2>Surya Restaurant</h2>
            <span>Management Console</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <div className="admin-user-info">
            <span className="user-email">{user?.email || 'Administrator'}</span>
            <span className="admin-user-badge">Admin</span>
          </div>
          <Button variant="outline" size="sm" href="/" target="_blank">
            🌐 View Site
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav" role="tablist" aria-label="Admin Sections">
        <button
          className={`admin-nav-tab ${currentTab === 'overview' ? 'active' : ''}`}
          onClick={() => onSelectTab('overview')}
        >
          📊 Overview
        </button>

        <button
          className={`admin-nav-tab ${currentTab === 'categories' ? 'active' : ''}`}
          onClick={() => onSelectTab('categories')}
        >
          📁 Categories
        </button>

        <button
          className={`admin-nav-tab ${currentTab === 'menu' ? 'active' : ''}`}
          onClick={() => onSelectTab('menu')}
        >
          🍛 Menu Items
        </button>

        <button
          className={`admin-nav-tab ${currentTab === 'offers' ? 'active' : ''}`}
          onClick={() => onSelectTab('offers')}
        >
          🏷️ Offers
        </button>

        <button
          className={`admin-nav-tab ${currentTab === 'bookings' ? 'active' : ''}`}
          onClick={() => onSelectTab('bookings')}
        >
          📅 Bookings
          {pendingBookingsCount > 0 && (
            <span className="admin-badge-count">{pendingBookingsCount}</span>
          )}
        </button>

        <button
          className={`admin-nav-tab ${currentTab === 'messages' ? 'active' : ''}`}
          onClick={() => onSelectTab('messages')}
        >
          ✉️ Inquiries
          {unreadMessagesCount > 0 && (
            <span className="admin-badge-count">{unreadMessagesCount}</span>
          )}
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};
