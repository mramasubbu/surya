import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout, type AdminTab } from '../components/AdminLayout';
import { Button } from '../../components/common/Button';
import {
  fetchMenuWithCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
} from '../../services/menuService';
import {
  fetchBookings,
  updateBookingStatus,
  deleteBooking,
} from '../../services/bookingService';
import {
  fetchContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../../services/contactService';
import {
  fetchAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../../services/offersService';
import { uploadRestaurantImage } from '../../services/storageService';
import { fetchAdminOrders, updateOrderStatus } from '../../services/orderService';
import {
  fetchRestaurantSettings,
  updateRestaurantSettings,
  DEFAULT_SETTINGS,
} from '../../services/settingsService';
import { sendOrderEmailNotification } from '../../services/emailService';
import type {
  CategoryWithItems,
  CategoryRow,
  MenuItemRow,
  BookingRow,
  ContactMessageRow,
  OfferRow,
  DietType,
  BookingStatus,
  ContactMessageStatus,
  OrderWithItems,
  OrderStatus,
  RestaurantSettingsRow,
} from '../../types/database';
import './AdminDashboard.css';

const VALID_TABS: AdminTab[] = [
  'overview',
  'orders',
  'categories',
  'menu',
  'offers',
  'bookings',
  'messages',
  'settings',
];

export const AdminDashboard: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const currentTab: AdminTab = tab && VALID_TABS.includes(tab as AdminTab)
    ? (tab as AdminTab)
    : 'overview';

  const handleSelectTab = useCallback((newTab: AdminTab) => {
    navigate(`/admin/${newTab}`);
  }, [navigate]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data state
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [settingsForm, setSettingsForm] = useState<RestaurantSettingsRow>(DEFAULT_SETTINGS);

  // Orders tab filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderDateFilter, setOrderDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    orderId: string;
    newStatus: OrderStatus;
    orderNumber: string;
    label: string;
  } | null>(null);

  // Menu tab filters
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<string>('all');

  // Bookings tab filter
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingDateFilter, setBookingDateFilter] = useState<string>('');

  // Messages tab filter
  const [messageStatusFilter, setMessageStatusFilter] = useState<string>('all');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', display_order: 1, is_active: true });

  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItemRow | null>(null);
  const [itemForm, setItemForm] = useState<{
    category_id: string;
    name: string;
    description: string;
    price: number;
    price_label: string;
    diet: DietType;
    image_url: string;
    is_popular: boolean;
    is_available: boolean;
    is_active: boolean;
    display_order: number;
  }>({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    price_label: '',
    diet: 'non-veg',
    image_url: '',
    is_popular: false,
    is_available: true,
    is_active: true,
    display_order: 1,
  });
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [editingOffer, setEditingOffer] = useState<OfferRow | null>(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    discount_tag: '',
    start_date: '',
    end_date: '',
    image_url: '',
    is_active: true,
  });

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load all initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, bks, msgs, offs, ords, setts] = await Promise.all([
        fetchMenuWithCategories(true),
        fetchBookings(),
        fetchContactMessages(),
        fetchAllOffers(),
        fetchAdminOrders(),
        fetchRestaurantSettings(),
      ]);
      setCategories(cats);
      setBookings(bks);
      setMessages(msgs);
      setOffers(offs);
      setOrders(ords);
      setSettingsForm(setts);
    } catch (err: unknown) {
      console.error('Failed to load admin dashboard data:', err);
      notify('Failed to load some dashboard data. Check database connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived counts
  const allItems = categories.flatMap((c) => c.items);
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const unreadMessages = messages.filter((m) => m.status === 'unread');
  const pendingOrders = orders.filter((o) => o.order_status === 'pending');
  const todayOrders = orders.filter((o) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(o.created_at) >= today;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.order_status !== orderStatusFilter) {
      return false;
    }

    if (orderDateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(o.created_at) < today) return false;
    } else if (orderDateFilter === 'yesterday') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      yest.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const created = new Date(o.created_at);
      if (created < yest || created >= today) return false;
    }

    if (orderSearch) {
      const q = orderSearch.trim().toLowerCase();
      const match =
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.delivery_address.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // --- Order Status Handlers ---
  const handleRequestStatusChange = (orderId: string, newStatus: OrderStatus, orderNumber: string) => {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
    };
    setStatusConfirmModal({
      orderId,
      newStatus,
      orderNumber,
      label: labels[newStatus] || newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal) return;
    const { orderId, newStatus, orderNumber, label } = statusConfirmModal;
    setActionLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);

      // Decoupled status email notification
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder) {
        sendOrderEmailNotification({
          type: 'STATUS_UPDATE',
          order: { ...targetOrder, order_status: newStatus },
          items: targetOrder.items,
          previousStatus: targetOrder.order_status,
          newStatus,
        }).catch((err) => console.warn('Customer status update email error:', err));
      }

      notify(`Order ${orderNumber} marked as ${label}`);
      setStatusConfirmModal(null);

      // Refresh orders
      const updated = await fetchAdminOrders();
      setOrders(updated);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
      }
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to update order status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Settings Handlers ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const updated = await updateRestaurantSettings({
        is_ordering_enabled: settingsForm.is_ordering_enabled,
        is_delivery_enabled: settingsForm.is_delivery_enabled,
        min_order_amount: Number(settingsForm.min_order_amount),
        delivery_fee: Number(settingsForm.delivery_fee),
        delivery_radius_km: Number(settingsForm.delivery_radius_km),
        restaurant_email: settingsForm.restaurant_email.trim(),
        customer_email_notifications: settingsForm.customer_email_notifications,
      });
      setSettingsForm(updated);
      notify('Restaurant ordering settings saved successfully!');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save settings', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Category Handlers ---
  const handleOpenCategoryModal = (cat?: CategoryRow) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        slug: cat.slug,
        display_order: cat.display_order,
        is_active: cat.is_active,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        display_order: categories.length + 1,
        is_active: true,
      });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return notify('Category name is required', 'error');

    const slug = categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setActionLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryForm.name.trim(),
          slug,
          display_order: Number(categoryForm.display_order),
          is_active: categoryForm.is_active,
        });
        notify('Category updated successfully');
      } else {
        await createCategory({
          name: categoryForm.name.trim(),
          slug,
          image_url: null,
          display_order: Number(categoryForm.display_order),
          is_active: categoryForm.is_active,
        });
        notify('Category created successfully');
      }
      setShowCategoryModal(false);
      loadData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error saving category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}" and all its menu items?`)) return;
    setActionLoading(true);
    try {
      await deleteCategory(id);
      notify(`Category "${name}" deleted`);
      loadData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to delete category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Menu Item Handlers ---
  const handleOpenItemModal = (item?: MenuItemRow) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        category_id: item.category_id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        price_label: item.price_label || '',
        diet: item.diet,
        image_url: item.image_url || '',
        is_popular: item.is_popular,
        is_available: item.is_available,
        is_active: item.is_active,
        display_order: item.display_order,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        category_id: categories[0]?.id || '',
        name: '',
        description: '',
        price: 0,
        price_label: '',
        diet: 'non-veg',
        image_url: '',
        is_popular: false,
        is_available: true,
        is_active: true,
        display_order: 1,
      });
    }
    setShowItemModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { url } = await uploadRestaurantImage(file, 'menu');
      setItemForm((prev) => ({ ...prev, image_url: url }));
      notify('Image uploaded successfully');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return notify('Item name is required', 'error');
    if (!itemForm.category_id) return notify('Please select a category', 'error');
    if (itemForm.price < 0) return notify('Price must be greater than or equal to 0', 'error');

    setActionLoading(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          category_id: itemForm.category_id,
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || null,
          price: Number(itemForm.price),
          price_label: itemForm.price_label.trim() || null,
          diet: itemForm.diet,
          image_url: itemForm.image_url.trim() || null,
          is_popular: itemForm.is_popular,
          is_available: itemForm.is_available,
          is_active: itemForm.is_active,
          display_order: Number(itemForm.display_order),
        });
        notify('Menu item updated');
      } else {
        await createMenuItem({
          category_id: itemForm.category_id,
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || null,
          price: Number(itemForm.price),
          price_label: itemForm.price_label.trim() || null,
          diet: itemForm.diet,
          image_url: itemForm.image_url.trim() || null,
          is_popular: itemForm.is_popular,
          is_available: itemForm.is_available,
          is_active: itemForm.is_active,
          display_order: Number(itemForm.display_order),
        });
        notify('Menu item created');
      }
      setShowItemModal(false);
      loadData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save menu item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    try {
      await toggleItemAvailability(id, !currentVal);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === id ? { ...item, is_available: !currentVal } : item
          ),
        }))
      );
      notify(`Item marked as ${!currentVal ? 'Available' : 'Unavailable'}`);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error updating availability', 'error');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteMenuItem(id);
      notify(`Deleted "${name}"`);
      loadData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error deleting item', 'error');
    }
  };

  // --- Offers Handlers ---
  const handleOpenOfferModal = (offer?: OfferRow) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title: offer.title,
        description: offer.description || '',
        discount_tag: offer.discount_tag || '',
        start_date: offer.start_date || '',
        end_date: offer.end_date || '',
        image_url: offer.image_url || '',
        is_active: offer.is_active,
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        title: '',
        description: '',
        discount_tag: '',
        start_date: '',
        end_date: '',
        image_url: '',
        is_active: true,
      });
    }
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) return notify('Offer title is required', 'error');

    setActionLoading(true);
    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, {
          title: offerForm.title.trim(),
          description: offerForm.description.trim() || null,
          discount_tag: offerForm.discount_tag.trim() || null,
          start_date: offerForm.start_date || null,
          end_date: offerForm.end_date || null,
          image_url: offerForm.image_url.trim() || null,
          is_active: offerForm.is_active,
        });
        notify('Offer updated');
      } else {
        await createOffer({
          title: offerForm.title.trim(),
          description: offerForm.description.trim() || null,
          discount_tag: offerForm.discount_tag.trim() || null,
          start_date: offerForm.start_date || null,
          end_date: offerForm.end_date || null,
          image_url: offerForm.image_url.trim() || null,
          is_active: offerForm.is_active,
        });
        notify('Offer created');
      }
      setShowOfferModal(false);
      loadData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save offer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await deleteOffer(id);
      notify('Offer deleted');
      loadData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error deleting offer', 'error');
    }
  };

  // --- Bookings Handlers ---
  const handleBookingStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      notify(`Booking status changed to ${status}`);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error updating booking', 'error');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Delete this booking record?')) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      notify('Booking removed');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error deleting booking', 'error');
    }
  };

  // --- Contact Messages Handlers ---
  const handleMessageStatusChange = async (id: string, status: ContactMessageStatus) => {
    try {
      await updateContactMessageStatus(id, status);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
      notify(`Message marked as ${status}`);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error updating message', 'error');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this contact message?')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      notify('Message deleted');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error deleting message', 'error');
    }
  };

  // Filtered menu items
  const filteredMenuItems = allItems.filter((item) => {
    if (selectedCategoryFilter !== 'all' && item.category_id !== selectedCategoryFilter) return false;
    if (dietFilter !== 'all' && item.diet !== dietFilter) return false;
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
    }
    return true;
  });

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
    if (bookingDateFilter && b.booking_date !== bookingDateFilter) return false;
    return true;
  });

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    if (messageStatusFilter !== 'all' && m.status !== messageStatusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <AdminLayout
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        pendingOrdersCount={0}
        pendingBookingsCount={0}
        unreadMessagesCount={0}
      >
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--color-text-secondary)' }}>
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
          <p>Loading restaurant management data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      pendingOrdersCount={pendingOrders.length}
      pendingBookingsCount={pendingBookings.length}
      unreadMessagesCount={unreadMessages.length}
    >
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: notification.type === 'success' ? 'var(--color-bg-surface)' : 'rgba(229, 57, 53, 0.9)',
          border: `1px solid ${notification.type === 'success' ? 'var(--color-primary)' : 'var(--color-error)'}`,
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* ===================== 1. OVERVIEW TAB ===================== */}
      {currentTab === 'overview' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Dashboard Overview</h1>
              <p>Welcome back! Here is a summary of Surya Restaurant operations.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="primary" size="sm" onClick={() => handleSelectTab('orders')}>
                🛵 View Orders ({pendingOrders.length} pending)
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenItemModal()}>
                + Add Menu Item
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="admin-metrics-grid">
            <div className="admin-metric-card" onClick={() => handleSelectTab('orders')} style={{ cursor: 'pointer' }}>
              <div className="admin-metric-icon" style={{ backgroundColor: pendingOrders.length ? 'rgba(244, 185, 66, 0.2)' : undefined }}>
                🛵
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: pendingOrders.length ? 'var(--color-primary)' : undefined }}>
                  {pendingOrders.length}
                </span>
                <span className="admin-metric-label">Pending Orders</span>
              </div>
            </div>

            <div className="admin-metric-card" onClick={() => handleSelectTab('orders')} style={{ cursor: 'pointer' }}>
              <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                💵
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: '#22c55e' }}>₹{todayRevenue}</span>
                <span className="admin-metric-label">Today's Sales ({todayOrders.length})</span>
              </div>
            </div>

            <div className="admin-metric-card" onClick={() => handleSelectTab('menu')} style={{ cursor: 'pointer' }}>
              <div className="admin-metric-icon">🍛</div>
              <div className="admin-metric-info">
                <span className="admin-metric-value">{allItems.length}</span>
                <span className="admin-metric-label">Menu Items</span>
              </div>
            </div>

            <div className="admin-metric-card" onClick={() => handleSelectTab('categories')} style={{ cursor: 'pointer' }}>
              <div className="admin-metric-icon">📁</div>
              <div className="admin-metric-info">
                <span className="admin-metric-value">{categories.length}</span>
                <span className="admin-metric-label">Active Categories</span>
              </div>
            </div>

            <div className="admin-metric-card" onClick={() => handleSelectTab('bookings')} style={{ cursor: 'pointer' }}>
              <div className="admin-metric-icon" style={{ backgroundColor: pendingBookings.length ? 'rgba(244, 185, 66, 0.2)' : undefined }}>
                📅
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: pendingBookings.length ? 'var(--color-accent)' : undefined }}>
                  {pendingBookings.length}
                </span>
                <span className="admin-metric-label">Pending Bookings</span>
              </div>
            </div>

            <div className="admin-metric-card" onClick={() => handleSelectTab('messages')} style={{ cursor: 'pointer' }}>
              <div className="admin-metric-icon" style={{ backgroundColor: unreadMessages.length ? 'rgba(232, 114, 42, 0.2)' : undefined }}>
                ✉️
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: unreadMessages.length ? 'var(--color-primary)' : undefined }}>
                  {unreadMessages.length}
                </span>
                <span className="admin-metric-label">Unread Inquiries</span>
              </div>
            </div>
          </div>

          {/* Recent Online Orders */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="admin-section-header">
              <h2>Recent Online Orders (Cash on Delivery)</h2>
              <Button variant="outline" size="sm" onClick={() => handleSelectTab('orders')}>
                View All Orders ({orders.length})
              </Button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Delivery Area</th>
                    <th>Items</th>
                    <th>Total (COD)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} style={ord.order_status === 'pending' ? { backgroundColor: 'rgba(244, 185, 66, 0.05)' } : undefined}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{ord.order_number}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <strong>{ord.customer_name}</strong>
                        <div><a href={`tel:${ord.customer_phone}`} style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>{ord.customer_phone}</a></div>
                      </td>
                      <td style={{ maxWidth: '180px', fontSize: '0.825rem' }}>
                        {ord.delivery_address}
                      </td>
                      <td>{ord.items.length} items</td>
                      <td>
                        <strong style={{ color: '#22c55e' }}>₹{ord.total_amount}</strong>
                        <span className="order-cod-tag">COD</span>
                      </td>
                      <td>
                        <span className={`admin-badge badge-${ord.order_status}`}>
                          {ord.order_status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedOrder(ord);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No orders received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Pending Bookings */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="admin-section-header">
              <h2>Pending Table Bookings</h2>
              <Button variant="outline" size="sm" onClick={() => handleSelectTab('bookings')}>
                View All Bookings ({bookings.length})
              </Button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Date & Time</th>
                    <th>Guests</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.customer_name}</strong></td>
                      <td>
                        <a href={`tel:${b.phone}`} style={{ color: 'var(--color-accent)' }}>{b.phone}</a>
                      </td>
                      <td>{b.booking_date} at {b.booking_time}</td>
                      <td>{b.guests} Guests</td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-icon success"
                            onClick={() => handleBookingStatusChange(b.id, 'confirmed')}
                            title="Confirm Booking"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleBookingStatusChange(b.id, 'cancelled')}
                            title="Cancel Booking"
                          >
                            ✕ Cancel
                          </button>
                          <a
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${b.customer_name}, regarding your reservation at Surya Restaurant for ${b.booking_date}...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-icon"
                            title="Message on WhatsApp"
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                        No pending booking requests. All caught up!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ORDERS TAB ===================== */}
      {currentTab === 'orders' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Online Orders Management</h1>
              <p>Manage customer delivery orders, kitchen progress, and Cash on Delivery collection.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setActionLoading(true);
                  const ords = await fetchAdminOrders();
                  setOrders(ords);
                  setActionLoading(false);
                  notify('Orders refreshed');
                }}
              >
                ↻ Refresh
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleSelectTab('settings')}>
                ⚙️ Ordering Settings
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="admin-metrics-grid">
            <div className="admin-metric-card" style={{ borderColor: pendingOrders.length ? 'var(--color-primary)' : undefined }}>
              <div className="admin-metric-icon" style={{ background: 'rgba(244, 185, 66, 0.2)' }}>
                ⏳
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: '#f4b942' }}>{pendingOrders.length}</span>
                <span className="admin-metric-label">Pending Orders</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-icon" style={{ background: 'rgba(232, 114, 42, 0.2)' }}>
                🍳
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value">
                  {orders.filter((o) => o.order_status === 'confirmed' || o.order_status === 'preparing').length}
                </span>
                <span className="admin-metric-label">In Kitchen</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-icon" style={{ background: 'rgba(234, 88, 12, 0.2)' }}>
                🛵
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: '#fb923c' }}>
                  {orders.filter((o) => o.order_status === 'out_for_delivery' || o.order_status === 'ready').length}
                </span>
                <span className="admin-metric-label">Ready & Out</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                💵
              </div>
              <div className="admin-metric-info">
                <span className="admin-metric-value" style={{ color: '#22c55e' }}>₹{todayRevenue}</span>
                <span className="admin-metric-label">Today's Sales ({todayOrders.length} orders)</span>
              </div>
            </div>
          </div>

          {/* Controls / Filter Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search Order #, Customer, Phone, Address..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{ width: '280px' }}
              />
              {orderSearch && (
                <button
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                  onClick={() => setOrderSearch('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Status:</span>
              {(['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'] as const).map(
                (st) => (
                  <button
                    key={st}
                    className={`btn-chip ${orderStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter(st)}
                  >
                    {st === 'all' ? 'All' : st === 'out_for_delivery' ? 'Out' : st}
                  </button>
                )
              )}

              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>Date:</span>
              {(['all', 'today', 'yesterday'] as const).map((d) => (
                <button
                  key={d}
                  className={`btn-chip ${orderDateFilter === d ? 'active' : ''}`}
                  onClick={() => setOrderDateFilter(d)}
                >
                  {d === 'all' ? 'All Dates' : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer & Contact</th>
                  <th>Delivery Address</th>
                  <th>Items</th>
                  <th>Total (COD)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={order.order_status === 'pending' ? { backgroundColor: 'rgba(244, 185, 66, 0.05)' } : undefined}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                        {order.order_number}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <div>
                        <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--color-accent)', fontSize: '0.825rem' }}>
                          📞 {order.customer_phone}
                        </a>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customer_email}</span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.825rem', lineHeight: 1.3 }}>
                        {order.delivery_address}
                        {order.landmark && <span style={{ color: '#fbbf24' }}> (Near {order.landmark})</span>}
                        <div><small style={{ color: 'var(--color-text-muted)' }}>PIN: {order.pincode}</small></div>
                      </div>
                      {order.customer_notes && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', fontStyle: 'italic' }}>
                          Note: "{order.customer_notes}"
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <div className="order-items-snippet">
                        {order.items.map((it) => (
                          <div key={it.id}>
                            {it.item_name} × {it.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="order-price-highlight">₹{order.total_amount}</span>
                      <div>
                        <span className="order-cod-tag">COD</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                          (₹{order.subtotal} + ₹{order.delivery_fee})
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge badge-${order.order_status}`}>
                        {order.order_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                        {order.order_status === 'pending' && (
                          <button
                            className="order-progress-btn confirm"
                            onClick={() => handleRequestStatusChange(order.id, 'confirmed', order.order_number)}
                          >
                            ✓ Confirm
                          </button>
                        )}
                        {order.order_status === 'confirmed' && (
                          <button
                            className="order-progress-btn prepare"
                            onClick={() => handleRequestStatusChange(order.id, 'preparing', order.order_number)}
                          >
                            🍳 Prepare
                          </button>
                        )}
                        {order.order_status === 'preparing' && (
                          <button
                            className="order-progress-btn ready"
                            onClick={() => handleRequestStatusChange(order.id, 'ready', order.order_number)}
                          >
                            📦 Ready
                          </button>
                        )}
                        {order.order_status === 'ready' && (
                          <button
                            className="order-progress-btn deliver"
                            onClick={() => handleRequestStatusChange(order.id, 'out_for_delivery', order.order_number)}
                          >
                            🛵 Out
                          </button>
                        )}
                        {order.order_status === 'out_for_delivery' && (
                          <button
                            className="order-progress-btn done"
                            onClick={() => handleRequestStatusChange(order.id, 'delivered', order.order_number)}
                          >
                            ✓ Delivered
                          </button>
                        )}
                        <button className="btn-icon" onClick={() => setSelectedOrder(order)}>
                          🧾 Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      No orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 2. CATEGORIES TAB ===================== */}
      {currentTab === 'categories' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Categories Management</h1>
              <p>Organize your menu categories and their display sequence.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenCategoryModal()}>
              + Add Category
            </Button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Items Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>#{cat.display_order}</td>
                    <td><strong>{cat.name}</strong></td>
                    <td><code>{cat.slug}</code></td>
                    <td>{cat.items.length} items</td>
                    <td>
                      <label className="admin-toggle">
                        <input
                          type="checkbox"
                          checked={cat.is_active}
                          onChange={async () => {
                            try {
                              await updateCategory(cat.id, { is_active: !cat.is_active });
                              loadData();
                              notify(`Category ${!cat.is_active ? 'Activated' : 'Deactivated'}`);
                            } catch (err: unknown) {
                              notify(err instanceof Error ? err.message : 'Error updating category', 'error');
                            }
                          }}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button className="btn-icon" onClick={() => handleOpenCategoryModal(cat)}>
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 3. MENU ITEMS TAB ===================== */}
      {currentTab === 'menu' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Menu Items</h1>
              <p>Add, edit prices, update availability, or upload photos of your dishes.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenItemModal()}>
              + Add New Item
            </Button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search food by name..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />
              {menuSearch && (
                <button onClick={() => setMenuSearch('')} style={{ color: 'var(--color-text-muted)' }}>
                  ✕
                </button>
              )}
            </div>

            <div className="admin-filters">
              <select
                className="admin-select"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories ({allItems.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.items.length})
                  </option>
                ))}
              </select>

              <select
                className="admin-select"
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
              >
                <option value="all">All Diets</option>
                <option value="veg">🟢 Veg</option>
                <option value="non-veg">🔴 Non-Veg</option>
                <option value="egg">🟡 Egg</option>
              </select>
            </div>
          </div>

          {/* Menu Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Diet</th>
                  <th>Available</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  return (
                    <tr key={item.id} style={{ opacity: item.is_available ? 1 : 0.6 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={`diet-indicator ${item.diet}`} />
                          <div>
                            <strong>{item.name}</strong>
                            {item.is_popular && (
                              <span style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.7rem',
                                backgroundColor: 'rgba(232, 114, 42, 0.2)',
                                color: 'var(--color-primary)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '3px',
                              }}>
                                Popular
                              </span>
                            )}
                            {item.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{cat?.name || 'Uncategorized'}</td>
                      <td>
                        <strong>₹{item.price_label || item.price}</strong>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{item.diet}</span>
                      </td>
                      <td>
                        <label className="admin-toggle" title="Toggle availability">
                          <input
                            type="checkbox"
                            checked={item.is_available}
                            onChange={() => handleToggleAvailability(item.id, item.is_available)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </td>
                      <td>
                        <label className="admin-toggle" title="Toggle active status">
                          <input
                            type="checkbox"
                            checked={item.is_active}
                            onChange={async () => {
                              try {
                                await updateMenuItem(item.id, { is_active: !item.is_active });
                                loadData();
                                notify(`Item ${!item.is_active ? 'Activated' : 'Deactivated'}`);
                              } catch (err: unknown) {
                                notify(err instanceof Error ? err.message : 'Error updating item', 'error');
                              }
                            }}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="btn-icon" onClick={() => handleOpenItemModal(item)}>
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMenuItems.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                      No dishes match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 4. OFFERS TAB ===================== */}
      {currentTab === 'offers' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Offers & Promotions</h1>
              <p>Manage customer discounts, festive specials, and combo promotions.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenOfferModal()}>
              + Add Promotion
            </Button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Tag / Discount</th>
                  <th>Description</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td><strong>{offer.title}</strong></td>
                    <td>
                      {offer.discount_tag && (
                        <span style={{
                          backgroundColor: 'rgba(244, 185, 66, 0.2)',
                          color: 'var(--color-accent)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                        }}>
                          {offer.discount_tag}
                        </span>
                      )}
                    </td>
                    <td style={{ maxWidth: '300px' }}>{offer.description || '—'}</td>
                    <td>
                      {offer.start_date || offer.end_date ? (
                        <span>{offer.start_date || 'Ongoing'} to {offer.end_date || 'Indefinite'}</span>
                      ) : (
                        <span>Always Active</span>
                      )}
                    </td>
                    <td>
                      <label className="admin-toggle">
                        <input
                          type="checkbox"
                          checked={offer.is_active}
                          onChange={async () => {
                            try {
                              await updateOffer(offer.id, { is_active: !offer.is_active });
                              loadData();
                              notify(`Offer ${!offer.is_active ? 'Activated' : 'Deactivated'}`);
                            } catch (err: unknown) {
                              notify(err instanceof Error ? err.message : 'Error updating offer', 'error');
                            }
                          }}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button className="btn-icon" onClick={() => handleOpenOfferModal(offer)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-icon danger" onClick={() => handleDeleteOffer(offer.id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {offers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                      No promotions created yet. Click "+ Add Promotion" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 5. BOOKINGS TAB ===================== */}
      {currentTab === 'bookings' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Table Reservations</h1>
              <p>Review customer booking requests, confirm dates, and contact diners.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="admin-toolbar">
            <div className="admin-filters">
              <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Status:</label>
              <select
                className="admin-select"
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
              >
                <option value="all">All Bookings ({bookings.length})</option>
                <option value="pending">⏳ Pending ({pendingBookings.length})</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="cancelled">✕ Cancelled</option>
              </select>

              <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginLeft: '1rem' }}>
                Date:
              </label>
              <input
                type="date"
                className="admin-select"
                value={bookingDateFilter}
                onChange={(e) => setBookingDateFilter(e.target.value)}
              />
              {bookingDateFilter && (
                <button
                  className="btn-icon"
                  onClick={() => setBookingDateFilter('')}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Special Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.customer_name}</strong></td>
                    <td>
                      <div>
                        <a href={`tel:${b.phone}`} style={{ color: 'var(--color-accent)' }}>📞 {b.phone}</a>
                      </div>
                    </td>
                    <td>
                      <strong>{b.booking_date}</strong>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{b.booking_time}</div>
                    </td>
                    <td>{b.guests} Guests</td>
                    <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {b.message || '—'}
                    </td>
                    <td>
                      <span className={`status-pill ${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {b.status !== 'confirmed' && (
                          <button
                            className="btn-icon success"
                            onClick={() => handleBookingStatusChange(b.id, 'confirmed')}
                          >
                            ✓ Confirm
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            className="btn-icon danger"
                            onClick={() => handleBookingStatusChange(b.id, 'cancelled')}
                          >
                            ✕ Cancel
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${b.customer_name}, regarding your table booking for ${b.guests} guests on ${b.booking_date} at ${b.booking_time} at Surya Restaurant...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon"
                          title="WhatsApp"
                        >
                          💬 Chat
                        </a>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteBooking(b.id)}
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                      No table reservations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 6. CONTACT MESSAGES TAB ===================== */}
      {currentTab === 'messages' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Customer Inquiries</h1>
              <p>Messages submitted through the public website contact form.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="admin-toolbar">
            <div className="admin-filters">
              <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Filter:</label>
              <select
                className="admin-select"
                value={messageStatusFilter}
                onChange={(e) => setMessageStatusFilter(e.target.value)}
              >
                <option value="all">All Inquiries ({messages.length})</option>
                <option value="unread">📬 Unread ({unreadMessages.length})</option>
                <option value="read">👁️ Read</option>
                <option value="resolved">✓ Resolved</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Contact Details</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>
                      <div>{m.phone && <a href={`tel:${m.phone}`} style={{ color: 'var(--color-accent)' }}>📞 {m.phone}</a>}</div>
                      <div>{m.email && <a href={`mailto:${m.email}`} style={{ color: 'var(--color-primary)' }}>✉️ {m.email}</a>}</div>
                    </td>
                    <td style={{ maxWidth: '350px' }}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-pill ${m.status}`}>{m.status}</span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {m.status === 'unread' && (
                          <button
                            className="btn-icon"
                            onClick={() => handleMessageStatusChange(m.id, 'read')}
                          >
                            Mark Read
                          </button>
                        )}
                        {m.status !== 'resolved' && (
                          <button
                            className="btn-icon success"
                            onClick={() => handleMessageStatusChange(m.id, 'resolved')}
                          >
                            ✓ Resolve
                          </button>
                        )}
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteMessage(m.id)}
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                      No messages matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== SETTINGS TAB ===================== */}
      {currentTab === 'settings' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h1>Restaurant Ordering Settings</h1>
              <p>Configure delivery fees, minimum order amounts, and notification settings dynamically without code changes.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={actionLoading}
              onClick={handleSaveSettings}
            >
              {actionLoading ? 'Saving...' : '💾 Save Settings'}
            </Button>
          </div>

          <form id="restaurant-settings-form" onSubmit={handleSaveSettings}>
            <div className="settings-form-grid">
              {/* Online Ordering Controls */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3><span>📱</span> Online Ordering Service</h3>
                </div>

                <div className="settings-toggle-row">
                  <div className="settings-toggle-label">
                    <strong>Accept Online Orders</strong>
                    <span>Allow customers to place orders from the website</span>
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

                <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                  <label>Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={settingsForm.min_order_amount}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, min_order_amount: Number(e.target.value) })
                    }
                  />
                  <small style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Orders below this subtotal will be blocked with a prompt to add more items. (Current: ₹{settingsForm.min_order_amount})
                  </small>
                </div>
              </div>

              {/* Delivery Fee & Area Controls */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3><span>🛵</span> Delivery & Charges</h3>
                </div>

                <div className="settings-toggle-row">
                  <div className="settings-toggle-label">
                    <strong>Enable Home Delivery</strong>
                    <span>Accept delivery orders at customer doorstep</span>
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

                <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                  <label>Delivery Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    required
                    value={settingsForm.delivery_fee}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) })
                    }
                  />
                  <small style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Currently set to ₹{settingsForm.delivery_fee}. Changing this updates all customer checkouts immediately.
                  </small>
                </div>

                <div className="admin-form-group">
                  <label>Delivery Radius (Approx KM)</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    step={0.5}
                    required
                    value={settingsForm.delivery_radius_km}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, delivery_radius_km: Number(e.target.value) })
                    }
                  />
                  <small style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Initial delivery radius around Ambattur (Default: 3.0 KM).
                  </small>
                </div>
              </div>

              {/* Notifications Controls */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3><span>✉️</span> Notifications</h3>
                </div>

                <div className="admin-form-group">
                  <label>Restaurant Order Alert Email</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.restaurant_email}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, restaurant_email: e.target.value })
                    }
                  />
                  <small style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Staff notification email address to receive incoming order details.
                  </small>
                </div>

                <div className="settings-toggle-row">
                  <div className="settings-toggle-label">
                    <strong>Customer Email Receipts</strong>
                    <span>Send confirmation and status update emails to customers</span>
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
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={actionLoading}
                onClick={handleSaveSettings}
              >
                {actionLoading ? 'Saving...' : '💾 Save Restaurant Settings'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* Status Change Confirmation Modal */}
      {statusConfirmModal && (
        <div className="admin-modal-overlay" onClick={() => setStatusConfirmModal(null)}>
          <div className="admin-modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Confirm Status Change</h2>
              <button className="admin-modal-close" onClick={() => setStatusConfirmModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                Are you sure you want to mark Order{' '}
                <strong style={{ color: 'var(--color-primary)' }}>
                  {statusConfirmModal.orderNumber}
                </strong>{' '}
                as{' '}
                <strong style={{ color: 'var(--color-accent)' }}>
                  {statusConfirmModal.label}
                </strong>?
              </p>
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                This will update the live customer order tracking timeline and trigger an email notification.
              </p>
            </div>
            <div className="admin-modal-footer">
              <Button variant="ghost" size="sm" onClick={() => setStatusConfirmModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmStatusChange} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : `Confirm: Mark as ${statusConfirmModal.label}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Kitchen Ticket Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Order #{selectedOrder.order_number} Details</h2>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`admin-badge badge-${selectedOrder.order_status}`} style={{ fontSize: '0.85rem' }}>
                  {selectedOrder.order_status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--color-primary)' }}>Customer & Delivery</h4>
                <div><strong>{selectedOrder.customer_name}</strong></div>
                <div>Phone: <a href={`tel:${selectedOrder.customer_phone}`} style={{ color: 'var(--color-accent)' }}>{selectedOrder.customer_phone}</a></div>
                <div>Email: {selectedOrder.customer_email}</div>
                <div style={{ marginTop: '4px' }}>Address: {selectedOrder.delivery_address}{selectedOrder.landmark ? ` (Near ${selectedOrder.landmark})` : ''} - {selectedOrder.pincode}</div>
                {selectedOrder.customer_notes && (
                  <div style={{ color: '#fbbf24', marginTop: '6px', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Note from customer: "{selectedOrder.customer_notes}"
                  </div>
                )}
              </div>

              <table className="admin-table" style={{ marginTop: '12px' }}>
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.item_name}</td>
                      <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₹{it.item_price}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{it.line_total}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>Food Subtotal:</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{selectedOrder.subtotal}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>Delivery Fee:</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{selectedOrder.delivery_fee}</td>
                  </tr>
                  <tr style={{ background: 'rgba(232, 114, 42, 0.1)' }}>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)' }}>
                      Grand Total (Cash to Collect):
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₹{selectedOrder.total_amount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="admin-modal-footer">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                🖨️ Print Ticket / Invoice
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Category Modal */}
      {showCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button className="admin-modal-close" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Non-Veg Starters"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Slug (URL key)</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="non-veg-starters (auto-generated if blank)"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })}
                    min={1}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span>Category is active and visible to public</span>
                </div>
              </div>

              <div className="admin-modal-footer">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Menu Item Modal */}
      {showItemModal && (
        <div className="admin-modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingItem ? `Edit ${editingItem.name}` : 'Add Menu Item'}</h2>
              <button className="admin-modal-close" onClick={() => setShowItemModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    className="admin-select"
                    required
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. Chicken Lollipop"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="1"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Price Label (Optional)</label>
                    <input
                      type="text"
                      value={itemForm.price_label}
                      onChange={(e) => setItemForm({ ...itemForm, price_label: e.target.value })}
                      placeholder="e.g. 129 / 249 / 449"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Dietary Type *</label>
                  <select
                    className="admin-select"
                    value={itemForm.diet}
                    onChange={(e) => setItemForm({ ...itemForm, diet: e.target.value as DietType })}
                  >
                    <option value="veg">🟢 Veg</option>
                    <option value="non-veg">🔴 Non-Veg</option>
                    <option value="egg">🟡 Egg</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Flavor profile, preparation style, ingredients..."
                  />
                </div>

                {/* Image Upload / Preview */}
                <div className="admin-form-group">
                  <label>Dish Image (Supabase Storage)</label>
                  {itemForm.image_url ? (
                    <div style={{ position: 'relative', textAlign: 'center', marginBottom: '0.5rem' }}>
                      <img
                        src={itemForm.image_url}
                        alt="Preview"
                        className="admin-image-preview"
                      />
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, image_url: '' })}
                        className="btn-icon danger"
                        style={{ marginTop: '0.5rem' }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="admin-image-upload-box">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        id="menu-item-photo"
                        style={{ display: 'none' }}
                        onChange={handleImageFileChange}
                      />
                      <label htmlFor="menu-item-photo" style={{ cursor: 'pointer', display: 'block' }}>
                        <span style={{ fontSize: '2rem' }}>📸</span>
                        <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                          {uploadingImage ? 'Uploading to Supabase Storage...' : 'Click to upload WebP/JPG/PNG (Max 2MB)'}
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={itemForm.is_available}
                        onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.875rem' }}>Available to order</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={itemForm.is_popular}
                        onChange={(e) => setItemForm({ ...itemForm, is_popular: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.875rem' }}>Featured / Popular</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={itemForm.is_active}
                        onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.875rem' }}>Active</span>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowItemModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={actionLoading || uploadingImage}>
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Offer Modal */}
      {showOfferModal && (
        <div className="admin-modal-overlay" onClick={() => setShowOfferModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingOffer ? 'Edit Promotion' : 'New Promotion'}</h2>
              <button className="admin-modal-close" onClick={() => setShowOfferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveOffer}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Offer Title *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder="e.g. Weekend Biryani Feast"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Discount Tag (Badge)</label>
                  <input
                    type="text"
                    value={offerForm.discount_tag}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_tag: e.target.value })}
                    placeholder="e.g. 15% OFF or CHEF SPECIAL"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                    placeholder="Promotion details, terms, minimum spend..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={offerForm.start_date}
                      onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={offerForm.end_date}
                      onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={offerForm.is_active}
                      onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span>Active promotion visible on website</span>
                </div>
              </div>

              <div className="admin-modal-footer">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowOfferModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingOffer ? 'Save Changes' : 'Create Promotion'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
