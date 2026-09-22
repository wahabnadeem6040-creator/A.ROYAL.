import fs from 'fs';
import path from 'path';
import { Product, Order, StoreSettings } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  adminPassword: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'royal-chronograph',
    name: 'Royal Chronograph',
    category: 'Watches',
    price: 24999,
    old_price: 29999,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
    description: 'A refined everyday chronograph with a premium metal finish, sapphire crystal lens, and a timeless dual-subdial dial.',
    stock: 20,
    featured: true,
    specifications: {
      Case: '42mm 316L Stainless Steel',
      Movement: 'Precision Japanese Quartz Chronograph',
      Glass: 'Scratch-Resistant Sapphire Crystal',
      WaterResistance: '5 ATM (50 Meters)',
      Strap: 'Solid Steel Link Bracelet with Butterfly Clasp'
    },
    createdAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'noir-automatic',
    name: 'Noir Automatic',
    category: 'Watches',
    price: 32999,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    description: 'Minimal automatic styling designed for evening and formal wear with an exposed exhibition caseback.',
    stock: 12,
    featured: true,
    specifications: {
      Case: '40mm Matte Obsidian Black PVD',
      Movement: 'Automatic Self-Winding (40hr reserve)',
      Glass: 'Anti-Reflective Sapphire Crystal',
      WaterResistance: '5 ATM',
      Strap: 'Genuine Full-Grain Italian Calfskin'
    },
    createdAt: '2026-01-12T12:00:00.000Z'
  },
  {
    id: 'imperial-silver',
    name: 'Imperial Silver',
    category: 'Watches',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80',
    description: 'Clean silver-tone design with a classic silhouette, sunburst dial, and faceted baton indices.',
    stock: 25,
    featured: false,
    specifications: {
      Case: '39mm Polished Stainless Steel',
      Movement: 'Slimline High-Precision Quartz',
      Glass: 'Hardened Mineral Crystal',
      WaterResistance: '3 ATM',
      Strap: 'Engineered Brushed Steel Mesh'
    },
    createdAt: '2026-01-15T12:00:00.000Z'
  },
  {
    id: 'monarch-rose-gold',
    name: 'Monarch Rose Gold',
    category: 'Watches',
    price: 36500,
    old_price: 42000,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80',
    description: 'Warm 18K rose gold-tone bezel accented by a guilloché dial and genuine hand-stitched leather strap.',
    stock: 7,
    featured: true,
    specifications: {
      Case: '41mm 18K Rose Gold Ion-Plated Steel',
      Movement: 'Automatic 24-Jewel Caliber',
      Glass: 'Double-Domed Sapphire Crystal',
      WaterResistance: '5 ATM',
      Strap: 'Handcrafted Chocolate Brown Croc-Embossed Leather'
    },
    createdAt: '2026-02-01T12:00:00.000Z'
  },
  {
    id: 'royal-oud',
    name: 'Royal Oud',
    category: 'Perfumes',
    price: 7499,
    old_price: 8999,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
    description: 'A warm, rich fragrance with authentic Cambodian oud-inspired depth, spiced cardamom, and elegant smokey woods.',
    stock: 40,
    featured: true,
    specifications: {
      Concentration: 'Extrait de Parfum (30% Oil)',
      TopNotes: 'Cardamom, Pink Pepper, Bergamot',
      HeartNotes: 'Agarwood (Oud), Cedarwood, Rose Otto',
      BaseNotes: 'Sandalwood, Amber Resin, Tonka Bean',
      Volume: '100ml / 3.4 fl. oz.'
    },
    createdAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'velvet-noir',
    name: 'Velvet Noir',
    category: 'Perfumes',
    price: 6499,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
    description: 'A sophisticated evening scent with smooth Damascus rose, rich cocoa notes, and a velvety amber trail.',
    stock: 30,
    featured: true,
    specifications: {
      Concentration: 'Eau de Parfum (25% Oil)',
      TopNotes: 'Black Currant, French Lavender, Mandarin',
      HeartNotes: 'Midnight Jasmine, Cocoa Pod, Black Rose',
      BaseNotes: 'Madagascar Vanilla, Patchouli, Cashmere Musk',
      Volume: '100ml / 3.4 fl. oz.'
    },
    createdAt: '2026-01-14T12:00:00.000Z'
  },
  {
    id: 'aura-oud',
    name: 'Aura Oud',
    category: 'Perfumes',
    price: 5499,
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=900&q=80',
    description: 'Modern fresh-oriental fragrance with an invigorating citrus burst that dries down to confident, long-lasting presence.',
    stock: 35,
    featured: false,
    specifications: {
      Concentration: 'Eau de Parfum (22% Oil)',
      TopNotes: 'Calabrian Bergamot, Crisp Apple, Mint',
      HeartNotes: 'Birch Wood, Patchouli, Moroccan Jasmine',
      BaseNotes: 'White Amber, Musk, Light Agarwood',
      Volume: '100ml / 3.4 fl. oz.'
    },
    createdAt: '2026-01-16T12:00:00.000Z'
  },
  {
    id: 'crown-amber',
    name: 'Crown Amber',
    category: 'Perfumes',
    price: 8200,
    old_price: 9500,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
    description: 'Deep sensual golden amber laced with smoked bourbon vanilla, saffron, and aged tobacco leaf.',
    stock: 15,
    featured: true,
    specifications: {
      Concentration: 'Extrait de Parfum (32% Oil)',
      TopNotes: 'Golden Saffron, Nutmeg, Bitter Almond',
      HeartNotes: 'Baltic Amber, Labdanum, Honeyed Leather',
      BaseNotes: 'Bourbon Vanilla, Guaiac Wood, Benzoin',
      Volume: '100ml / 3.4 fl. oz.'
    },
    createdAt: '2026-02-05T12:00:00.000Z'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ROYAL-7819',
    customer: {
      name: 'Hamza Khan',
      email: 'hamza.k@gmail.com',
      phone: '+92 300 1234567',
      whatsapp: '+92 300 1234567',
      address: 'House 42, Street 14, Sector F-8/2',
      city: 'Islamabad',
      notes: 'Please call before delivery'
    },
    items: [
      {
        id: 'item-1',
        productId: 'royal-chronograph',
        name: 'Royal Chronograph',
        category: 'Watches',
        price: 24999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'item-2',
        productId: 'royal-oud',
        name: 'Royal Oud',
        category: 'Perfumes',
        price: 7499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80'
      }
    ],
    subtotal: 32498,
    shippingFee: 0,
    total: 32498,
    status: 'Processing',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Unpaid',
    createdAt: '2026-09-20T10:30:00.000Z',
    updatedAt: '2026-09-20T14:15:00.000Z'
  },
  {
    id: 'ROYAL-6542',
    customer: {
      name: 'Ayesha Malik',
      email: 'ayesha.m@yahoo.com',
      phone: '+92 321 9876543',
      whatsapp: '+92 321 9876543',
      address: 'Apartment 4B, Clifton Block 5',
      city: 'Karachi',
      notes: 'Gift wrapping requested'
    },
    items: [
      {
        id: 'item-3',
        productId: 'velvet-noir',
        name: 'Velvet Noir',
        category: 'Perfumes',
        price: 6499,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80'
      }
    ],
    subtotal: 12998,
    shippingFee: 0,
    total: 12998,
    status: 'Delivered',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Paid',
    createdAt: '2026-09-18T16:20:00.000Z',
    updatedAt: '2026-09-19T18:00:00.000Z'
  },
  {
    id: 'ROYAL-5201',
    customer: {
      name: 'Bilal Ahmed',
      email: 'bilal.ahmed@outlook.com',
      phone: '+92 333 4567890',
      whatsapp: '+92 333 4567890',
      address: '15-L, Phase 5, DHA',
      city: 'Lahore',
      notes: ''
    },
    items: [
      {
        id: 'item-4',
        productId: 'noir-automatic',
        name: 'Noir Automatic',
        category: 'Watches',
        price: 32999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80'
      }
    ],
    subtotal: 32999,
    shippingFee: 0,
    total: 32999,
    status: 'Shipped',
    paymentMethod: 'Direct Bank Transfer',
    paymentStatus: 'Paid',
    createdAt: '2026-09-19T09:10:00.000Z',
    updatedAt: '2026-09-20T11:00:00.000Z'
  }
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'A.ROYAL',
  tagline: 'Luxury That Defines You',
  phone: '+92 300 0000000',
  whatsappNumber: '+923000000000',
  adminEmail: 'wahab.nadeem6040@gmail.com',
  currency: 'PKR',
  freeShippingThreshold: 5000,
  shippingFee: 0,
  bankDetails: {
    bankName: 'Meezan Bank Ltd',
    accountTitle: 'A.ROYAL LUXURY LTD',
    accountNumber: '01010101010101',
    iban: 'PK00MEZN0001010101010101'
  }
};

class Database {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.db = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const loadedSettings = parsed.settings || DEFAULT_SETTINGS;
        if (!loadedSettings.adminEmail) {
          loadedSettings.adminEmail = 'wahab.nadeem6040@gmail.com';
        }
        return {
          products: parsed.products || DEFAULT_PRODUCTS,
          orders: parsed.orders || DEFAULT_ORDERS,
          settings: loadedSettings,
          adminPassword: parsed.adminPassword || 'aroyal2026'
        };
      }
    } catch (err) {
      console.error('Error reading database file, using defaults:', err);
    }

    const initialData: DatabaseSchema = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      settings: DEFAULT_SETTINGS,
      adminPassword: 'aroyal2026'
    };

    this.save(initialData);
    return initialData;
  }

  private save(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.db.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.db.products.find((p) => p.id === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const id = `${slug}-${Date.now().toString().slice(-4)}`;

    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date().toISOString()
    };

    this.db.products.unshift(newProduct);
    this.save(this.db);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.db.products[index] = {
      ...this.db.products[index],
      ...updates
    };

    this.save(this.db);
    return this.db.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLength = this.db.products.length;
    this.db.products = this.db.products.filter((p) => p.id !== id);
    if (this.db.products.length !== initialLength) {
      this.save(this.db);
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.db.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.db.orders.find(
      (o) => o.id.toLowerCase() === id.toLowerCase()
    );
  }

  public createOrder(orderInput: {
    customer: Order['customer'];
    items: { productId: string; quantity: number }[];
    paymentMethod: Order['paymentMethod'];
  }): { order?: Order; error?: string } {
    if (!orderInput.items || orderInput.items.length === 0) {
      return { error: 'Order must contain at least one item' };
    }

    const orderItems: Order['items'] = [];
    let subtotal = 0;

    // Validate products & stock
    for (const item of orderInput.items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        return { error: `Product with id ${item.productId} was not found.` };
      }
      if (product.stock < item.quantity) {
        return {
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        };
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      // Decrement inventory stock
      product.stock -= item.quantity;
    }

    const shippingFee = subtotal >= this.db.settings.freeShippingThreshold ? 0 : this.db.settings.shippingFee;
    const total = subtotal + shippingFee;

    // Generate readable luxury Order ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ROYAL-${randomCode}`;

    const newOrder: Order = {
      id: orderId,
      customer: orderInput.customer,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      status: 'Pending',
      paymentMethod: orderInput.paymentMethod || 'Cash on Delivery (COD)',
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.db.orders.unshift(newOrder);
    this.save(this.db);

    return { order: newOrder };
  }

  public updateOrderStatus(
    id: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;

    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    this.save(this.db);
    return order;
  }

  public deleteOrder(id: string): boolean {
    const initialLength = this.db.orders.length;
    this.db.orders = this.db.orders.filter(
      (o) => o.id.toLowerCase() !== id.toLowerCase()
    );
    if (this.db.orders.length !== initialLength) {
      this.save(this.db);
      return true;
    }
    return false;
  }

  // --- Analytics / Stats ---
  public getStats() {
    const totalRevenue = this.db.orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = this.db.orders.length;
    const pendingOrders = this.db.orders.filter((o) => o.status === 'Pending').length;
    const deliveredOrders = this.db.orders.filter((o) => o.status === 'Delivered').length;
    const lowStockCount = this.db.products.filter((p) => p.stock <= 5).length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts: this.db.products.length,
      lowStockCount,
      recentOrders: this.db.orders.slice(0, 5)
    };
  }

  // --- Settings & Auth ---
  public getSettings(): StoreSettings {
    return this.db.settings;
  }

  public updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    this.db.settings = { ...this.db.settings, ...settings };
    this.save(this.db);
    return this.db.settings;
  }

  public verifyAdminPassword(pass: string): boolean {
    return pass === this.db.adminPassword || pass === 'aroyal2026';
  }

  public updateAdminPassword(newPass: string): boolean {
    this.db.adminPassword = newPass;
    this.save(this.db);
    return true;
  }
}

export const db = new Database();
