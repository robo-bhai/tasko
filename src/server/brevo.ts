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
// HIGH-CONTRAST, HUMAN-READABLE PROFESSIONAL EMAIL TEMPLATES
// Specially engineered for 100% readability on all email clients (Gmail, Outlook, Apple)
// =========================================================================

export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Khanewal Connect Password</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);">
    
    <!-- Header Banner -->
    <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; border-bottom: 4px solid #f59e0b;">
      <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 5px 14px; border-radius: 50px; letter-spacing: 1px; margin-bottom: 12px;">
        Account Security Alert
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">
        Khanewal Connect
      </h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 0; font-weight: 500;">
        Official Services & Delivery Super App (Khanewal, Pakistan)
      </p>
    </div>
    
    <!-- Main Content Body -->
    <div style="padding: 36px 28px; background-color: #ffffff;">
      <h2 style="font-size: 18px; color: #0f172a; font-weight: 800; margin: 0 0 16px 0;">
        Assalam-o-Alaikum, ${name || 'Valued User'}!
      </h2>
      
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
        Aapne apne <strong>Khanewal Connect</strong> account ka password tabdeel (reset) karne ki request bheji hai. Apna naya password muqarrar karne ke liye niche diye gaye button par click karein:
      </p>

      <!-- High-Contrast 5-Minute Timer Warning -->
      <div style="background-color: #fff1f2; border: 2px solid #e11d48; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
        <div style="display: flex; align-items: flex-start;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #9f1239; margin-bottom: 4px;">
              ⏱️ ZAROORI TIME LIMIT: 5 MINUTES ONLY
            </div>
            <div style="font-size: 13px; line-height: 1.5; color: #881337; font-weight: 600;">
              Yeh password reset link sirf <strong>5 MINUTES (300 Seconds)</strong> ke liye fa'aal (active) hai. 5 minute guzarne ke baad yeh link khud-bakhud expire ho jaye ga.
            </div>
          </div>
        </div>
      </div>

      <!-- High-Contrast Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 16px; padding: 16px 38px; border-radius: 12px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
          Set New Password &rarr;
        </a>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
        Agar aapne yeh password reset request nahi bheji thi, to pareshan hone ki zaroorat nahi hai. Aapka password purana hi rahe ga jab tak koi is link par click karke naya password set na kare.
      </p>

      <!-- Readable Direct URL Box -->
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; word-break: break-all;">
        <span style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px;">
          Agar button click na ho, to yeh link copy karke apne browser mein paste karein:
        </span>
        <a href="${resetUrl}" style="color: #b45309; text-decoration: underline; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 600; line-height: 1.4;">
          ${resetUrl}
        </a>
      </div>
    </div>

    <!-- Clean Footer -->
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">&copy; 2026 Khanewal Connect. Civil Lines, Main Complex, Khanewal, Punjab, Pakistan.</p>
      <p style="margin: 0;">Automated transactional security notification sent via verified Brevo relay.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getPasswordResetSuccessEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);">
    <div style="background-color: #065f46; padding: 24px; text-align: center; border-bottom: 3px solid #10b981;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
        ✓ Password Updated Successfully!
      </h2>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
        Assalam-o-Alaikum ${name || 'User'},
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
        Aapke <strong>Khanewal Connect</strong> account ka password kamyabi ke sath update kar diya gaya hai. Ab aap apne naye password ke zariye foran login kar sakte hain.
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 14px; font-size: 13px; color: #166534; font-weight: 600;">
        Aapka account ab naye credentials ke sath 100% mehfooz hai.
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px; line-height: 1.5;">
        Agar yeh tabdeeli aapne khud nahi ki, to foran Admin WhatsApp par rabta karein taake account ki hifazat ki ja sake.
      </p>
    </div>
    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
      &copy; 2026 Khanewal Connect. Automated Security Service.
    </div>
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
  const statusBg = params.status === 'completed' ? '#dcfce7' : params.status === 'cancelled' ? '#fee2e2' : '#fef3c7';
  const statusColor = params.status === 'completed' ? '#15803d' : params.status === 'cancelled' ? '#b91c1c' : '#b45309';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${params.title}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);">
    
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 28px 24px; border-bottom: 3px solid #f59e0b;">
      <span style="display: inline-block; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
        ${params.status.replace(/_/g, ' ').toUpperCase()}
      </span>
      <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 22px; font-weight: 800;">
        ${params.title}
      </h2>
      <p style="color: #94a3b8; margin: 0; font-size: 13px;">
        Order Tracking ID: #${params.orderId}
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 28px 24px;">
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
        ${isForAdmin 
          ? `Naya order register ho chuka hai. Mukammal tafseelat darj zail hain:` 
          : `Assalam-o-Alaikum <strong>${params.customerName}</strong>! Aapke order ka taza tareen status aur tafseelat:`}
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Customer Name:</td>
          <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${params.customerName}</td>
        </tr>
        ${params.customerPhone ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Mobile Number:</td>
          <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right; font-family: monospace;">${params.customerPhone}</td>
        </tr>` : ''}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Service / Delivery:</td>
          <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${params.serviceOrItem}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Delivery Address:</td>
          <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${params.deliveryAddress}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Current Status:</td>
          <td style="padding: 12px 0; color: ${statusColor}; font-size: 14px; font-weight: 800; text-align: right; text-transform: uppercase;">${params.status}</td>
        </tr>
        ${params.notes ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Special Instructions:</td>
          <td style="padding: 12px 0; color: #334155; font-size: 13px; text-align: right;">${params.notes}</td>
        </tr>` : ''}
      </table>

      <!-- Total Price Highlight Box -->
      <div style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 18px; text-align: center;">
        <div style="font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
          Total Bill Amount
        </div>
        <div style="font-size: 28px; font-weight: 900; color: #b45309; margin-top: 4px;">
          PKR ${params.totalPrice.toLocaleString()}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      &copy; 2026 Khanewal Connect. Khanewal City, Punjab, Pakistan.
    </div>
  </div>
</body>
</html>
  `;
}
