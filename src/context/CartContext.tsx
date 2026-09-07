import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MenuItemRow, RestaurantSettingsRow } from '../types/database';
import { fetchRestaurantSettings, DEFAULT_SETTINGS } from '../services/settingsService';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  diet: 'veg' | 'non-veg' | 'egg';
  image_url?: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItemRow, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  totalCount: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  minOrderAmount: number;
  meetsMinimum: boolean;
  amountNeededForMinimum: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  settings: RestaurantSettingsRow;
  refreshSettings: () => Promise<void>;
}

const CART_STORAGE_KEY = 'surya_cart_items';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<RestaurantSettingsRow>(DEFAULT_SETTINGS);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const loadSettings = useCallback(async () => {
    const s = await fetchRestaurantSettings();
    setSettings(s);
  }, []);

  useEffect(() => {
    loadSettings();

    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<RestaurantSettingsRow>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        loadSettings();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'surya_restaurant_settings_cache') {
        loadSettings();
      }
    };

    window.addEventListener('surya_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('surya_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettings]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items]);

  const addItem = useCallback((item: MenuItemRow, quantity = 1) => {
    if (!item.is_available) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          diet: item.diet,
          image_url: item.image_url,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== itemId);
      }
      return prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const getItemQuantity = useCallback(
    (itemId: string): number => {
      const item = items.find((i) => i.id === itemId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = settings.is_delivery_enabled ? settings.delivery_fee : 0;
  const grandTotal = subtotal + deliveryFee;
  const minOrderAmount = settings.min_order_amount;
  const meetsMinimum = subtotal >= minOrderAmount;
  const amountNeededForMinimum = Math.max(0, minOrderAmount - subtotal);

  const openCart = useCallback(() => {
    loadSettings();
    setIsCartOpen(true);
  }, [loadSettings]);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalCount,
        subtotal,
        deliveryFee,
        grandTotal,
        minOrderAmount,
        meetsMinimum,
        amountNeededForMinimum,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        settings,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
