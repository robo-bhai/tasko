import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDbPool, isDbConnected, query } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncSuperAdminFromEnv() {
  if (!isDbConnected()) return;
  const adminEmail = process.env.ADMIN_USERNAME || 'admin@omniserve.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

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

  app.use(express.json());

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
      adminConfigured: Boolean(process.env.ADMIN_USERNAME),
      adminUsername: process.env.ADMIN_USERNAME || 'admin@omniserve.com'
    });
  });

  // Database snapshot status check
  app.get('/api/db/snapshot-status', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ connected: false, message: 'MySQL is not running locally or in this environment.' });
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
