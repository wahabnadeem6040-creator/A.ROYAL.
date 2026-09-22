import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { sendOrderNotificationEmail, sendTestNotificationEmail } from './server/email';

const PORT = 3000;
const ADMIN_SECRET_SESSION = 'aroyal-authenticated-session-2026';

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers['x-admin-token'];

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (tokenHeader as string);

  if (token === ADMIN_SECRET_SESSION) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', store: 'A.ROYAL' });
  });

  // Public Store Settings
  app.get('/api/settings', (_req, res) => {
    const settings = db.getSettings();
    res.json(settings);
  });

  // Public Products List
  app.get('/api/products', (req, res) => {
    const category = req.query.category as string;
    let products = db.getProducts();

    if (category && category !== 'All') {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.json(products);
  });

  // Public Single Product
  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Public Create Order (Real order placement)
  app.post('/api/orders', (req, res) => {
    try {
      const { customer, items, paymentMethod } = req.body;

      if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
        return res.status(400).json({
          error: 'Please provide all required delivery details (Name, Phone, Address, City).'
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Your shopping bag is empty.' });
      }

      const result = db.createOrder({
        customer,
        items,
        paymentMethod: paymentMethod || 'Cash on Delivery (COD)'
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Automatically dispatch order notification email to owner (wahab.nadeem6040@gmail.com)
      if (result.order) {
        const storeSettings = db.getSettings();
        const recipient = storeSettings.adminEmail || 'wahab.nadeem6040@gmail.com';
        const credentials = (storeSettings.gmailSenderEmail && storeSettings.gmailAppPassword)
          ? { user: storeSettings.gmailSenderEmail, pass: storeSettings.gmailAppPassword }
          : undefined;
        sendOrderNotificationEmail(result.order, recipient, credentials).catch((err) => {
          console.error('[EMAIL NOTIFICATION DISPATCH ERROR]', err);
        });
      }

      res.status(201).json(result.order);
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(500).json({ error: 'Failed to process order. Please try again.' });
    }
  });

  // Public Track Order by Order ID or Phone
  app.get('/api/orders/track/:query', (req, res) => {
    const query = req.params.query.trim().toLowerCase();
    const orders = db.getOrders();

    const order = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.customer.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
        (o.customer.whatsapp &&
          o.customer.whatsapp.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')))
    );

    if (!order) {
      return res.status(404).json({
        error: `No order found for "${req.params.query}". Please check your Order ID (e.g. ROYAL-7819).`
      });
    }

    res.json(order);
  });

  // ================= ADMIN ROUTES ================= //

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (db.verifyAdminPassword(password)) {
      return res.json({
        success: true,
        token: ADMIN_SECRET_SESSION,
        message: 'Authenticated successfully'
      });
    }

    return res.status(401).json({ error: 'Invalid admin password' });
  });

  // Admin Verify Token
  app.get('/api/admin/verify', (req, res) => {
    const token = req.headers.authorization?.slice(7) || req.headers['x-admin-token'];
    if (token === ADMIN_SECRET_SESSION) {
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  });

  // Admin Dashboard Statistics
  app.get('/api/admin/stats', adminAuth, (_req, res) => {
    const stats = db.getStats();
    res.json(stats);
  });

  // Admin Get All Orders (with search and status filter)
  app.get('/api/admin/orders', adminAuth, (req, res) => {
    const { status, search } = req.query as { status?: string; search?: string };
    let orders = db.getOrders();

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

    res.json(orders);
  });

  // Admin Single Order View
  app.get('/api/admin/orders/:id', adminAuth, (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // Admin Update Order Status
  app.patch('/api/admin/orders/:id/status', adminAuth, (req, res) => {
    const { status, paymentStatus } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = db.updateOrderStatus(req.params.id, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updated);
  });

  // Admin Delete Order
  app.delete('/api/admin/orders/:id', adminAuth, (req, res) => {
    const success = db.deleteOrder(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order removed' });
  });

  // Admin Add Product
  app.post('/api/products', adminAuth, (req, res) => {
    try {
      const { name, category, price, old_price, image, description, stock, featured, specifications } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({ error: 'Product name, category, and price are required' });
      }

      const product = db.addProduct({
        name,
        category: category || 'Watches',
        price: Number(price),
        old_price: old_price ? Number(old_price) : undefined,
        image: image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
        description: description || 'Handcrafted luxury item with signature royal craftsmanship.',
        stock: Number(stock) || 10,
        featured: Boolean(featured),
        specifications: specifications || {}
      });

      res.status(201).json(product);
    } catch (err: any) {
      console.error('Error adding product:', err);
      res.status(500).json({ error: 'Failed to add product' });
    }
  });

  // Admin Update Product
  app.put('/api/products/:id', adminAuth, (req, res) => {
    try {
      const updates = req.body;
      if (updates.price) updates.price = Number(updates.price);
      if (updates.old_price) updates.old_price = Number(updates.old_price);
      if (updates.stock !== undefined) updates.stock = Number(updates.stock);
      if (updates.featured !== undefined) updates.featured = Boolean(updates.featured);

      const updated = db.updateProduct(req.params.id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(updated);
    } catch (err: any) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Admin Delete Product
  app.delete('/api/products/:id', adminAuth, (req, res) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  });

  // Admin Update Settings
  app.post('/api/admin/settings', adminAuth, (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // Admin Update Password
  app.post('/api/admin/change-password', adminAuth, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }
    db.updateAdminPassword(newPassword);
    res.json({ success: true, message: 'Admin password updated successfully' });
  });

  // Admin Test Email Dispatch
  app.post('/api/admin/test-email', adminAuth, async (req, res) => {
    try {
      const { email } = req.body;
      const storeSettings = db.getSettings();
      const targetEmail = email || storeSettings.adminEmail || 'wahab.nadeem6040@gmail.com';
      const credentials = (storeSettings.gmailSenderEmail && storeSettings.gmailAppPassword)
        ? { user: storeSettings.gmailSenderEmail, pass: storeSettings.gmailAppPassword }
        : undefined;
      const result = await sendTestNotificationEmail(targetEmail, credentials);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to dispatch test email' });
    }
  });

  // Admin Resend Order Notification Email
  app.post('/api/admin/orders/:id/resend-email', adminAuth, async (req, res) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const storeSettings = db.getSettings();
      const recipient = storeSettings.adminEmail || 'wahab.nadeem6040@gmail.com';
      const credentials = (storeSettings.gmailSenderEmail && storeSettings.gmailAppPassword)
        ? { user: storeSettings.gmailSenderEmail, pass: storeSettings.gmailAppPassword }
        : undefined;
      const result = await sendOrderNotificationEmail(order, recipient, credentials);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to resend order email' });
    }
  });

  // ================= VITE MIDDLEWARE ================= //
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A.ROYAL Luxury Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
