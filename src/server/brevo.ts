import crypto from 'crypto';
import { query, isDbConnected } from './db.js';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

// In-memory token store for ultra-reliable fallback
interface ResetTokenRecord {
  token: string;
  email: string;
  name: string;
  expiresAt: number; // timestamp in ms (5 minutes)
  used: boolean;
}

const memoryResetTokens = new Map<string, ResetTokenRecord>();

// Ensure password_resets table exists if MySQL is connected
export async function initPasswordResetsTable() {
  if (!isDbConnected()) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`password_resets\` (
        \`token\` VARCHAR(128) NOT NULL PRIMARY KEY,
        \`email\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(150) NULL,
        \`expires_at\` BIGINT NOT NULL,
        \`used\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_pr_email\` (\`email\`),
        INDEX \`idx_pr_token\` (\`token\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[Brevo Email & Auth] Verified `password_resets` table in MySQL');
  } catch (err: any) {
    console.warn('[Brevo Email & Auth] Notice on password_resets table check:', err.message);
  }
}

/**
 * Send an email using the official Brevo (Sendinblue) Transactional REST API v3
 */
export async function sendBrevoEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY || '';
  const senderEmail = process.env.SENDER_EMAIL || process.env.ADMIN_USERNAME || 'notifications@khanewalconnect.pk';
  const senderName = process.env.SENDER_NAME || 'Khanewal Connect';

  if (!apiKey) {
    console.warn('[Brevo Service] BREVO_API_KEY is not defined in environment/GitHub Secrets. Simulating email dispatch to:', options.toEmail);
    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
      error: 'Simulated (BREVO_API_KEY not configured)'
    };
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: options.toEmail,
        name: options.toName || options.toEmail.split('@')[0]
      }
    ],
    subject: options.subject,
    htmlContent: options.htmlContent,
    ...(options.textContent ? { textContent: options.textContent } : {})
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = (data as any)?.message || `Brevo API HTTP ${response.status}: ${response.statusText}`;
      console.error('[Brevo Service] Email sending failed:', errorMsg, data);
      return { success: false, error: errorMsg };
    }

    const messageId = (data as any)?.messageId || 'sent';
    console.log(`[Brevo Service] Successfully dispatched email "${options.subject}" to ${options.toEmail} (ID: ${messageId})`);
    return { success: true, messageId };
  } catch (err: any) {
    console.error('[Brevo Service] Network error sending email via Brevo:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Generate a 5-minute valid password reset token for a user
 */
export async function createPasswordResetToken(email: string, name: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const expiresAt = Date.now() + FIVE_MINUTES_MS;

  // Save to in-memory map
  memoryResetTokens.set(token, {
    token,
    email: email.toLowerCase().trim(),
    name,
    expiresAt,
    used: false
  });

  // Save to MySQL if connected
  if (isDbConnected()) {
    try {
      await query(`
        INSERT INTO \`password_resets\` (\`token\`, \`email\`, \`name\`, \`expires_at\`, \`used\`)
        VALUES (?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE \`expires_at\` = VALUES(\`expires_at\`), \`used\` = 0
      `, [token, email.toLowerCase().trim(), name, expiresAt]);
    } catch (err: any) {
      console.warn('[Brevo Auth] Failed saving token to MySQL, saved in memory:', err.message);
    }
  }

  return token;
}

/**
 * Verify if a reset token is valid and not expired (< 5 mins)
 */
export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; email?: string; name?: string; error?: string; remainingSeconds?: number }> {
  if (!token) return { valid: false, error: 'Token is required' };

  let record: ResetTokenRecord | undefined = memoryResetTokens.get(token);

  // If not found in memory, query MySQL
  if (!record && isDbConnected()) {
    try {
      const rows = await query('SELECT * FROM `password_resets` WHERE `token` = ? LIMIT 1', [token]);
      if (rows && rows.length > 0) {
        const r = rows[0] as any;
        record = {
          token: r.token,
          email: r.email,
          name: r.name || 'Valued User',
          expiresAt: Number(r.expires_at),
          used: Boolean(r.used)
        };
        memoryResetTokens.set(token, record);
      }
    } catch (err: any) {
      console.warn('[Brevo Auth] Token verification MySQL query error:', err.message);
    }
  }

  if (!record) {
    return { valid: false, error: 'Password reset link is invalid or has expired.' };
  }

  if (record.used) {
    return { valid: false, error: 'Yeh password reset link pehle hi istemal ho chuka hai (This link has already been used).' };
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    return { valid: false, error: 'Yeh password reset link expire ho chuka hai (5 minutes exceeded). Barae meherbani naya link request karein.' };
  }

  const remainingSeconds = Math.max(0, Math.round((record.expiresAt - now) / 1000));
  return {
    valid: true,
    email: record.email,
    name: record.name,
    remainingSeconds
  };
}

/**
 * Mark token as used
 */
export async function markTokenAsUsed(token: string) {
  const mem = memoryResetTokens.get(token);
  if (mem) {
    mem.used = true;
  }
  if (isDbConnected()) {
    try {
      await query('UPDATE `password_resets` SET `used` = 1 WHERE `token` = ?', [token]);
    } catch {
      // ignore
    }
  }
}

// =========================================================================
// PROFESSIONAL RESPONSIVE EMAIL TEMPLATES (Dark & Gold Luxury Theme)
// =========================================================================

export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Khanewal Connect Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d14; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #131722; border-radius: 20px; border: 1px solid #d97706; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #090a0f, #1a1608); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f59e0b; }
    .badge { display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #fbbf24; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 6px 14px; border-radius: 50px; letter-spacing: 1px; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; color: #f8fafc; font-weight: 700; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px; }
    .timer-alert { background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 12px; padding: 14px 18px; margin: 24px 0; display: flex; align-items: center; }
    .timer-alert p { margin: 0; font-size: 13px; color: #fca5a5; font-weight: 600; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #090a0f !important; text-decoration: none; font-weight: 900; font-size: 15px; padding: 15px 36px; border-radius: 12px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35); text-transform: uppercase; letter-spacing: 0.5px; }
    .fallback { background: #0a0d14; border: 1px solid #334155; border-radius: 10px; padding: 14px; margin-top: 24px; word-break: break-all; font-family: monospace; font-size: 11px; color: #94a3b8; }
    .footer { background: #090a0f; padding: 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; }
    .footer a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Security & Access Portal</div>
      <h1 class="title">Khanewal Connect</h1>
      <p class="subtitle">On-Demand Services & Delivery Super App (Khanewal, Pakistan)</p>
    </div>
    
    <div class="content">
      <div class="greeting">Assalam-o-Alaikum, ${name || 'Valued User'}!</div>
      
      <p class="text">
        Aapne apne <strong>Khanewal Connect</strong> account ka password reset karne ki darkhwast (request) ki hai. 
        Apna naya password set karne ke liye niche diye gaye button par click karein:
      </p>

      <div class="timer-alert">
        <p><strong>⚠️ IMPORTANT TIME LIMIT:</strong> Yeh link sirf <strong>5 MINUTES (300 Seconds)</strong> ke liye valid hai. 5 minute ke baad yeh link khud-bakhud expire ho jaye ga.</p>
      </div>

      <div class="btn-wrap">
        <a href="${resetUrl}" target="_blank" class="btn">Reset My Password &rarr;</a>
      </div>

      <p class="text" style="font-size: 12px; color: #94a3b8;">
        Agar aapne yeh request nahi ki, to fikar na karein. Aapka password tab tak tabdeel nahi hoga jab tak aap is link par click karke naya password confirm nahi karte.
      </p>

      <div class="fallback">
        <strong style="color: #cbd5e1; display: block; margin-bottom: 6px;">Button kaam nahi kar raha? Copy this link directly into your browser:</strong>
        <a href="${resetUrl}" style="color: #f59e0b; text-decoration: none;">${resetUrl}</a>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2026 Khanewal Connect. Civil Lines, Main Complex, Khanewal, Punjab, Pakistan.</p>
      <p>Automated transactional message sent via official Brevo SMTP relay.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getPasswordResetSuccessEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0d14; color: #f1f5f9; padding: 20px; }
    .box { max-width: 550px; margin: 0 auto; background: #131722; border-radius: 16px; border: 1px solid #10b981; padding: 30px; }
    h2 { color: #10b981; margin-top: 0; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Password Updated Successfully!</h2>
    <p>Assalam-o-Alaikum ${name || 'User'},</p>
    <p>Aapke Khanewal Connect account ka password kamyabi se tabdeel ho chuka hai. Ab aap apne naye password ke sath login kar sakte hain.</p>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 25px;">Agar aapne yeh change nahi kiya, to foran Admin WhatsApp par rabta karein.</p>
  </div>
</body>
</html>
  `;
}

export function getOrderNotificationEmailHtml(params: {
  title: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  serviceOrItem: string;
  totalPrice: number;
  deliveryAddress: string;
  status: string;
  isForAdmin: boolean;
  notes?: string;
}): string {
  const isForAdmin = params.isForAdmin;
  const statusColor = params.status === 'completed' ? '#10b981' : params.status === 'cancelled' ? '#ef4444' : '#f59e0b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0d14; color: #f1f5f9; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #131722; border-radius: 18px; border: 1px solid ${statusColor}; overflow: hidden; }
    .header { background: #0a0d14; padding: 24px; border-bottom: 2px solid ${statusColor}; }
    .badge { background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}; padding: 4px 10px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .body { padding: 24px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .label { color: #94a3b8; }
    .value { font-weight: bold; color: #ffffff; text-align: right; }
    .total-box { background: #0a0d14; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin-top: 20px; text-align: center; }
    .total-price { font-size: 26px; font-weight: 900; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">${params.status.toUpperCase()}</span>
      <h2 style="color: #ffffff; margin: 10px 0 4px 0;">${params.title}</h2>
      <p style="color: #94a3b8; margin: 0; font-size: 13px;">Khanewal Connect Order Reference: #${params.orderId}</p>
    </div>
    <div class="body">
      <p style="color: #e2e8f0; font-size: 14px;">
        ${isForAdmin 
          ? `Naya order register hua hai. Details niche darj hain:` 
          : `Assalam-o-Alaikum ${params.customerName}! Aapke order ki taza tareen details:`}
      </p>

      <div class="row"><span class="label">Customer Name:</span><span class="value">${params.customerName}</span></div>
      ${params.customerPhone ? `<div class="row"><span class="label">Mobile Number:</span><span class="value">${params.customerPhone}</span></div>` : ''}
      <div class="row"><span class="label">Service / Item:</span><span class="value">${params.serviceOrItem}</span></div>
      <div class="row"><span class="label">Delivery Address:</span><span class="value">${params.deliveryAddress}</span></div>
      <div class="row"><span class="label">Order Status:</span><span class="value" style="color: ${statusColor};">${params.status}</span></div>
      ${params.notes ? `<div class="row"><span class="label">Special Instructions:</span><span class="value">${params.notes}</span></div>` : ''}

      <div class="total-box">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Total Bill</div>
        <div class="total-price">PKR ${params.totalPrice.toLocaleString()}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
