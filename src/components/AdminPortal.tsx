import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Eye,
  X,
  KeyRound,
  DollarSign,
  ChevronRight,
  Sparkles,
  Printer,
  Mail
} from 'lucide-react';
import { Product, Order, AdminStats, StoreSettings, OrderStatus } from '../types';
import {
  adminLogin,
  checkAdminAuth,
  clearAdminToken,
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getStoreSettings,
  updateStoreSettings,
  changeAdminPassword,
  sendTestEmail,
  resendOrderEmail
} from '../lib/api';

interface AdminPortalProps {
  onBackToStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStore }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings'>('dashboard');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Selected Order for Full Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product Add / Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Watches' as Product['category'],
    price: '',
    old_price: '',
    stock: '10',
    image: '',
    description: '',
    featured: true,
    specifications: ''
  });

  // Password Change
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<string | null>(null);

  // Email Alerts
  const [emailActionMsg, setEmailActionMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  const handleSendTestEmail = async () => {
    setEmailSending(true);
    setEmailActionMsg(null);
    try {
      const res = await sendTestEmail(settings?.adminEmail || 'wahab.nadeem6040@gmail.com');
      setEmailActionMsg({ text: res.message, success: true });
    } catch (err: any) {
      setEmailActionMsg({ text: err.message || 'Failed to dispatch test email', success: false });
    } finally {
      setEmailSending(false);
    }
  };

  const handleResendOrderEmail = async (orderId: string) => {
    setEmailSending(true);
    setEmailActionMsg(null);
    try {
      const res = await resendOrderEmail(orderId);
      setEmailActionMsg({ text: res.message, success: true });
    } catch (err: any) {
      setEmailActionMsg({ text: err.message || 'Failed to dispatch order email alert', success: false });
    } finally {
      setEmailSending(false);
    }
  };

  // Check existing token on mount
  useEffect(() => {
    checkAdminAuth().then((authed) => {
      setIsAuthenticated(authed);
      if (authed) {
        refreshAllData();
      }
    });
  }, []);

  const refreshAllData = async () => {
    setLoadingData(true);
    try {
      const [statsData, ordersData, productsData, settingsData] = await Promise.all([
        getAdminStats(),
        getAdminOrders(),
        getProducts(),
        getStoreSettings()
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      await adminLogin(passwordInput);
      setIsAuthenticated(true);
      setPasswordInput('');
      await refreshAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect admin password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
  };

  // Order Status update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      // Refresh stats in background
      getAdminStats().then(setStats);
    } catch (err: any) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  // Payment Status update
  const handlePaymentStatusChange = async (orderId: string, newPayStatus: 'Paid' | 'Unpaid') => {
    try {
      const current = orders.find((o) => o.id === orderId);
      if (!current) return;
      const updated = await updateOrderStatus(orderId, current.status, newPayStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(`Error updating payment status: ${err.message}`);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete Order ${orderId}? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      getAdminStats().then(setStats);
    } catch (err: any) {
      alert(`Error deleting order: ${err.message}`);
    }
  };

  // Stock Quick Increment/Decrement
  const handleStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const updated = await updateProduct(product.id, { stock: newStock });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      getAdminStats().then(setStats);
    } catch (err: any) {
      alert(`Error adjusting stock: ${err.message}`);
    }
  };

  // Open Product Modal (New or Edit)
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        old_price: product.old_price ? product.old_price.toString() : '',
        stock: product.stock.toString(),
        image: product.image,
        description: product.description,
        featured: product.featured,
        specifications: product.specifications
          ? Object.entries(product.specifications)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n')
          : ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'Watches',
        price: '',
        old_price: '',
        stock: '10',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
        description: '',
        featured: false,
        specifications: 'Case: 42mm Steel\nMovement: Precision Quartz\nGlass: Sapphire Crystal'
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse specifications text into key-value map
    const specsMap: Record<string, string> = {};
    if (productForm.specifications) {
      productForm.specifications.split('\n').forEach((line) => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          if (key && val) specsMap[key] = val;
        }
      });
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      old_price: productForm.old_price ? Number(productForm.old_price) : undefined,
      stock: Number(productForm.stock) || 0,
      image: productForm.image.trim(),
      description: productForm.description.trim(),
      featured: productForm.featured,
      specifications: specsMap
    };

    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        const created = await addProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setProductModalOpen(false);
      getAdminStats().then(setStats);
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from store catalog?`)) {
      return;
    }
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      getAdminStats().then(setStats);
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPasswordChangeMsg('Password must be at least 4 characters');
      return;
    }
    try {
      await changeAdminPassword(newPassword);
      setPasswordChangeMsg('Admin password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordChangeMsg(null), 3000);
    } catch (err: any) {
      setPasswordChangeMsg(err.message || 'Failed to change password');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      orderStatusFilter === 'All' ||
      order.status.toLowerCase() === orderStatusFilter.toLowerCase();

    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.phone.includes(q) ||
      order.customer.city.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // If Not Authenticated, show Dedicated Luxury Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#2b2b2b]/20 shadow-2xl p-8 sm:p-10 rounded-sm">
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 bg-[#151515] text-[#c9ad79] rounded-full flex items-center justify-center mx-auto shadow-lg border border-[#c9ad79]/30">
              <Lock className="w-6 h-6 text-[#c9ad79]" />
            </div>
            <p className="eyebrow !text-[11px] text-[#8b7650] font-bold">A.ROYAL Executive</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">Admin Portal</h2>
            <p className="text-xs text-[#666] leading-relaxed">
              Restricted management console to oversee real orders, catalog inventory, and store
              operations.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1.5">
                Admin Master Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password (default: aroyal2026)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 bg-[#faf9f6] border border-[#dfd8cc] rounded text-sm focus:outline-none focus:border-[#151515] transition-colors"
              />
              <p className="text-[11px] text-[#888] mt-1.5 flex items-center justify-between">
                <span>Default Access Key:</span>
                <code className="bg-neutral-100 px-2 py-0.5 rounded text-[#151515] font-mono font-bold text-[12px]">aroyal2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              <KeyRound className="w-4 h-4 text-[#c9ad79]" />
              <span>{loginLoading ? 'Verifying Credentials...' : 'Sign In To Dashboard'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#eee8de] text-center">
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#151515] transition-colors font-medium group"
            >
              <span>← Back to Customer Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#151515]">
      {/* Top Admin Bar */}
      <div className="bg-[#151515] text-white px-4 sm:px-8 py-3.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl font-bold tracking-wider text-[#c9ad79]">
            A.ROYAL
          </span>
          <span className="text-xs text-neutral-400">|</span>
          <span className="text-xs uppercase tracking-widest font-semibold text-neutral-300">
            Admin Management Portal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Backend Database Active
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#2a2212] text-[#e3cca4] border border-[#59431e]">
            <Mail className="w-3 h-3 text-[#c9ad79]" />
            Alerts: {settings?.adminEmail || 'wahab.nadeem6040@gmail.com'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={refreshAllData}
            title="Refresh Database"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#151515] font-semibold rounded hover:bg-neutral-100 transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#dfd8cc] pb-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#151515] text-[#c9ad79] shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-[#eee8de] border border-[#dfd8cc]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'orders'
                ? 'bg-[#151515] text-[#c9ad79] shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-[#eee8de] border border-[#dfd8cc]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Management</span>
            {orders.filter((o) => o.status === 'Pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#c9ad79] text-[#151515] font-bold text-[10px] rounded-full">
                {orders.filter((o) => o.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'products'
                ? 'bg-[#151515] text-[#c9ad79] shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-[#eee8de] border border-[#dfd8cc]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalog & Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'settings'
                ? 'bg-[#151515] text-[#c9ad79] shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-[#eee8de] border border-[#dfd8cc]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Settings & Security</span>
          </button>
        </div>

        {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 border border-[#eee8de] rounded shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#8b7650]">
                    Total Revenue
                  </p>
                  <p className="font-serif text-2xl font-bold text-[#151515] mt-1">
                    PKR {stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Real orders ledger
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#f4efe6] text-[#8b7650] flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 border border-[#eee8de] rounded shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#8b7650]">
                    Total Orders
                  </p>
                  <p className="font-serif text-2xl font-bold text-[#151515] mt-1">
                    {stats.totalOrders}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Lifetime received
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 border border-[#eee8de] rounded shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#8b7650]">
                    Pending Verification
                  </p>
                  <p className="font-serif text-2xl font-bold text-amber-700 mt-1">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                    Awaiting dispatch
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 border border-[#eee8de] rounded shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#8b7650]">
                    Catalog Items
                  </p>
                  <p className="font-serif text-2xl font-bold text-[#151515] mt-1">
                    {stats.totalProducts}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {stats.lowStockCount > 0 ? (
                      <span className="text-red-700 font-semibold">{stats.lowStockCount} Low stock alerts</span>
                    ) : (
                      'All items healthy'
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white border border-[#eee8de] rounded shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#eee8de] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#151515]">
                    Recent Inbound Orders
                  </h3>
                  <p className="text-xs text-[#777]">
                    Latest orders registered by customers across Pakistan
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs uppercase font-bold text-[#8b7650] hover:text-[#151515] flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#8b7650] uppercase tracking-wider text-[10px] font-bold border-b border-[#eee8de]">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8de]">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-[#faf9f6] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#151515]">
                          {order.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#151515]">{order.customer.name}</p>
                          <p className="text-[11px] text-neutral-500">{order.customer.phone}</p>
                        </td>
                        <td className="py-3 px-4 text-neutral-700">{order.customer.city}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-neutral-800">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} items
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#151515]">
                          PKR {order.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className="text-[11px] font-bold py-1 px-2 rounded border border-[#dfd8cc] bg-white focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Alerts Strip */}
            {stats.lowStockCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      Inventory Alert: {stats.lowStockCount} item(s) have 5 or fewer units left in stock!
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Adjust stock quantities in the Catalog tab to ensure continuous fulfillment.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2 bg-amber-900 text-amber-100 text-xs font-semibold rounded hover:bg-amber-950 transition-colors"
                >
                  Manage Inventory
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#eee8de] p-5 rounded shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#151515]">
                    Order Registry & Fulfillment
                  </h3>
                  <p className="text-xs text-[#777]">
                    Manage, update, and dispatch incoming customer orders
                  </p>
                </div>

                {/* Status Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                  {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded transition-all ${
                          orderStatusFilter === st
                            ? 'bg-[#151515] text-[#c9ad79] font-bold'
                            : 'bg-[#faf8f5] text-neutral-600 hover:bg-[#eee8de]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID (e.g. ROYAL-7819), Customer Name, Phone, or City..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#faf8f5] border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                />
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto border border-[#eee8de] rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#8b7650] uppercase tracking-wider text-[10px] font-bold border-b border-[#eee8de]">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Address & City</th>
                      <th className="py-3 px-4">Items Ordered</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8de]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-neutral-400">
                          No orders match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
                        return (
                          <tr key={order.id} className="hover:bg-[#faf9f6] transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#151515]">{order.id}</p>
                              <p className="text-[10px] text-neutral-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-semibold text-[#151515]">{order.customer.name}</p>
                              <a
                                href={`tel:${order.customer.phone}`}
                                className="text-[11px] text-blue-700 hover:underline"
                              >
                                {order.customer.phone}
                              </a>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <p className="font-bold text-neutral-800">{order.customer.city}</p>
                              <p className="text-[11px] text-neutral-600 line-clamp-1">
                                {order.customer.address}
                              </p>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-neutral-800">
                                {order.items.length} item(s)
                              </span>
                              <div className="text-[10px] text-neutral-500 line-clamp-1">
                                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-bold text-[#151515]">
                              PKR {order.total.toLocaleString()}
                            </td>

                            <td className="py-3 px-4">
                              <span className="text-[10px] block font-medium text-neutral-600">
                                {order.paymentMethod}
                              </span>
                              <button
                                onClick={() =>
                                  handlePaymentStatusChange(
                                    order.id,
                                    order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid'
                                  )
                                }
                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                  order.paymentStatus === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                {order.paymentStatus}
                              </button>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value as OrderStatus)
                                }
                                className="text-xs font-bold py-1 px-2.5 rounded border border-[#dfd8cc] bg-white focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-right space-x-1">
                              {/* Direct WhatsApp Customer */}
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${order.customer.name}! This is A.ROYAL luxury customer service regarding your Order #${order.id}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block p-1.5 bg-[#25d366]/10 text-[#128c7e] hover:bg-[#25d366] hover:text-white rounded transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* View Details */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded"
                                title="View Details / Invoice"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Order */}
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUCT CATALOG & INVENTORY ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#eee8de] p-5 rounded shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#151515]">
                    Catalog & Stock Management
                  </h3>
                  <p className="text-xs text-[#777]">
                    Add luxury watches, perfumes, set prices, and adjust real-time stock
                  </p>
                </div>

                <button
                  onClick={() => openProductModal()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Item</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto border border-[#eee8de] rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#8b7650] uppercase tracking-wider text-[10px] font-bold border-b border-[#eee8de]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Inventory Stock</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8de]">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-[#faf9f6] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded bg-[#faf8f5] border border-[#dfd8cc]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-[#151515] text-sm">{product.name}</p>
                            <p className="text-[11px] text-[#777] line-clamp-1 max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-[#f4efe6] text-[#8b7650] text-[10px] font-bold rounded">
                            {product.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-[#151515]">
                            PKR {product.price.toLocaleString()}
                          </p>
                          {product.old_price && (
                            <p className="text-[10px] text-neutral-400 line-through">
                              PKR {product.old_price.toLocaleString()}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                product.stock <= 5
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {product.stock} in stock
                            </span>
                            <div className="inline-flex items-center border border-[#dfd8cc] rounded">
                              <button
                                onClick={() => handleStockAdjust(product, -1)}
                                className="px-2 py-0.5 text-xs hover:bg-[#eee8de]"
                                title="Decrease stock"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleStockAdjust(product, 1)}
                                className="px-2 py-0.5 text-xs hover:bg-[#eee8de]"
                                title="Increase stock"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={async () => {
                              const updated = await updateProduct(product.id, {
                                featured: !product.featured
                              });
                              setProducts((prev) =>
                                prev.map((p) => (p.id === product.id ? updated : p))
                              );
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                              product.featured
                                ? 'bg-[#151515] text-[#c9ad79]'
                                : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {product.featured ? 'Featured' : 'Standard'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => openProductModal(product)}
                            className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SETTINGS & SECURITY ================= */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Information Settings */}
            <div className="bg-white border border-[#eee8de] p-6 rounded shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#151515] border-b border-[#eee8de] pb-3">
                Storefront & WhatsApp Concierge
              </h3>

              {settings && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!settings) return;
                    await updateStoreSettings(settings);
                    alert('Settings updated successfully in database!');
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full p-2.5 border border-[#dfd8cc] rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      Owner Notification Gmail * (Orders sent here)
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.adminEmail || 'wahab.nadeem6040@gmail.com'}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      className="w-full p-2.5 border border-[#dfd8cc] rounded font-semibold text-[#151515]"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Real order alerts will be dispatched to this Gmail address.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      WhatsApp Orders Hotline (for 1-click customer chat)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full p-2.5 border border-[#dfd8cc] rounded"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Include country code (e.g. +923001234567)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      Free Insured Shipping Threshold (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold: Number(e.target.value)
                        })
                      }
                      className="w-full p-2.5 border border-[#dfd8cc] rounded"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors"
                  >
                    Save Storefront Settings
                  </button>
                </form>
              )}
            </div>

            {/* Admin Security Password */}
            <div className="bg-white border border-[#eee8de] p-6 rounded shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#151515] border-b border-[#eee8de] pb-3">
                Admin Console Password
              </h3>

              <p className="text-xs text-[#666]">
                Change your admin authentication password to secure the portal against unauthorized
                access.
              </p>

              {passwordChangeMsg && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded">
                  {passwordChangeMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter at least 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 border border-[#dfd8cc] rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#8b7650] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#725e3c] transition-colors"
                >
                  Update Admin Password
                </button>
              </form>
            </div>

            {/* Dedicated Gmail Notification Hub */}
            <div className="md:col-span-2 bg-[#151515] text-white border border-[#c9ad79]/30 p-6 sm:p-8 rounded shadow-lg space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#c9ad79]/10 border border-[#c9ad79]/30 flex items-center justify-center text-[#c9ad79]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#c9ad79]">
                      Order Gmail Dispatch Engine
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Real-time customer order notifications dispatched to store owner
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Notification Relay Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded space-y-1">
                  <p className="text-[10px] uppercase font-bold text-[#c9ad79] tracking-wider">Active Recipient</p>
                  <p className="text-sm font-bold text-white break-all">
                    {settings?.adminEmail || 'wahab.nadeem6040@gmail.com'}
                  </p>
                  <p className="text-[11px] text-neutral-400">Configured in store database</p>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded space-y-1">
                  <p className="text-[10px] uppercase font-bold text-[#c9ad79] tracking-wider">Payload Content</p>
                  <p className="text-sm font-bold text-white">Full Executive Invoice</p>
                  <p className="text-[11px] text-neutral-400">Customer details, items, address & PKR total</p>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded space-y-1">
                  <p className="text-[10px] uppercase font-bold text-[#c9ad79] tracking-wider">Delivery Method</p>
                  <p className="text-sm font-bold text-white">Automated Event Trigger</p>
                  <p className="text-[11px] text-neutral-400">Instant fire on customer checkout</p>
                </div>
              </div>

              {/* Direct Gmail App Password Credentials Config */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-[#c9ad79] uppercase tracking-wider">
                    Direct Gmail Inbox Delivery Configuration
                  </h4>
                  <span className="text-[10px] text-neutral-400">
                    Uses Google Official SMTP (`smtp.gmail.com`)
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  Real Gmail inbox mein emails pohnchane ke liye apna Gmail aur Google ka 16-digit <strong>App Password</strong> enter karein.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Sender Gmail Address
                    </label>
                    <input
                      type="email"
                      placeholder="wahab.nadeem6040@gmail.com"
                      value={settings?.gmailSenderEmail || ''}
                      onChange={(e) =>
                        settings && setSettings({ ...settings, gmailSenderEmail: e.target.value })
                      }
                      className="w-full p-2 bg-neutral-950 border border-neutral-700 rounded text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Google 16-digit App Password
                    </label>
                    <input
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={settings?.gmailAppPassword || ''}
                      onChange={(e) =>
                        settings && setSettings({ ...settings, gmailAppPassword: e.target.value })
                      }
                      className="w-full p-2 bg-neutral-950 border border-neutral-700 rounded text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                  <p className="font-bold text-[#c9ad79]">💡 1 Minute Google App Password Guide:</p>
                  <p>1. Open Google Account: <span className="text-white font-mono">myaccount.google.com/security</span></p>
                  <p>2. Enable <strong>2-Step Verification</strong> (agar pehle se nahi hai).</p>
                  <p>3. Search & click <strong>App passwords</strong> (ya <span className="text-white font-mono">myaccount.google.com/apppasswords</span>), name: "A.ROYAL", aur 16-digit password copy karke yahan paste kar dein.</p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!settings) return;
                      await updateStoreSettings(settings);
                      alert('Gmail SMTP Settings saved to database!');
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded transition-colors"
                  >
                    Save Gmail Credentials
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={emailSending}
                    className="px-4 py-2 bg-[#c9ad79] hover:bg-[#b89c67] text-[#151515] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{emailSending ? 'Sending Live Test...' : 'Test Send to Gmail Inbox'}</span>
                  </button>
                </div>
              </div>

              {emailActionMsg && (
                <div
                  className={`p-3.5 rounded text-xs border ${
                    emailActionMsg.success
                      ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                      : 'bg-red-950/90 border-red-700 text-red-200'
                  }`}
                >
                  <p className="font-semibold">{emailActionMsg.text}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: FULL ORDER DETAILS / INVOICE ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-2xl border border-[#eee8de] shadow-2xl p-6 sm:p-8 rounded space-y-6">
            <div className="flex items-center justify-between border-b border-[#eee8de] pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#8b7650]">Customer Order</p>
                <h3 className="font-serif text-2xl font-bold text-[#151515]">
                  {selectedOrder.id}
                </h3>
                <p className="text-xs text-neutral-400">
                  Registered: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#faf8f5] p-4 rounded border border-[#eee8de]">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#888]">Customer</p>
                <p className="font-bold text-[#151515] text-sm">{selectedOrder.customer.name}</p>
                <p className="text-neutral-600">{selectedOrder.customer.phone}</p>
                <p className="text-neutral-600">{selectedOrder.customer.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#888]">Shipping Address</p>
                <p className="text-neutral-800 font-medium">{selectedOrder.customer.address}</p>
                <p className="text-neutral-800 font-bold">{selectedOrder.customer.city}</p>
                {selectedOrder.customer.notes && (
                  <p className="text-amber-800 italic mt-1">
                    Notes: {selectedOrder.customer.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-[11px] uppercase font-bold text-[#8b7650]">
                Ordered Products
              </h4>
              <div className="border border-[#eee8de] rounded divide-y divide-[#eee8de]">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded bg-neutral-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-[#151515]">{item.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          {item.quantity} × PKR {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#151515]">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#faf8f5] p-4 rounded space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>PKR {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-emerald-700 font-bold">
                  {selectedOrder.shippingFee === 0 ? 'FREE' : `PKR ${selectedOrder.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#151515] pt-1 border-t border-[#eee8de]">
                <span>Grand Total</span>
                <span className="font-serif">PKR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="p-1.5 border border-[#dfd8cc] rounded font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedOrder.customer.name}! This is A.ROYAL luxury regarding Order #${selectedOrder.id}. Current status: ${selectedOrder.status}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#25d366] text-white text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp Customer</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => handleResendOrderEmail(selectedOrder.id)}
                  disabled={emailSending}
                  className="px-3 py-2 bg-[#151515] hover:bg-neutral-800 text-[#c9ad79] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Resend full order receipt to wahab.nadeem6040@gmail.com"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{emailSending ? 'Sending...' : 'Email wahab.nadeem6040@gmail.com'}</span>
                </button>
              </div>
            </div>

            {/* Email dispatch feedback inside order modal */}
            {emailActionMsg && (
              <div
                className={`p-2.5 rounded text-xs border ${
                  emailActionMsg.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{emailActionMsg.text}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-xl border border-[#eee8de] shadow-2xl p-6 sm:p-8 rounded space-y-6">
            <div className="flex items-center justify-between border-b border-[#eee8de] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#151515]">
                {editingProduct ? 'Edit Catalog Item' : 'Add New Luxury Item'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Chronograph Black"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 border border-[#dfd8cc] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as Product['category']
                      })
                    }
                    className="w-full p-2.5 border border-[#dfd8cc] rounded"
                  >
                    <option value="Watches">Watches</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full p-2.5 border border-[#dfd8cc] rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    Selling Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="24999"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2.5 border border-[#dfd8cc] rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    Original Price (Strike-through)
                  </label>
                  <input
                    type="number"
                    placeholder="29999"
                    value={productForm.old_price}
                    onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })}
                    className="w-full p-2.5 border border-[#dfd8cc] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full p-2.5 border border-[#dfd8cc] rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the craftsmanship, materials, or olfactory notes..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 border border-[#dfd8cc] rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                  Specifications / Notes (One per line: Key: Value)
                </label>
                <textarea
                  rows={3}
                  placeholder={"Movement: Automatic Self-Winding\nGlass: Sapphire Crystal\nWaterResistance: 5 ATM"}
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="w-full p-2.5 border border-[#dfd8cc] rounded font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                />
                <label htmlFor="featured-check" className="font-semibold text-neutral-800">
                  Feature prominently on storefront hero & curated showcase
                </label>
              </div>

              <div className="pt-3 border-t border-[#eee8de] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-[#dfd8cc] rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#151515] text-[#c9ad79] font-bold rounded hover:bg-neutral-800"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
