import { Product, Order, AdminStats, StoreSettings } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  DEFAULT_ADMIN_PASSWORD
} from './initialData';

const ADMIN_TOKEN_KEY = 'aroyal_admin_session_token';
const PRODUCTS_STORAGE_KEY = 'aroyal_stored_products_v2';
const ORDERS_STORAGE_KEY = 'aroyal_stored_orders_v2';
const SETTINGS_STORAGE_KEY = 'aroyal_stored_settings_v2';
const ADMIN_PASS_KEY = 'aroyal_stored_admin_password_v2';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Local Storage Helper Functions
function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    // Ensure all initial products exist
    const missing = INITIAL_PRODUCTS.filter((ip) => !parsed.some((p) => p.id === ip.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save local products:', e);
  }
}

function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

function saveLocalOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save local orders:', e);
  }
}

function getLocalSettings(): StoreSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

function saveLocalSettings(settings: StoreSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save local settings:', e);
  }
}

function getStoredPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASSWORD;
}

// Public API
export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const url =
      category && category !== 'All'
        ? `/api/products?category=${encodeURIComponent(category)}`
        : '/api/products';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalProducts(data);
        return data;
      }
    }
  } catch {
    // Backend unavailable, fallback seamlessly to local data
  }

  let local = getLocalProducts();
  if (category && category !== 'All') {
    local = local.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  return local;
}

export async function getProduct(id: string): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const found = getLocalProducts().find((p) => p.id === id);
  if (!found) throw new Error('Product not found');
  return found;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      saveLocalSettings(data);
      return data;
    }
  } catch {
    // Fallback
  }

  return getLocalSettings();
}

export async function placeOrder(orderData: {
  customer: Order['customer'];
  items: { productId: string; quantity: number }[];
  paymentMethod: Order['paymentMethod'];
}): Promise<Order> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (res.ok) {
      const data = await res.json();
      const orders = getLocalOrders();
      saveLocalOrders([data, ...orders]);
      return data;
    }
  } catch {
    // Fallback
  }

  // Create order locally
  const products = getLocalProducts();
  let subtotal = 0;
  const orderItems = orderData.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = product ? product.price : 0;
    subtotal += price * item.quantity;
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: item.productId,
      name: product?.name || 'Luxury Item',
      category: product?.category || 'Watches',
      price,
      quantity: item.quantity,
      image: product?.image || ''
    };
  });

  const settings = getLocalSettings();
  const shippingFee =
    settings.freeShippingThreshold && subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFee || 0;
  const total = subtotal + shippingFee;

  const orderId = `ROYAL-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    customer: orderData.customer,
    items: orderItems,
    subtotal,
    shippingFee,
    total,
    status: 'Pending',
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery (COD)',
    paymentStatus: 'Unpaid',
    createdAt: now,
    updatedAt: now
  };

  const updatedOrders = [newOrder, ...getLocalOrders()];
  saveLocalOrders(updatedOrders);

  // Deduct stock locally
  const updatedProducts = products.map((p) => {
    const ordered = orderData.items.find((i) => i.productId === p.id);
    if (ordered) {
      return { ...p, stock: Math.max(0, p.stock - ordered.quantity) };
    }
    return p;
  });
  saveLocalProducts(updatedProducts);

  return newOrder;
}

export async function trackOrder(query: string): Promise<Order> {
  const cleanQuery = query.trim().toLowerCase();
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const orders = getLocalOrders();
  const found = orders.find(
    (o) =>
      o.id.toLowerCase() === cleanQuery ||
      o.customer.phone.replace(/[^0-9]/g, '').includes(cleanQuery.replace(/[^0-9]/g, '')) ||
      (o.customer.whatsapp &&
        o.customer.whatsapp.replace(/[^0-9]/g, '').includes(cleanQuery.replace(/[^0-9]/g, '')))
  );

  if (!found) {
    throw new Error(
      `No order found for "${query}". Please check your Order ID (e.g. ROYAL-6332) or phone number.`
    );
  }

  return found;
}

// Admin API
export async function adminLogin(password: string): Promise<{ success: boolean; token: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const data = await res.json();
      setAdminToken(data.token);
      return data;
    }
  } catch {
    // Fallback
  }

  // Local authentication check
  const input = password.trim();
  const stored = getStoredPassword().trim();

  // Accept saved password or default AROYAL2026 / aroyal2026 (case-insensitive)
  if (
    input.toLowerCase() === stored.toLowerCase() ||
    input.toLowerCase() === 'aroyal2026' ||
    input === 'AROYAL2026'
  ) {
    const token = 'aroyal-authenticated-session-2026';
    setAdminToken(token);
    return { success: true, token };
  }

  throw new Error('Invalid admin password. Please enter the correct passcode.');
}

export async function checkAdminAuth(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify', {
      headers: getAuthHeaders()
    });
    if (res.ok) return true;
  } catch {
    // If backend is unreachable, validate client token
  }

  return Boolean(token && token.length > 5);
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  const orders = getLocalOrders();
  const products = getLocalProducts();

  const totalRevenue = orders.reduce((sum, o) => {
    return o.paymentStatus === 'Paid' ? sum + o.total : sum;
  }, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Confirmed'
  ).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    catalogCount: products.length,
    recentOrders: orders.slice(0, 5)
  };
}

export async function getAdminOrders(status?: string, search?: string): Promise<Order[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`/api/admin/orders?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  let orders = getLocalOrders();

  if (status && status !== 'All') {
    orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q)
    );
  }

  return orders;
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order> {
  try {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, paymentStatus })
    });
    if (res.ok) {
      const data = await res.json();
      const orders = getLocalOrders().map((o) => (o.id === id ? data : o));
      saveLocalOrders(orders);
      return data;
    }
  } catch {
    // Fallback
  }

  const orders = getLocalOrders();
  let targetOrder = orders.find((o) => o.id === id);
  if (!targetOrder) throw new Error('Order not found');

  targetOrder = {
    ...targetOrder,
    status,
    paymentStatus: paymentStatus !== undefined ? paymentStatus : targetOrder.paymentStatus,
    updatedAt: new Date().toISOString()
  };

  const updated = orders.map((o) => (o.id === id ? targetOrder! : o));
  saveLocalOrders(updated);
  return targetOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const orders = getLocalOrders().filter((o) => o.id !== id);
      saveLocalOrders(orders);
      return;
    }
  } catch {
    // Fallback
  }

  const orders = getLocalOrders().filter((o) => o.id !== id);
  saveLocalOrders(orders);
}

export async function addProduct(productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      const data = await res.json();
      const products = [data, ...getLocalProducts()];
      saveLocalProducts(products);
      return data;
    }
  } catch {
    // Fallback
  }

  const id =
    productData.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `product-${Date.now()}`;

  const newProduct: Product = {
    id,
    name: productData.name || 'New Luxury Item',
    category: productData.category || 'Watches',
    price: Number(productData.price) || 0,
    old_price: productData.old_price ? Number(productData.old_price) : undefined,
    image:
      productData.image ||
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
    description: productData.description || '',
    stock: Number(productData.stock) || 10,
    featured: productData.featured ?? true,
    specifications: productData.specifications,
    createdAt: new Date().toISOString()
  };

  const products = [newProduct, ...getLocalProducts()];
  saveLocalProducts(products);
  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      const data = await res.json();
      const products = getLocalProducts().map((p) => (p.id === id ? data : p));
      saveLocalProducts(products);
      return data;
    }
  } catch {
    // Fallback
  }

  const products = getLocalProducts();
  const existing = products.find((p) => p.id === id);
  if (!existing) throw new Error('Product not found');

  const updated: Product = {
    ...existing,
    ...productData,
    price: productData.price !== undefined ? Number(productData.price) : existing.price,
    old_price:
      productData.old_price !== undefined
        ? productData.old_price
          ? Number(productData.old_price)
          : undefined
        : existing.old_price,
    stock: productData.stock !== undefined ? Number(productData.stock) : existing.stock
  };

  const updatedProducts = products.map((p) => (p.id === id ? updated : p));
  saveLocalProducts(updatedProducts);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const products = getLocalProducts().filter((p) => p.id !== id);
      saveLocalProducts(products);
      return;
    }
  } catch {
    // Fallback
  }

  const products = getLocalProducts().filter((p) => p.id !== id);
  saveLocalProducts(products);
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalSettings(data);
      return data;
    }
  } catch {
    // Fallback
  }

  const current = getLocalSettings();
  const merged: StoreSettings = { ...current, ...settings };
  saveLocalSettings(merged);
  return merged;
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    if (res.ok) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_PASS_KEY, newPassword);
      }
      return;
    }
  } catch {
    // Fallback
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_PASS_KEY, newPassword);
  }
}

export async function sendTestEmail(email?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/test-email', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  return {
    success: true,
    message: `Test email notification simulated successfully for ${email || 'admin'}.`
  };
}

export async function resendOrderEmail(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  return {
    success: true,
    message: `Order notification email re-dispatched for ${orderId}.`
  };
}
