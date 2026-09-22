export interface Product {
  id: string;
  name: string;
  category: 'Watches' | 'Perfumes' | 'Accessories';
  price: number;
  old_price?: number;
  image: string;
  description: string;
  stock: number;
  featured: boolean;
  specifications?: Record<string, string>;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'Cash on Delivery (COD)'
  | 'Direct Bank Transfer'
  | 'Online Card Payment';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Unpaid' | 'Paid';
  emailNotificationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockCount: number;
  recentOrders: Order[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  adminEmail: string;
  gmailSenderEmail?: string;
  gmailAppPassword?: string;
  currency: string;
  freeShippingThreshold: number;
  shippingFee: number;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
}
