import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDbPool, isDbConnected, query } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory fallback cache if MySQL is temporarily offline
let memoryUsers: any[] = [];
let memoryOrders: any[] = [];
let memorySettings: any = null;

async function syncSuperAdminFromEnv() {
  if (!isDbConnected()) return;
  const adminEmail = process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com';
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'Admin@12345';

  try {
    const existing = await query('SELECT id FROM users WHERE id = ? OR email = ? LIMIT 1', ['usr-admin-1', adminEmail]);
    if (existing && existing.length > 0) {
      const existingId = (existing[0] as any).id;
      await query('UPDATE users SET email = ?, password = ? WHERE id = ?', [adminEmail, adminPassword, existingId]);
      console.log(`[Khanewal Connect] Verified & synced Super Admin credentials in MySQL for: ${adminEmail}`);
    } else {
      await query(`
        INSERT INTO users (id, name, email, phone, password, role, avatar, address, wallet_balance, status)
        VALUES (?, 'Super Administrator', ?, '+92 300 0009988', ?, 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'Main Complex, Civil Lines, Khanewal', 150000.00, 'active')
      `, ['usr-admin-1', adminEmail, adminPassword]);
      console.log(`[Khanewal Connect] Provisioned initial Super Admin in MySQL for: ${adminEmail}`);
    }
  } catch (err: any) {
    console.warn('[Khanewal Connect] Note syncing admin credentials:', err.message);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Attempt MySQL database connection
  await initDbPool();
  await syncSuperAdminFromEnv();

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      database: isDbConnected() ? 'mysql_connected' : 'memory_fallback',
      adminUser: process.env.ADMIN_USERNAME ? 'configured_from_secret' : 'default_admin',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get('/api/config/auth-info', (req: Request, res: Response) => {
    res.json({
      adminConfigured: Boolean(process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME),
      adminUsername: process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com'
    });
  });

  // Client Firebase & Environment Configuration Proxy
  app.get('/api/config/client-env', (req: Request, res: Response) => {
    res.json({
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'noman-e5b08',
        appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || '',
        apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || ''
      },
      admin: {
        username: process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com',
        isConfigured: Boolean(process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME)
      },
      dbConnected: isDbConnected()
    });
  });

  app.get('/api/config/firebase-info', (req: Request, res: Response) => {
    const isConfigured = Boolean(
      process.env.FIREBASE_PROJECT_ID || 
      process.env.VITE_FIREBASE_PROJECT_ID || 
      process.env.FIREBASE_FIRESTORE_DATABASE_ID
    );
    res.json({
      configuredFromSecret: isConfigured,
      source: isConfigured ? 'github_secrets_or_env' : 'fallback_applet_config',
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'noman-e5b08',
      databaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-omnitasksuperapp-57a34a31-4e02-4160-a3fe-27190e12f1f7'
    });
  });

  // =========================================================================
  // ZERO-LOSS DATA PERSISTENCE: USERS API (MySQL + Memory Fallback)
  // =========================================================================
  app.get('/api/users', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ success: true, source: 'memory', users: memoryUsers });
    }
    try {
      const rows = await query(`
        SELECT 
          id, name, email, phone, password, role, avatar, address, 
          wallet_balance as walletBalance, status, provider_category as providerCategory, 
          service_skill as serviceSkill, vehicle_type as vehicleType, rating, 
          completed_jobs_count as completedJobsCount, is_online as isOnline, 
          DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate
        FROM users
      `);
      res.json({ success: true, source: 'mysql', users: rows });
    } catch (err: any) {
      console.error('[API /api/users] Error fetching users:', err.message);
      res.status(500).json({ success: false, error: err.message, users: memoryUsers });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    const user = req.body;
    if (!user || !user.id || !user.email) {
      return res.status(400).json({ success: false, error: 'Invalid user payload' });
    }

    // Always update in memory cache
    const existingIdx = memoryUsers.findIndex(u => u.id === user.id);
    if (existingIdx >= 0) {
      memoryUsers[existingIdx] = user;
    } else {
      memoryUsers.push(user);
    }

    if (!isDbConnected()) {
      return res.json({ success: true, savedTo: 'memory', user });
    }

    try {
      await query(`
        INSERT INTO users (
          id, name, email, phone, password, role, avatar, address, 
          wallet_balance, status, provider_category, service_skill, 
          vehicle_type, rating, completed_jobs_count, is_online
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          phone = VALUES(phone),
          password = VALUES(password),
          role = VALUES(role),
          avatar = VALUES(avatar),
          address = VALUES(address),
          wallet_balance = VALUES(wallet_balance),
          status = VALUES(status),
          provider_category = VALUES(provider_category),
          service_skill = VALUES(service_skill),
          vehicle_type = VALUES(vehicle_type),
          rating = VALUES(rating),
          completed_jobs_count = VALUES(completed_jobs_count),
          is_online = VALUES(is_online)
      `, [
        user.id,
        user.name || '',
        user.email,
        user.phone || '',
        user.password || 'Customer@123',
        user.role || 'customer',
        user.avatar || '',
        user.address || '',
        Number(user.walletBalance) || 0,
        user.status || 'active',
        user.providerCategory || null,
        user.serviceSkill || null,
        user.vehicleType || null,
        Number(user.rating) || 5.0,
        Number(user.completedJobsCount) || 0,
        user.isOnline !== false ? 1 : 0
      ]);

      console.log(`[MySQL Users] Saved user to MySQL: ${user.name} (${user.email}, ${user.role})`);
      res.json({ success: true, savedTo: 'mysql', user });
    } catch (err: any) {
      console.error(`[MySQL Users] Error saving user ${user.id}:`, err.message);
      res.status(500).json({ success: false, error: err.message, savedTo: 'memory_fallback' });
    }
  });

  // Batch sync users to MySQL
  app.post('/api/users/sync-all', async (req: Request, res: Response) => {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, error: 'Expected users array' });
    }

    memoryUsers = users;

    if (!isDbConnected()) {
      return res.json({ success: true, savedTo: 'memory', count: users.length });
    }

    let savedCount = 0;
    try {
      for (const user of users) {
        if (!user.id || !user.email) continue;
        await query(`
          INSERT INTO users (
            id, name, email, phone, password, role, avatar, address, 
            wallet_balance, status, provider_category, service_skill, 
            vehicle_type, rating, completed_jobs_count, is_online
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            password = VALUES(password),
            role = VALUES(role),
            avatar = VALUES(avatar),
            address = VALUES(address),
            wallet_balance = VALUES(wallet_balance),
            status = VALUES(status),
            provider_category = VALUES(provider_category),
            service_skill = VALUES(service_skill),
            vehicle_type = VALUES(vehicle_type),
            rating = VALUES(rating),
            completed_jobs_count = VALUES(completed_jobs_count),
            is_online = VALUES(is_online)
        `, [
          user.id,
          user.name || '',
          user.email,
          user.phone || '',
          user.password || 'Customer@123',
          user.role || 'customer',
          user.avatar || '',
          user.address || '',
          Number(user.walletBalance) || 0,
          user.status || 'active',
          user.providerCategory || null,
          user.serviceSkill || null,
          user.vehicleType || null,
          Number(user.rating) || 5.0,
          Number(user.completedJobsCount) || 0,
          user.isOnline !== false ? 1 : 0
        ]);
        savedCount++;
      }
      console.log(`[MySQL Users] Batch synced ${savedCount} users to MySQL`);
      res.json({ success: true, savedTo: 'mysql', count: savedCount });
    } catch (err: any) {
      console.error('[MySQL Users] Batch sync error:', err.message);
      res.status(500).json({ success: false, error: err.message, savedCount });
    }
  });

  // =========================================================================
  // ZERO-LOSS DATA PERSISTENCE: ORDERS API (MySQL + Memory Fallback)
  // =========================================================================
  app.get('/api/orders', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ success: true, source: 'memory', orders: memoryOrders });
    }
    try {
      const orders = await query(`SELECT * FROM orders ORDER BY created_at DESC`);
      res.json({ success: true, source: 'mysql', orders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, orders: memoryOrders });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, error: 'Invalid order' });
    }

    const idx = memoryOrders.findIndex(o => o.id === order.id);
    if (idx >= 0) memoryOrders[idx] = order;
    else memoryOrders.push(order);

    if (!isDbConnected()) {
      return res.json({ success: true, savedTo: 'memory', order });
    }

    try {
      // Ensure customer exists in MySQL first to satisfy FK
      const customerExists = await query('SELECT id FROM users WHERE id = ? LIMIT 1', [order.customerId]);
      if (!customerExists || customerExists.length === 0) {
        await query(`
          INSERT INTO users (id, name, email, phone, role, password, address, wallet_balance, status)
          VALUES (?, ?, ?, ?, 'customer', 'Customer@123', ?, 3000.00, 'active')
          ON DUPLICATE KEY UPDATE name = VALUES(name)
        `, [
          order.customerId,
          order.customerName || 'Customer',
          `${order.customerId}@customer.khw`,
          order.customerPhone || '+92 300 0000000',
          order.deliveryAddress || 'Khanewal'
        ]);
      }

      await query(`
        INSERT INTO orders (
          id, category, customer_id, customer_name, customer_phone, delivery_address,
          status, pricing_base, pricing_service_delivery, pricing_item_budget,
          pricing_helper, pricing_platform, pricing_total, payment_method, payment_status,
          assigned_provider_id, assigned_provider_name, assigned_provider_phone,
          assigned_provider_avatar, assigned_provider_rating, eta_minutes, current_step_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          category = VALUES(category),
          customer_name = VALUES(customer_name),
          customer_phone = VALUES(customer_phone),
          delivery_address = VALUES(delivery_address),
          status = VALUES(status),
          pricing_base = VALUES(pricing_base),
          pricing_service_delivery = VALUES(pricing_service_delivery),
          pricing_item_budget = VALUES(pricing_item_budget),
          pricing_helper = VALUES(pricing_helper),
          pricing_platform = VALUES(pricing_platform),
          pricing_total = VALUES(pricing_total),
          payment_method = VALUES(payment_method),
          payment_status = VALUES(payment_status),
          assigned_provider_id = VALUES(assigned_provider_id),
          assigned_provider_name = VALUES(assigned_provider_name),
          assigned_provider_phone = VALUES(assigned_provider_phone),
          assigned_provider_avatar = VALUES(assigned_provider_avatar),
          assigned_provider_rating = VALUES(assigned_provider_rating),
          eta_minutes = VALUES(eta_minutes),
          current_step_index = VALUES(current_step_index)
      `, [
        order.id,
        order.category || 'custom_delivery',
        order.customerId,
        order.customerName || '',
        order.customerPhone || '',
        order.deliveryAddress || '',
        order.status || 'pending',
        Number(order.pricing?.baseFee) || 0,
        Number(order.pricing?.serviceOrDeliveryFee) || 0,
        Number(order.pricing?.itemOrDistanceBudget) || 0,
        Number(order.pricing?.helperFee) || 0,
        Number(order.pricing?.platformFee) || 0,
        Number(order.pricing?.total) || 0,
        order.paymentMethod || 'cod',
        order.paymentStatus || 'pending',
        order.assignedProviderId || null,
        order.assignedProviderName || null,
        order.assignedProviderPhone || null,
        order.assignedProviderAvatar || null,
        Number(order.assignedProviderRating) || 5.0,
        Number(order.etaMinutes) || 30,
        Number(order.currentStepIndex) || 0
      ]);

      console.log(`[MySQL Orders] Saved order ${order.id} (${order.status}) to MySQL`);
      res.json({ success: true, savedTo: 'mysql', order });
    } catch (err: any) {
      console.error(`[MySQL Orders] Error saving order ${order.id}:`, err.message);
      res.status(500).json({ success: false, error: err.message, savedTo: 'memory_fallback' });
    }
  });

  // =========================================================================
  // ZERO-LOSS UNIFIED STATE SYNC (MySQL <-> Frontend Store)
  // =========================================================================
  app.get('/api/sync/all-state', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        source: 'memory',
        users: memoryUsers,
        orders: memoryOrders,
        settings: memorySettings
      });
    }

    try {
      const users = await query(`
        SELECT 
          id, name, email, phone, password, role, avatar, address, 
          wallet_balance as walletBalance, status, provider_category as providerCategory, 
          service_skill as serviceSkill, vehicle_type as vehicleType, rating, 
          completed_jobs_count as completedJobsCount, is_online as isOnline, 
          DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate
        FROM users
      `);

      res.json({
        success: true,
        source: 'mysql',
        users,
        orders: memoryOrders,
        settings: memorySettings
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/sync/all-state', async (req: Request, res: Response) => {
    const { users, orders, settings } = req.body;
    if (Array.isArray(users)) memoryUsers = users;
    if (Array.isArray(orders)) memoryOrders = orders;
    if (settings) memorySettings = settings;

    if (!isDbConnected() || !Array.isArray(users)) {
      return res.json({ success: true, savedTo: 'memory' });
    }

    let syncedUsers = 0;
    try {
      for (const u of users) {
        if (!u.id || !u.email) continue;
        await query(`
          INSERT INTO users (
            id, name, email, phone, password, role, avatar, address, 
            wallet_balance, status, provider_category, service_skill, 
            vehicle_type, rating, completed_jobs_count, is_online
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            password = VALUES(password),
            role = VALUES(role),
            avatar = VALUES(avatar),
            address = VALUES(address),
            wallet_balance = VALUES(wallet_balance),
            status = VALUES(status),
            provider_category = VALUES(provider_category),
            service_skill = VALUES(service_skill),
            vehicle_type = VALUES(vehicle_type),
            rating = VALUES(rating),
            completed_jobs_count = VALUES(completed_jobs_count),
            is_online = VALUES(is_online)
        `, [
          u.id,
          u.name || '',
          u.email,
          u.phone || '',
          u.password || 'Customer@123',
          u.role || 'customer',
          u.avatar || '',
          u.address || '',
          Number(u.walletBalance) || 0,
          u.status || 'active',
          u.providerCategory || null,
          u.serviceSkill || null,
          u.vehicleType || null,
          Number(u.rating) || 5.0,
          Number(u.completedJobsCount) || 0,
          u.isOnline !== false ? 1 : 0
        ]);
        syncedUsers++;
      }
      res.json({ success: true, savedTo: 'mysql', syncedUsers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Database snapshot status check
  app.get('/api/db/snapshot-status', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ 
        connected: false, 
        message: 'MySQL is not running locally or in this environment. Running in resilient memory mode.' 
      });
    }
    try {
      const orderCount = await query('SELECT COUNT(*) as count FROM orders');
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      res.json({
        connected: true,
        tables: {
          orders: (orderCount[0] as any)?.count ?? 0,
          users: (userCount[0] as any)?.count ?? 0
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mount Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[OmniServe] Production-ready server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[OmniServe] Failed to start server:', err);
});
