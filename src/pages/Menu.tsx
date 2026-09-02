import React, { useState, useMemo, useRef } from 'react';
import { menuCategories, type MenuCategory, type MenuItem } from '../data/menu';
import './Menu.css';

export const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);

  const filteredCategories = useMemo(() => {
    if (activeCategory === 'all' && !searchQuery) return menuCategories;

    let cats = activeCategory === 'all' ? menuCategories : menuCategories.filter((c) => c.id === activeCategory);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => item.name.toLowerCase().includes(q)),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    return cats;
  }, [activeCategory, searchQuery]);

  const totalItems = filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);

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
                All ({menuCategories.reduce((a, c) => a + c.items.length, 0)})
              </button>
              {menuCategories.map((cat) => (
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

          {/* Menu Items */}
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
        </div>
      </section>
    </main>
  );
};

const MenuCategorySection: React.FC<{ category: MenuCategory }> = ({ category }) => {
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

const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  return (
    <div className="menu-item-card">
      <div className="menu-item-header">
        <span className={`diet-indicator ${item.diet}`} />
        <div className="menu-item-info">
          <h3 className="menu-item-name">{item.name}</h3>
          {item.description && <p className="menu-item-desc">{item.description}</p>}
        </div>
      </div>
      <div className="menu-item-price">
        {item.priceLabel ? (
          <span>₹{item.priceLabel}</span>
        ) : (
          <span>₹{item.price}</span>
        )}
      </div>
      {item.popular && <span className="menu-item-badge">Popular</span>}
    </div>
  );
};

export default Menu;
