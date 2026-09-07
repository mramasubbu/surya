import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/common/Button';
import { checkDeliveryRadius, type DeliveryRadiusCheckResult } from '../../services/deliveryRadiusService';
import type { RestaurantSettingsRow } from '../../types/database';
import './SettingsView.css';

interface SettingsViewProps {
  settingsForm: RestaurantSettingsRow;
  setSettingsForm: React.Dispatch<React.SetStateAction<RestaurantSettingsRow>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onOgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  actionLoading: boolean;
  notify: (message: string, type?: 'success' | 'error') => void;
}

export type SettingsSubTab = 'branding' | 'seo' | 'contact' | 'ordering' | 'notifications' | 'all';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settingsForm,
  setSettingsForm,
  onSave,
  onLogoUpload,
  onOgImageUpload,
  actionLoading,
  notify,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('branding');
  const [originalSnapshot, setOriginalSnapshot] = useState<string>('');
  const [testCartSubtotal, setTestCartSubtotal] = useState<number>(350);
  const [headerThemePreview, setHeaderThemePreview] = useState<'dark' | 'light'>('dark');
  const [serpViewMode, setSerpViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isOgUploading, setIsOgUploading] = useState(false);
  const [testPincode, setTestPincode] = useState<string>('600053');

  const testPincodeResult: DeliveryRadiusCheckResult = useMemo(() => {
    return checkDeliveryRadius(testPincode, Number(settingsForm.delivery_radius_km) || 3.0);
  }, [testPincode, settingsForm.delivery_radius_km]);

  // Keep a snapshot of original settings once loaded
  useEffect(() => {
    if (!originalSnapshot && settingsForm.id) {
      setOriginalSnapshot(JSON.stringify(settingsForm));
    }
  }, [settingsForm, originalSnapshot]);

  const hasUnsavedChanges = useMemo(() => {
    if (!originalSnapshot) return false;
    return JSON.stringify(settingsForm) !== originalSnapshot;
  }, [settingsForm, originalSnapshot]);

  const handleResetChanges = () => {
    if (!originalSnapshot) return;
    try {
      const parsed = JSON.parse(originalSnapshot) as RestaurantSettingsRow;
      setSettingsForm(parsed);
      notify('Settings reverted to last saved state');
    } catch {
      // Ignore parse error
    }
  };

  const handleWrappedLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLogoUploading(true);
    try {
      await onLogoUpload(e);
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleWrappedOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOgUploading(true);
    try {
      await onOgImageUpload(e);
    } finally {
      setIsOgUploading(false);
    }
  };

  const handleUseDefaultLogo = () => {
    setSettingsForm((prev) => ({
      ...prev,
      logo_url: '/images/branding/logo.svg',
    }));
    notify('Reset to default Surya vector logo');
  };

  // SEO Metrics
  const titleCharCount = settingsForm.seo_title?.length || 0;
  const descCharCount = settingsForm.seo_description?.length || 0;

  // Delivery Simulator Calculations
  const calculatedDeliveryFee = settingsForm.is_delivery_enabled
    ? Number(settingsForm.delivery_fee) || 0
    : 0;
  const isMinOrderMet = testCartSubtotal >= Number(settingsForm.min_order_amount);
  const minOrderShortfall = Math.max(0, Number(settingsForm.min_order_amount) - testCartSubtotal);
  const simulatedGrandTotal = testCartSubtotal + calculatedDeliveryFee;

  return (
    <div className="settings-view-root">
      {/* ===================== 1. HERO HEADER ===================== */}
      <header className="settings-hero">
        <div className="settings-hero-left">
          <div className="settings-hero-badge">
            <span className="badge-pulse-dot" />
            <span>LIVE RESTAURANT CONFIGURATION</span>
          </div>
          <h1 className="settings-hero-title">Restaurant & System Settings</h1>
          <p className="settings-hero-subtitle">
            Configure live branding, SEO metadata, contact coordinates, delivery calculations, and operational alerts.
          </p>
        </div>

        <div className="settings-hero-actions">
          <Button
            variant="outline"
            size="sm"
            href="/"
            target="_blank"
            className="settings-view-site-btn"
          >
            🌐 View Public Site
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={actionLoading || !hasUnsavedChanges}
            onClick={onSave}
            className="settings-save-hero-btn"
          >
            {actionLoading ? (
              <>
                <span className="btn-spinner" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <span>💾 Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ===================== 2. SEGMENTED NAVIGATION ===================== */}
      <nav className="settings-nav-bar" aria-label="Settings Categories">
        <button
          type="button"
          className={`settings-nav-pill ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          <span className="pill-icon">🏢</span>
          <span className="pill-label">Branding & Visuals</span>
        </button>

        <button
          type="button"
          className={`settings-nav-pill ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <span className="pill-icon">🔍</span>
          <span className="pill-label">SEO & Social Share</span>
        </button>

        <button
          type="button"
          className={`settings-nav-pill ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <span className="pill-icon">📞</span>
          <span className="pill-label">Contact & Location</span>
        </button>

        <button
          type="button"
          className={`settings-nav-pill ${activeTab === 'ordering' ? 'active' : ''}`}
          onClick={() => setActiveTab('ordering')}
        >
          <span className="pill-icon">🛵</span>
          <span className="pill-label">Delivery & Ordering</span>
          {(!settingsForm.is_ordering_enabled || !settingsForm.is_delivery_enabled) && (
            <span className="pill-warn-tag">Paused</span>
          )}
        </button>

        <button
          type="button"
          className={`settings-nav-pill ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="pill-icon">✉️</span>
          <span className="pill-label">Alerts & Email</span>
        </button>

        <button
          type="button"
          className={`settings-nav-pill ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="pill-icon">📋</span>
          <span className="pill-label">View All</span>
        </button>
      </nav>

      {/* ===================== 3. MAIN FORM & LIVE SIMULATOR ===================== */}
      <form onSubmit={onSave} className="settings-content-layout">
        {/* ===================== TAB 1: BRANDING & VISUALS ===================== */}
        {(activeTab === 'branding' || activeTab === 'all') && (
          <section className="settings-section-card">
            <div className="section-card-header">
              <div className="section-header-title-wrap">
                <span className="section-icon-badge">🏢</span>
                <div>
                  <h2>Branding & Identity</h2>
                  <p>Define your official restaurant names, taglines, and website logo.</p>
                </div>
              </div>
              <span className="section-status-tag">Affects Header & Footer</span>
            </div>

            <div className="settings-split-grid">
              {/* Form Controls */}
              <div className="settings-form-col">
                <div className="settings-field-group">
                  <label htmlFor="settings-site-name">
                    Full Restaurant Name <span className="field-required">*</span>
                  </label>
                  <div className="settings-input-wrapper">
                    <span className="input-prefix-icon">🏛️</span>
                    <input
                      id="settings-site-name"
                      type="text"
                      required
                      placeholder="e.g. Surya Multicuisine Restaurant & Cafe"
                      value={settingsForm.site_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, site_name: e.target.value })}
                    />
                  </div>
                  <span className="field-hint">
                    Used for legal footer, invoice receipts, and search engine titles.
                  </span>
                </div>

                <div className="settings-two-cols">
                  <div className="settings-field-group">
                    <label htmlFor="settings-short-name">
                      Short Brand Name <span className="field-required">*</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">🏷️</span>
                      <input
                        id="settings-short-name"
                        type="text"
                        required
                        placeholder="e.g. Surya"
                        value={settingsForm.site_short_name || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, site_short_name: e.target.value })}
                      />
                    </div>
                    <span className="field-hint">Displayed in navigation headers and mobile bars.</span>
                  </div>

                  <div className="settings-field-group">
                    <label htmlFor="settings-tagline">Tagline / Subtitle</label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">✨</span>
                      <input
                        id="settings-tagline"
                        type="text"
                        placeholder="e.g. Multicuisine Restaurant & Cafe"
                        value={settingsForm.site_tagline || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, site_tagline: e.target.value })}
                      />
                    </div>
                    <span className="field-hint">Rendered beneath the brand title.</span>
                  </div>
                </div>

                {/* Logo Upload & URL */}
                <div className="settings-field-group">
                  <label htmlFor="settings-logo-url">Brand Logo Asset</label>
                  <div className="logo-upload-control-card">
                    <div className="settings-input-wrapper with-action">
                      <span className="input-prefix-icon">🖼️</span>
                      <input
                        id="settings-logo-url"
                        type="text"
                        placeholder="/images/branding/logo.svg or https://..."
                        value={settingsForm.logo_url || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                      />
                      <label className="upload-action-btn" title="Upload new logo file">
                        {isLogoUploading ? 'Uploading...' : '📁 Browse File'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleWrappedLogoUpload}
                          disabled={isLogoUploading}
                        />
                      </label>
                    </div>

                    <div className="logo-helper-row">
                      <span className="field-hint">
                        Accepts SVG (recommended), WebP, PNG, or JPG formats. Transparent background recommended.
                      </span>
                      <button
                        type="button"
                        className="quick-text-btn"
                        onClick={handleUseDefaultLogo}
                      >
                        Reset to Vector Logo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="settings-preview-col">
                <div className="preview-card-frame">
                  <div className="preview-card-topbar">
                    <div className="preview-window-dots">
                      <span className="dot red" />
                      <span className="dot yellow" />
                      <span className="dot green" />
                    </div>
                    <span className="preview-title-bar">Live Header Simulation</span>
                    <div className="preview-theme-toggle">
                      <button
                        type="button"
                        className={`theme-toggle-btn ${headerThemePreview === 'dark' ? 'active' : ''}`}
                        onClick={() => setHeaderThemePreview('dark')}
                        title="Dark mode preview"
                      >
                        🌙 Dark
                      </button>
                      <button
                        type="button"
                        className={`theme-toggle-btn ${headerThemePreview === 'light' ? 'active' : ''}`}
                        onClick={() => setHeaderThemePreview('light')}
                        title="Light mode preview"
                      >
                        ☀️ Light
                      </button>
                    </div>
                  </div>

                  {/* Header Simulation Box */}
                  <div className={`simulated-header ${headerThemePreview}`}>
                    <div className="sim-header-logo-group">
                      <div className="sim-logo-container">
                        <img
                          src={settingsForm.logo_url || '/images/branding/logo.svg'}
                          alt="Logo Preview"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/branding/logo.svg';
                          }}
                        />
                      </div>
                      <div className="sim-text-group">
                        <span className="sim-brand-name">
                          {settingsForm.site_short_name || 'Surya'}
                        </span>
                        <span className="sim-tagline">
                          {settingsForm.site_tagline || 'Multicuisine Restaurant & Cafe'}
                        </span>
                      </div>
                    </div>

                    <div className="sim-header-nav-links">
                      <span className="sim-link active">Home</span>
                      <span className="sim-link">Menu</span>
                      <span className="sim-link">Bookings</span>
                    </div>

                    <div className="sim-header-actions">
                      <div className="sim-order-pill">Order Online</div>
                    </div>
                  </div>

                  <div className="preview-info-strip">
                    <span>💡 <strong>Real-time Sync:</strong> Any edit to the brand title or logo immediately reflects across both dark customer pages and light checkout modals.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB 2: SEO & SEARCH INDEXING ===================== */}
        {(activeTab === 'seo' || activeTab === 'all') && (
          <section className="settings-section-card">
            <div className="section-card-header">
              <div className="section-header-title-wrap">
                <span className="section-icon-badge">🔍</span>
                <div>
                  <h2>SEO & Social Sharing Preview</h2>
                  <p>Optimize meta tags for Google indexing and WhatsApp / Facebook link cards.</p>
                </div>
              </div>
              <span className="section-status-tag">Search & Social</span>
            </div>

            <div className="settings-split-grid">
              {/* Form Controls */}
              <div className="settings-form-col">
                <div className="settings-field-group">
                  <div className="field-label-with-counter">
                    <label htmlFor="settings-seo-title">Meta Title</label>
                    <span className={`counter-pill ${titleCharCount >= 45 && titleCharCount <= 65 ? 'optimal' : titleCharCount > 65 ? 'exceeded' : 'short'}`}>
                      {titleCharCount} / 60 characters
                    </span>
                  </div>
                  <div className="settings-input-wrapper">
                    <span className="input-prefix-icon">🏷️</span>
                    <input
                      id="settings-seo-title"
                      type="text"
                      placeholder="Surya Multicuisine Restaurant & Cafe | Ambattur, Chennai"
                      value={settingsForm.seo_title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seo_title: e.target.value })}
                    />
                  </div>
                  <span className="field-hint">
                    Optimal length: 50–60 characters. Displayed on Google and browser tabs.
                  </span>
                </div>

                <div className="settings-field-group">
                  <div className="field-label-with-counter">
                    <label htmlFor="settings-seo-desc">Meta Description</label>
                    <span className={`counter-pill ${descCharCount >= 120 && descCharCount <= 160 ? 'optimal' : descCharCount > 160 ? 'exceeded' : 'short'}`}>
                      {descCharCount} / 160 characters
                    </span>
                  </div>
                  <textarea
                    id="settings-seo-desc"
                    rows={3}
                    className="settings-textarea"
                    placeholder="Surya Multicuisine Restaurant in Ambattur, Chennai. Serving Biryani, Chinese, Tandoori, and South Indian delicacies..."
                    value={settingsForm.seo_description || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, seo_description: e.target.value })}
                  />
                  <span className="field-hint">
                    Summary shown under search results and chat previews (ideal: ~150 chars).
                  </span>
                </div>

                <div className="settings-field-group">
                  <label htmlFor="settings-seo-keywords">Search Keywords (Comma-separated)</label>
                  <div className="settings-input-wrapper">
                    <span className="input-prefix-icon">#</span>
                    <input
                      id="settings-seo-keywords"
                      type="text"
                      placeholder="Surya Restaurant, Ambattur Biryani, Tandoori Chennai, Family Restaurant"
                      value={settingsForm.seo_keywords || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seo_keywords: e.target.value })}
                    />
                  </div>
                </div>

                <div className="settings-field-group">
                  <label htmlFor="settings-og-image">Social Share Image (OG Image)</label>
                  <div className="settings-input-wrapper with-action">
                    <span className="input-prefix-icon">📸</span>
                    <input
                      id="settings-og-image"
                      type="text"
                      placeholder="/images/restaurant/hero-food-spread.jpg or https://..."
                      value={settingsForm.og_image_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, og_image_url: e.target.value })}
                    />
                    <label className="upload-action-btn" title="Upload Social Share Image">
                      {isOgUploading ? 'Uploading...' : '📁 Upload Photo'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleWrappedOgUpload}
                        disabled={isOgUploading}
                      />
                    </label>
                  </div>
                  <span className="field-hint">
                    Recommended dimension: 1200 × 630 px. Shown when link is pasted in WhatsApp or Facebook.
                  </span>
                </div>
              </div>

              {/* Live SEO Previews */}
              <div className="settings-preview-col">
                {/* Google SERP Snippet Simulator */}
                <div className="preview-card-frame">
                  <div className="preview-card-topbar">
                    <div className="serp-topbar-left">
                      <span className="google-icon">G</span>
                      <span className="preview-title-bar">Google Search Result Snippet</span>
                    </div>
                    <div className="preview-theme-toggle">
                      <button
                        type="button"
                        className={`theme-toggle-btn ${serpViewMode === 'desktop' ? 'active' : ''}`}
                        onClick={() => setSerpViewMode('desktop')}
                      >
                        🖥️ Desktop
                      </button>
                      <button
                        type="button"
                        className={`theme-toggle-btn ${serpViewMode === 'mobile' ? 'active' : ''}`}
                        onClick={() => setSerpViewMode('mobile')}
                      >
                        📱 Mobile
                      </button>
                    </div>
                  </div>

                  <div className={`simulated-serp ${serpViewMode}`}>
                    <div className="sim-serp-url-row">
                      <img
                        src={settingsForm.logo_url || '/favicon.svg'}
                        alt="Favicon"
                        className="sim-serp-favicon"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.svg'; }}
                      />
                      <div className="sim-serp-url-meta">
                        <span className="sim-serp-site-name">{settingsForm.site_short_name || 'Surya Restaurant'}</span>
                        <span className="sim-serp-url">https://suryarestaurantchennai.com</span>
                      </div>
                    </div>

                    <h3 className="sim-serp-title">
                      {settingsForm.seo_title || settingsForm.site_name || 'Surya Multicuisine Restaurant & Cafe | Ambattur'}
                    </h3>

                    <p className="sim-serp-description">
                      {settingsForm.seo_description || 'Authentic dining in Ambattur, Chennai. Serving fresh Biryani, Chinese, Tandoori, and South Indian delicacies.'}
                    </p>
                  </div>
                </div>

                {/* WhatsApp / Social Card Simulator */}
                <div className="preview-card-frame" style={{ marginTop: '1rem' }}>
                  <div className="preview-card-topbar">
                    <span className="preview-title-bar">💬 WhatsApp / Social Link Card</span>
                  </div>

                  <div className="simulated-og-card">
                    {settingsForm.og_image_url ? (
                      <div className="sim-og-image-wrap">
                        <img
                          src={settingsForm.og_image_url}
                          alt="Social Preview"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="sim-og-image-placeholder">
                        <span>📸 No social share image uploaded yet</span>
                      </div>
                    )}

                    <div className="sim-og-content">
                      <span className="sim-og-domain">SURYARESTAURANTCHENNAI.COM</span>
                      <h4 className="sim-og-title">
                        {settingsForm.seo_title || settingsForm.site_name || 'Surya Multicuisine Restaurant'}
                      </h4>
                      <p className="sim-og-desc">
                        {settingsForm.seo_description || 'Visit Surya Multicuisine Restaurant in Ambattur, Chennai.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB 3: CONTACT & LOCATION ===================== */}
        {(activeTab === 'contact' || activeTab === 'all') && (
          <section className="settings-section-card">
            <div className="section-card-header">
              <div className="section-header-title-wrap">
                <span className="section-icon-badge">📞</span>
                <div>
                  <h2>Contact & Store Location</h2>
                  <p>Keep your direct phone numbers, WhatsApp, opening timings, and map coordinates accurate.</p>
                </div>
              </div>
              <span className="section-status-tag">Customer Support</span>
            </div>

            <div className="settings-split-grid">
              {/* Form Controls */}
              <div className="settings-form-col">
                <div className="settings-two-cols">
                  <div className="settings-field-group">
                    <label htmlFor="settings-contact-phone">
                      Calling Phone Number (tel: format)
                    </label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">📞</span>
                      <input
                        id="settings-contact-phone"
                        type="text"
                        placeholder="+918015553780"
                        value={settingsForm.contact_phone || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                      />
                    </div>
                    <span className="field-hint">Standard format for one-tap telephone calls.</span>
                  </div>

                  <div className="settings-field-group">
                    <label htmlFor="settings-phone-display">Display Phone Number</label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">📱</span>
                      <input
                        id="settings-phone-display"
                        type="text"
                        placeholder="+91 80155 53780"
                        value={settingsForm.contact_phone_display || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone_display: e.target.value })}
                      />
                    </div>
                    <span className="field-hint">Human-readable format shown to customers.</span>
                  </div>
                </div>

                <div className="settings-two-cols">
                  <div className="settings-field-group">
                    <label htmlFor="settings-whatsapp">WhatsApp Number</label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">💬</span>
                      <input
                        id="settings-whatsapp"
                        type="text"
                        placeholder="+918015553780"
                        value={settingsForm.contact_whatsapp || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contact_whatsapp: e.target.value })}
                      />
                    </div>
                    <span className="field-hint">Powers instant WhatsApp table bookings & inquiries.</span>
                  </div>

                  <div className="settings-field-group">
                    <label htmlFor="settings-hours">Operating Hours</label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">⏰</span>
                      <input
                        id="settings-hours"
                        type="text"
                        placeholder="11:00 AM – 11:00 PM"
                        value={settingsForm.operating_hours || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, operating_hours: e.target.value })}
                      />
                    </div>
                    <span className="field-hint">Published in topbar, footer, and checkout notes.</span>
                  </div>
                </div>

                <div className="settings-field-group">
                  <label htmlFor="settings-address">Full Physical Address</label>
                  <textarea
                    id="settings-address"
                    rows={2}
                    className="settings-textarea"
                    placeholder="97, Vanagaram High Road, Sivananda Nagar, Ambattur, Chennai, Tamil Nadu 600053"
                    value={settingsForm.address_full || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address_full: e.target.value })}
                  />
                </div>

                <div className="settings-field-group">
                  <label htmlFor="settings-maps-url">Google Maps Directions Link</label>
                  <div className="settings-input-wrapper">
                    <span className="input-prefix-icon">📍</span>
                    <input
                      id="settings-maps-url"
                      type="url"
                      placeholder="https://www.google.com/maps/search/..."
                      value={settingsForm.google_maps_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, google_maps_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Contact Preview */}
              <div className="settings-preview-col">
                <div className="preview-card-frame">
                  <div className="preview-card-topbar">
                    <span className="preview-title-bar">Customer Quick Contact Preview</span>
                    <span className="preview-status-pill">Interactive</span>
                  </div>

                  <div className="simulated-contact-card">
                    <div className="sim-contact-header">
                      <div className="sim-contact-brand-icon">📍</div>
                      <div>
                        <h4>{settingsForm.site_short_name || 'Surya Restaurant'}</h4>
                        <span>{settingsForm.operating_hours || '11:00 AM – 11:00 PM'}</span>
                      </div>
                    </div>

                    <p className="sim-contact-address">
                      {settingsForm.address_full || '97, Vanagaram High Road, Ambattur, Chennai - 600053'}
                    </p>

                    <div className="sim-contact-buttons-grid">
                      <a
                        href={`tel:${settingsForm.contact_phone || '+918015553780'}`}
                        className="sim-action-btn phone"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>📞</span>
                        <span>Call {settingsForm.contact_phone_display || settingsForm.contact_phone || 'Restaurant'}</span>
                      </a>

                      <a
                        href={`https://wa.me/${(settingsForm.contact_whatsapp || '918015553780').replace(/[^0-9]/g, '')}`}
                        className="sim-action-btn whatsapp"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>💬</span>
                        <span>WhatsApp Chat</span>
                      </a>

                      {settingsForm.google_maps_url && (
                        <a
                          href={settingsForm.google_maps_url}
                          className="sim-action-btn maps"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>🗺️</span>
                          <span>Get Directions</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB 4: DELIVERY & ORDERING ===================== */}
        {(activeTab === 'ordering' || activeTab === 'all') && (
          <section className="settings-section-card">
            <div className="section-card-header">
              <div className="section-header-title-wrap">
                <span className="section-icon-badge">🛵</span>
                <div>
                  <h2>Online Ordering & Delivery Engine</h2>
                  <p>Fine-tune doorstep delivery charges, minimum order hurdles, and store accepting states.</p>
                </div>
              </div>
              <span className="section-status-tag">Checkout Logic</span>
            </div>

            <div className="settings-split-grid">
              {/* Form Controls */}
              <div className="settings-form-col">
                {/* Big Toggle Switches */}
                <div className="switch-cards-grid">
                  <div className={`switch-card ${settingsForm.is_ordering_enabled ? 'enabled' : 'paused'}`}>
                    <div className="switch-card-info">
                      <div className="switch-title-row">
                        <strong>Accept Online Orders</strong>
                        <span className={`status-badge ${settingsForm.is_ordering_enabled ? 'active' : 'inactive'}`}>
                          {settingsForm.is_ordering_enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p>Allow visitors to add food items to cart and proceed to checkout.</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={settingsForm.is_ordering_enabled}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, is_ordering_enabled: e.target.checked })
                        }
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className={`switch-card ${settingsForm.is_delivery_enabled ? 'enabled' : 'paused'}`}>
                    <div className="switch-card-info">
                      <div className="switch-title-row">
                        <strong>Doorstep Home Delivery</strong>
                        <span className={`status-badge ${settingsForm.is_delivery_enabled ? 'active' : 'inactive'}`}>
                          {settingsForm.is_delivery_enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p>Accept home delivery orders at customer residential addresses.</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={settingsForm.is_delivery_enabled}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, is_delivery_enabled: e.target.checked })
                        }
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Delivery Fee, Minimum Order, Radius */}
                <div className="settings-two-cols">
                  <div className="settings-field-group">
                    <label htmlFor="settings-delivery-fee">
                      Delivery Fee <span className="field-required">*</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">₹</span>
                      <input
                        id="settings-delivery-fee"
                        type="number"
                        min={0}
                        step={5}
                        required
                        value={settingsForm.delivery_fee}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) })
                        }
                      />
                    </div>
                    <span className="field-hint">
                      {Number(settingsForm.delivery_fee) === 0
                        ? '🟢 Free delivery notice is displayed in the cart and checkout.'
                        : `Adds ₹${settingsForm.delivery_fee} delivery charge directly into customer totals.`}
                    </span>
                  </div>

                  <div className="settings-field-group">
                    <label htmlFor="settings-min-order">
                      Minimum Order Subtotal <span className="field-required">*</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <span className="input-prefix-icon">₹</span>
                      <input
                        id="settings-min-order"
                        type="number"
                        min={0}
                        step={10}
                        required
                        value={settingsForm.min_order_amount}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, min_order_amount: Number(e.target.value) })
                        }
                      />
                    </div>
                    <span className="field-hint">
                      Subtotals under ₹{settingsForm.min_order_amount} will be prompted to add more dishes.
                    </span>
                  </div>
                </div>

                <div className="settings-field-group">
                  <label htmlFor="settings-radius">
                    Delivery Coverage Radius <span className="field-required">*</span>
                  </label>
                  <div className="settings-input-wrapper">
                    <span className="input-prefix-icon">📍</span>
                    <input
                      id="settings-radius"
                      type="number"
                      min={0.5}
                      max={25}
                      step={0.5}
                      required
                      value={settingsForm.delivery_radius_km}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, delivery_radius_km: Number(e.target.value) })
                      }
                    />
                    <span className="input-suffix-tag">Kilometers</span>
                  </div>
                  <span className="field-hint">
                    Initial delivery coverage area centered at Ambattur restaurant.
                  </span>
                </div>
              </div>

              {/* Live Interactive Cost Calculator Simulator */}
              <div className="settings-preview-col">
                <div className="preview-card-frame">
                  <div className="preview-card-topbar">
                    <span className="preview-title-bar">🧮 Live Cart & Checkout Simulator</span>
                    <span className="preview-status-pill">Interactive</span>
                  </div>

                  <div className="simulated-calculator-box">
                    <div className="calculator-slider-row">
                      <label htmlFor="sim-slider">
                        <span>Test Cart Subtotal:</span>
                        <strong>₹{testCartSubtotal}</strong>
                      </label>
                      <input
                        id="sim-slider"
                        type="range"
                        min={50}
                        max={1000}
                        step={25}
                        value={testCartSubtotal}
                        onChange={(e) => setTestCartSubtotal(Number(e.target.value))}
                        className="sim-range-slider"
                      />
                      <div className="slider-ticks">
                        <span>₹50</span>
                        <span>₹500</span>
                        <span>₹1000</span>
                      </div>
                    </div>

                    {/* Simulated Order Summary Card */}
                    <div className="sim-checkout-receipt">
                      <div className="receipt-row">
                        <span>Dishes Subtotal</span>
                        <strong>₹{testCartSubtotal}</strong>
                      </div>

                      <div className="receipt-row">
                        <span>Delivery Fee</span>
                        {calculatedDeliveryFee === 0 ? (
                          <span className="fee-free-tag">FREE</span>
                        ) : (
                          <strong className="fee-charge">₹{calculatedDeliveryFee}</strong>
                        )}
                      </div>

                      <div className="receipt-divider" />

                      <div className="receipt-row total">
                        <span>Estimated Total to Pay</span>
                        <strong className="total-highlight">₹{simulatedGrandTotal}</strong>
                      </div>

                      {/* Minimum Order Check Banner */}
                      <div className={`receipt-validation-banner ${isMinOrderMet ? 'passed' : 'blocked'}`}>
                        {isMinOrderMet ? (
                          <>
                            <span className="validation-icon">✅</span>
                            <span>Eligible for Checkout (Minimum ₹{settingsForm.min_order_amount} met)</span>
                          </>
                        ) : (
                          <>
                            <span className="validation-icon">⚠️</span>
                            <span>Checkout Blocked: Add ₹{minOrderShortfall} more to reach minimum ₹{settingsForm.min_order_amount}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Interactive Pincode Coverage Tester */}
                    <div className="admin-pincode-tester-card">
                      <div className="tester-header-row">
                        <span className="pincode-tester-title">📍 Guest PIN Code Coverage Tester</span>
                        <span className="tester-radius-tag">Max: {settingsForm.delivery_radius_km} KM</span>
                      </div>

                      <div className="pincode-tester-input-row">
                        <input
                          type="text"
                          placeholder="Enter PIN (e.g. 600053)"
                          value={testPincode}
                          onChange={(e) => setTestPincode(e.target.value)}
                          maxLength={6}
                          className="admin-pin-input"
                        />
                        <div className="admin-quick-pins">
                          <button type="button" onClick={() => setTestPincode('600053')}>Ambattur</button>
                          <button type="button" onClick={() => setTestPincode('600098')}>Mogappair</button>
                          <button type="button" onClick={() => setTestPincode('600077')}>Vanagaram</button>
                          <button type="button" onClick={() => setTestPincode('600054')}>Avadi</button>
                        </div>
                      </div>

                      {testPincode.replace(/\D/g, '').length === 6 && (
                        <div className={`pincode-test-result ${testPincodeResult.isDeliverable ? 'eligible' : 'blocked'}`}>
                          <div className="result-top">
                            <span className="result-status-title">
                              {testPincodeResult.isDeliverable ? '✅ Within Delivery Zone' : '⛔ Outside Delivery Limit'}
                            </span>
                            {testPincodeResult.approxDistanceKm !== null && (
                              <span className="result-distance-tag">~{testPincodeResult.approxDistanceKm} KM</span>
                            )}
                          </div>
                          <p className="result-locality"><strong>Locality:</strong> {testPincodeResult.locality}</p>
                          <p className="result-msg">{testPincodeResult.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB 5: ALERTS & EMAIL ===================== */}
        {(activeTab === 'notifications' || activeTab === 'all') && (
          <section className="settings-section-card">
            <div className="section-card-header">
              <div className="section-header-title-wrap">
                <span className="section-icon-badge">✉️</span>
                <div>
                  <h2>Operational Alerts & Email Routing</h2>
                  <p>Route incoming order notifications and configure automatic customer email receipts.</p>
                </div>
              </div>
              <span className="section-status-tag">Automation</span>
            </div>

            <div className="settings-split-grid">
              {/* Form Controls */}
              <div className="settings-form-col">
                <div className="settings-field-group">
                  <label htmlFor="settings-staff-email">
                    Restaurant Staff Alert Email <span className="field-required">*</span>
                  </label>
                  <div className="settings-input-wrapper">
                    <span className="input-prefix-icon">📧</span>
                    <input
                      id="settings-staff-email"
                      type="email"
                      required
                      placeholder="orders@suryarestaurant.com"
                      value={settingsForm.restaurant_email || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_email: e.target.value })}
                    />
                  </div>
                  <span className="field-hint">
                    Receives real-time alerts whenever a new order or table booking is placed.
                  </span>
                </div>

                <div className="switch-card" style={{ marginTop: '0.5rem' }}>
                  <div className="switch-card-info">
                    <div className="switch-title-row">
                      <strong>Customer Email Receipts</strong>
                      <span className={`status-badge ${settingsForm.customer_email_notifications ? 'active' : 'inactive'}`}>
                        {settingsForm.customer_email_notifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p>Send branded HTML receipts to customers upon order confirmation and status changes.</p>
                  </div>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={settingsForm.customer_email_notifications}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, customer_email_notifications: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Email Mockup Preview */}
              <div className="settings-preview-col">
                <div className="preview-card-frame">
                  <div className="preview-card-topbar">
                    <span className="preview-title-bar">✉️ Email Receipt Template Preview</span>
                  </div>

                  <div className="simulated-email-box">
                    <div className="sim-email-header">
                      <img
                        src={settingsForm.logo_url || '/images/branding/logo.svg'}
                        alt="Logo"
                        className="sim-email-logo"
                      />
                      <div>
                        <h5>{settingsForm.site_name || 'Surya Multicuisine Restaurant'}</h5>
                        <span>Order Confirmation #SUR-1042</span>
                      </div>
                    </div>

                    <div className="sim-email-body">
                      <p>Hello Customer, thank you for ordering! Your food is being freshly prepared.</p>
                      <div className="sim-email-items">
                        <div className="email-item-row">
                          <span>1x Chicken Dum Biryani</span>
                          <span>₹240</span>
                        </div>
                        <div className="email-item-row">
                          <span>1x Paneer Butter Masala</span>
                          <span>₹180</span>
                        </div>
                        <div className="email-item-row sub">
                          <span>Delivery Fee</span>
                          <span>₹{settingsForm.delivery_fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== 4. FLOATING / STICKY ACTION BAR ===================== */}
        <div className={`settings-sticky-bar ${hasUnsavedChanges ? 'is-dirty' : ''}`}>
          <div className="sticky-bar-left">
            {hasUnsavedChanges ? (
              <div className="dirty-indicator">
                <span className="dirty-dot" />
                <span>You have unsaved changes in settings</span>
              </div>
            ) : (
              <div className="clean-indicator">
                <span className="clean-icon">✓</span>
                <span>All settings saved and live</span>
              </div>
            )}
          </div>

          <div className="sticky-bar-actions">
            {hasUnsavedChanges && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleResetChanges}
                disabled={actionLoading}
              >
                Discard Changes
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={actionLoading || !hasUnsavedChanges}
            >
              {actionLoading ? 'Saving Settings...' : '💾 Save Restaurant Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
