import { Product, Order, AdminStats, StoreSettings } from '../types';

const ADMIN_TOKEN_KEY = 'aroyal_admin_session_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Public API
export async function getProducts(category?: string): Promise<Product[]> {
  const url = category && category !== 'All' 
    ? `/api/products?category=${encodeURIComponent(category)}`
    : '/api/products';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function placeOrder(orderData: {
  customer: Order['customer'];
  items: { productId: string; quantity: number }[];
  paymentMethod: Order['paymentMethod'];
}): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to place order');
  }
  return data;
}

export async function trackOrder(query: string): Promise<Order> {
  const res = await fetch(`/api/orders/track/${encodeURIComponent(query.trim())}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Order not found');
  }
  return data;
}

// Admin API
export async function adminLogin(password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }

  setAdminToken(data.token);
  return data;
}

export async function checkAdminAuth(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify', {
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function getAdminOrders(status?: string, search?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.append('status', status);
  if (search) params.append('search', search);

  const res = await fetch(`/api/admin/orders?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, paymentStatus })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order status');
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete order');
}

export async function addProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add product');
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data;
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const res = await fetch('/api/admin/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newPassword })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
}

export async function sendTestEmail(email?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/admin/test-email', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send test email');
  return data;
}

export async function resendOrderEmail(orderId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to resend order email');
  return data;
}

