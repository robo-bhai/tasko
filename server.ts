import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Brevo = require('@getbrevo/brevo');
const { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } = Brevo;

import { initDbPool, isDbConnected, query } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Brevo API Instance Safely
let apiInstance: any = null;
try {
  apiInstance = new TransactionalEmailsApi();
  if (process.env.BREVO_API_KEY) {
    apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
  }
} catch (e) {
  console.warn('Brevo API initialization warning:', e);
}

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

  // --- BREVO PASSWORD RESET ENDPOINTS ---

  // 1. Forgot Password - Send Reset Link via Brevo API
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    try {
      // Check if user exists in database
      const users = await query('SELECT id, email, name FROM users WHERE email = ? LIMIT 1', [email]);
      if (!users || users.length === 0) {
        // Security ke liye generic message dein taake email enumeration na ho sake
        return res.status(200).json({ success: true, message: 'Agar yeh email registered hai, toh password reset link bhej diya gaya hai.' });
      }

      const user = users[0] as any;
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 Hour expiry

      // Store reset token in database
      try {
        await query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [
          resetToken,
          tokenExpiry.toISOString().slice(0, 19).replace('T', ' '),
          user.id
        ]);
      } catch (dbErr) {
        console.warn('Database columns for reset token might be missing. Proceeding with email dispatch...', dbErr);
      }

      const clientUrl = req.headers.origin || `http://localhost:${PORT}`;
      const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

      // Prepare Brevo Transactional Email
      if (apiInstance && process.env.BREVO_API_KEY) {
        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = "Password Reset Request - Omnitask Super App";
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.name || 'User'},</p>
            <p>Aapne apna password reset karne ki request ki hai. Niche diye gaye button par click karke apna password badlein:</p>
            <p>
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </p>
            <p>Yeh link 1 ghante ke baad expire ho jayega.</p>
            <p>Agar aapne yeh request nahi ki, toh is email ko ignore karein.</p>
          </div>
        `;
        sendSmtpEmail.sender = {
          name: process.env.SENDER_NAME || "Omnitask Support",
          email: process.env.SENDER_EMAIL || "no-reply@omnitask.app"
        };
        sendSmtpEmail.to = [{ email: user.email, name: user.name || 'User' }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
      } else {
        console.warn('Brevo API key not configured. Skipping actual email send.');
      }

      return res.status(200).json({ success: true, message: 'Password reset link aapke email par bhej diya gaya hai.' });
    } catch (error: any) {
      console.error('[Brevo Error] Failed to send reset email:', error);
      return res.status(500).json({ success: false, message: 'Email bhejne mein nakami hui. Baraye meherbani baad mein koshish karein.' });
    }
  });

  // 2. Reset Password - Update New Password using Token
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token aur naya password dono darkar hain.' });
    }

    try {
      const users = await query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() LIMIT 1', [token]);
      if (!users || users.length === 0) {
        return res.status(400).json({ success: false, message: 'Password reset link ghalat hai ya expire ho chuka hai.' });
      }

      const user = users[0] as any;

      // Update password and clear reset token
      await query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [
        newPassword,
        user.id
      ]);

      return res.status(200).json({ success: true, message: 'Password kamyabi se tabdeel ho gaya hai! Ab aap login kar sakte hain.' });
    } catch (error: any) {
      console.error('[Database Error] Failed to reset password:', error);
      return res.status(500).json({ success: false, message: 'Password update karte waqt error aaya.' });
    }
  });

  // --- END OF BREVO ENDPOINTS ---

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
