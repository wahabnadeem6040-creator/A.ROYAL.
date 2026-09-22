import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { Product, CartItem, Order, StoreSettings } from './types';
import { getProducts, getStoreSettings } from './lib/api';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

const CART_STORAGE_KEY = 'aroyal_shopping_cart';

function checkIsAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#/admin')
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    return checkIsAdminPath() ? 'admin' : 'store';
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'A.ROYAL',
    tagline: 'Luxury That Defines You',
    phone: '+92 300 0000000',
    whatsappNumber: '+923000000000',
    adminEmail: 'wahab.nadeem6040@gmail.com',
    currency: 'PKR',
    freeShippingThreshold: 5000,
    shippingFee: 0
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Cart State with LocalStorage Persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  // Handle URL path & hash navigation (/admin, #admin, browser back/forward)
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = checkIsAdminPath();
      setCurrentView(isAdmin ? 'admin' : 'store');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Initial Products and Settings from Backend
  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, settingsData] = await Promise.all([
          getProducts(),
          getStoreSettings()
        ]);
        setProducts(prodData);
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load store data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // Clear cart on successful order
    setCartItems([]);
    // Update local product stock
    setProducts((prev) =>
      prev.map((p) => {
        const ordered = order.items.find((i) => i.productId === p.id);
        if (ordered) {
          return { ...p, stock: Math.max(0, p.stock - ordered.quantity) };
        }
        return p;
      })
    );
  };

  // Filter Products by Category
  const watches = products.filter((p) => p.category === 'Watches');
  const perfumes = products.filter((p) => p.category === 'Perfumes');

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Standalone Admin Panel View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#111111] text-neutral-100 font-['Plus_Jakarta_Sans',sans-serif]">
        <AdminPortal onBackToStore={navigateToStore} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#151515] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Alert */}
      <aside aria-label="Announcement" className="bg-[#151515] text-[#c9ad79] text-center text-[11px] font-semibold tracking-widest uppercase py-2 px-4 border-b border-[#2b2b2b]">
        <span>Complimentary Insured Delivery Across Pakistan • Cash on Delivery (COD) Available</span>
      </aside>

      {/* Main Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onNavigateHome={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onExploreWatches={() => {
              document.getElementById('watches')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExplorePerfumes={() => {
              document.getElementById('perfumes')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Section: Watches */}
          <section id="watches" className="py-16 md:py-24 border-t border-[#eee8de]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#eee8de] gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-bold text-[#8b7650]">
                    <Sparkles className="w-3 h-3 text-[#a88849]" />
                    Precision & Presence
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#151515] mt-1">
                    Watches
                  </h2>
                </div>

                <p className="text-xs text-[#777] max-w-sm font-light">
                  Mechanical automatics and precision quartz chronographs crafted with surgical-grade
                  316L stainless steel.
                </p>
              </div>

              {/* Watches Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {watches.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Luxury Banner */}
          <section className="bg-[#171717] text-white py-20 px-6 my-12 text-center relative overflow-hidden">
            {/* Background Texture Accents */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c9ad79_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#c9ad79] font-bold block">
                The A.ROYAL Signature
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-medium text-white tracking-tight">
                Wear the moment.
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                Time, character and scent — curated for your presence. Each creation embodies a
                heritage of uncompromising elegance.
              </p>

              <div className="pt-4 flex items-center justify-center gap-4">
                <a
                  href="#perfumes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9ad79] text-[#151515] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d8be8d] transition-colors"
                >
                  <span>Discover Extrait De Parfum</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Section: Perfumes */}
          <section id="perfumes" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#eee8de] gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-bold text-[#8b7650]">
                    <Sparkles className="w-3 h-3 text-[#a88849]" />
                    Signature Fragrance
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#151515] mt-1">
                    Perfumes
                  </h2>
                </div>

                <p className="text-xs text-[#777] max-w-sm font-light">
                  Long-lasting artisanal extrait de parfum formulations blending pure Cambodian oud,
                  amber, and rare florals.
                </p>
              </div>

              {/* Perfumes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {perfumes.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Authenticity Guarantee Banner */}
          <section className="py-14 bg-[#f4efe6] border-y border-[#eee8de]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#dfd8cc] rounded-full text-[11px] font-bold uppercase tracking-wider text-[#8b7650]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#a88849]" />
                Direct From Master Artisans
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#151515]">
                Uncompromising Craftsmanship
              </h3>
              <p className="text-xs sm:text-sm text-[#666] max-w-xl mx-auto leading-relaxed">
                Every A.ROYAL chronograph is inspected and timed in our horological lab. Every
                perfume bottle is macerated and sealed for maximum sillage and longevity.
              </p>
            </div>
          </section>
        </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Modals & Overlays */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        whatsappNumber={settings.whatsappNumber}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        whatsappNumber={settings.whatsappNumber}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
        settings={settings}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        whatsappNumber={settings.whatsappNumber}
      />
    </div>
  );
}
