import { useState, useEffect, useCallback } from 'react';
import type { RestaurantSettingsRow } from '../types/database';
import {
  DEFAULT_SETTINGS,
  getCachedSettings,
  fetchRestaurantSettings,
  SETTINGS_UPDATED_EVENT,
} from '../services/settingsService';

function updateMetaTag(attributeName: 'name' | 'property', attributeValue: string, content?: string | null) {
  if (typeof document === 'undefined' || !content) return;
  let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Hook to retrieve restaurant branding, SEO and operational settings.
 * Automatically synchronizes document title and SEO meta tags when settings change.
 */
export const useSiteSettings = () => {
  const [settings, setSettings] = useState<RestaurantSettingsRow>(() => getCachedSettings());
  const [loading, setLoading] = useState<boolean>(true);

  const reloadSettings = useCallback(async () => {
    try {
      const fresh = await fetchRestaurantSettings();
      setSettings(fresh);
    } catch {
      // Fallback already returned by service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSettings();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RestaurantSettingsRow>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    };
  }, [reloadSettings]);

  // Sync SEO & Social Meta tags
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const title = settings.seo_title || settings.site_name || DEFAULT_SETTINGS.seo_title;
    const description = settings.seo_description || DEFAULT_SETTINGS.seo_description;
    const keywords = settings.seo_keywords || DEFAULT_SETTINGS.seo_keywords;
    const ogImage = settings.og_image_url || DEFAULT_SETTINGS.og_image_url;

    // Document Title
    if (title) {
      document.title = title;
    }

    // Standard SEO Tags
    updateMetaTag('name', 'title', title);
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);

    // Open Graph Tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', ogImage);

    // Twitter Tags
    updateMetaTag('property', 'twitter:title', title);
    updateMetaTag('property', 'twitter:description', description);
    updateMetaTag('property', 'twitter:image', ogImage);
  }, [
    settings.seo_title,
    settings.site_name,
    settings.seo_description,
    settings.seo_keywords,
    settings.og_image_url,
  ]);

  return {
    settings,
    loading,
    reloadSettings,
  };
};
