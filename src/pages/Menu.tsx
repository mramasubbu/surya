import React, { useState, useMemo, useRef, useEffect } from 'react';
import { fetchMenuWithCategories } from '../services/menuService';
import type { CategoryWithItems, MenuItemRow } from '../types/database';
import './Menu.css';

export const Menu: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadMenu = async () => {
      try {
        const data = await fetchMenuWithCategories(false);
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    if (activeCategory === 'all' && !searchQuery) return categories;

    let cats = activeCategory === 'all' ? categories : categories.filter((c) => c.id === activeCategory);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q))
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    return cats;
  }, [categories, activeCategory, searchQuery]);

  const totalItems = filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const grandTotalItems = categories.reduce((a, c) => a + c.items.length, 0);

  const scrollCategoryIntoView = (id: string) => {
    setActiveCategory(id);
    if (tabsRef.current) {
      const tab = tabsRef.current.querySelector(`[data-cat="${id}"]`) as HTMLElement;
      if (tab) {
        tab.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <main className="page-content">
      <section className="page-hero">
        <div className="container">
          <h1>Our Menu</h1>
          <p>Explore our wide variety of dishes — freshly prepared with authentic flavours</p>
        </div>
      </section>

      <section className="menu-section">
        <div className="container">
          {/* Search */}
          <div className="menu-search-bar">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="menu-search-input"
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button className="menu-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="menu-tabs-wrapper" ref={tabsRef}>
            <div className="menu-tabs">
              <button
                data-cat="all"
                className={`menu-tab ${activeCategory === 'all' ? 'menu-tab-active' : ''}`}
                onClick={() => scrollCategoryIntoView('all')}
              >
                All ({grandTotalItems})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  className={`menu-tab ${activeCategory === cat.id ? 'menu-tab-active' : ''}`}
                  onClick={() => scrollCategoryIntoView(cat.id)}
                >
                  {cat.name} ({cat.items.length})
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="menu-results-count">{totalItems} item{totalItems !== 1 ? 's' : ''} found</p>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-secondary)' }}>
              <div style={{
                width: '36px',
                height: '36px',
                margin: '0 auto 1rem',
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p>Loading fresh menu items...</p>
            </div>
          )}

          {/* Menu Items */}
          {!loading && (
            <div className="menu-categories">
              {filteredCategories.map((cat) => (
                <MenuCategorySection key={cat.id} category={cat} />
              ))}
              {filteredCategories.length === 0 && (
                <div className="menu-empty">
                  <p>No items found for "{searchQuery}"</p>
                  <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>Show all items</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

const MenuCategorySection: React.FC<{ category: CategoryWithItems }> = ({ category }) => {
  return (
    <div className="menu-category" id={`cat-${category.id}`}>
      <div className="menu-category-header">
        <h2 className="menu-category-title">{category.name}</h2>
        <span className="menu-category-count">{category.items.length} items</span>
      </div>
      <div className="menu-items-grid">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const MenuItemCard: React.FC<{ item: MenuItemRow }> = ({ item }) => {
  return (
    <div
      className="menu-item-card"
      style={!item.is_available ? { opacity: 0.65 } : undefined}
    >
      <div className="menu-item-header">
        <span className={`diet-indicator ${item.diet}`} />
        <div className="menu-item-info">
          <h3 className="menu-item-name">
            {item.name}
            {!item.is_available && (
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
                marginLeft: '0.5rem',
                fontWeight: 'normal',
              }}>
                (Sold Out)
              </span>
            )}
          </h3>
          {item.description && <p className="menu-item-desc">{item.description}</p>}
        </div>
      </div>
      <div className="menu-item-price">
        {item.price_label ? (
          <span>₹{item.price_label}</span>
        ) : (
          <span>₹{item.price}</span>
        )}
      </div>
      {item.is_popular && <span className="menu-item-badge">Popular</span>}
    </div>
  );
};

export default Menu;
