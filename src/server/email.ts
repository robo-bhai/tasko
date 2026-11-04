// =========================================================================
// Khanewal Connect - Professional Brevo (Sendinblue) Transactional Email Service
// =========================================================================

export interface SendEmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export function getSenderConfig() {
  return {
    apiKey: process.env.BREVO_API_KEY || '',
    senderName: process.env.SENDER_NAME || 'Khanewal Connect',
    senderEmail: process.env.SENDER_EMAIL || 'info@84wala.uqn88.store',
    adminEmail: process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com'
  };
}

export function isBrevoConfigured(): boolean {
  const { apiKey } = getSenderConfig();
  return Boolean(apiKey && apiKey.trim().length > 10);
}

export async function sendBrevoEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { apiKey, senderName, senderEmail } = getSenderConfig();

  if (!isBrevoConfigured()) {
    console.log(`[Brevo Email Disabled] Secret BREVO_API_KEY is not configured. Email to ${options.toEmail} simulated successfully.`);
    return { 
      success: true, 
      messageId: `simulated-${Date.now()}` 
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
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      console.error(`[Brevo Error] Failed to send email to ${options.toEmail}:`, errMsg);
      return { success: false, error: errMsg };
    }

    console.log(`[Brevo Success] Transactional email sent to ${options.toEmail} (ID: ${data.messageId || 'ok'})`);
    return { success: true, messageId: data.messageId };
  } catch (err: any) {
    console.error(`[Brevo Network Exception] to ${options.toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 1. Password Reset Professional Email (5 Minutes Validity)
// =========================================================================
export async function sendPasswordResetEmail(params: {
  toEmail: string;
  userName?: string;
  resetUrl: string;
  expiresMinutes?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { toEmail, userName = 'Valued User', resetUrl, expiresMinutes = 5 } = params;
  const { senderName } = getSenderConfig();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Khanewal Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d14; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0d14; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 560px; background: #131722; border-radius: 16px; border: 1px solid #2d3748; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #f59e0b, #d97706, #b45309);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 15px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 20px; font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.8px;">
                Khanewal Connect • Security Alert
              </div>
              <h1 style="margin: 20px 0 6px; font-size: 22px; font-weight: 800; color: #ffffff;">
                Password Reset Request
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                پاسورڈ تبدیل کرنے کی درخواست
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 15px 30px 30px; line-height: 1.6; font-size: 14px; color: #cbd5e1;">
              <p style="margin: 0 0 16px;">
                Assalam-o-Alaikum <strong>${escapeHtml(userName)}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #94a3b8;">
                We received a request to reset the password for your account associated with <strong style="color: #f1f5f9;">${escapeHtml(toEmail)}</strong>. If you made this request, please click the secure button below to set a new password:
              </p>

              <!-- Reset Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #090b10; font-weight: 800; font-size: 15px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Reset Password Now / نیا پاسورڈ بنائیں
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 5 Minute Countdown Notice -->
              <div style="background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px 16px; margin: 20px 0 24px;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #f87171;">
                  ⏳ STRICT 5-MINUTE VALIDITY (صرف 5 منٹ کے لیے کارآمد)
                </p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #fca5a5; line-height: 1.5;">
                  For your security, this password reset link is strictly valid for <strong>${expiresMinutes} minutes</strong> only. Once expired, you will need to request a new link.
                </p>
              </div>

              <p style="margin: 0 0 10px; font-size: 12px; color: #64748b;">
                If the button above does not work, copy and paste this URL into your browser:
              </p>
              <div style="background-color: #0a0d16; padding: 10px 12px; border-radius: 6px; border: 1px solid #1e293b; word-break: break-all; font-family: monospace; font-size: 11px; color: #38bdf8;">
                ${resetUrl}
              </div>

              <p style="margin: 22px 0 0; font-size: 12px; color: #64748b;">
                If you did not request a password reset, please ignore this email or contact support immediately. Your account remains completely safe.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #0b0d14; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #94a3b8;">
                Khanewal Connect — 84wala.uqn88.store
              </p>
              <p style="margin: 0;">
                Civil Lines & Main Complex, Khanewal, Punjab, Pakistan
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail,
    toName: userName,
    subject: `🔑 Password Reset Request (Valid 5 Mins) - ${senderName}`,
    htmlContent: html
  });
}

// =========================================================================
// 2. New Order Notification Email to Admin
// =========================================================================
export async function sendOrderAdminNotificationEmail(params: {
  adminEmail: string;
  order: any;
}): Promise<{ success: boolean; error?: string }> {
  const { adminEmail, order } = params;
  const { senderName } = getSenderConfig();

  const title = order.serviceDetails?.serviceName || 
                order.deliveryDetails?.itemName || 
                order.transportDetails?.vehicleName || 
                order.eventDetails?.eventTitle || 
                order.category || 'New Request';

  const total = order.pricing?.total || 0;
  const customerName = order.customerName || 'Customer';
  const customerPhone = order.customerPhone || 'N/A';
  const address = order.deliveryAddress || 'Khanewal';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #0b0d14; color: #e2e8f0; padding: 25px;">
  <div style="max-width: 580px; margin: auto; background: #131722; border-radius: 12px; border: 1px solid #334155; overflow: hidden;">
    <div style="background: #f59e0b; padding: 15px 20px; color: #000; font-weight: 900; font-size: 16px;">
      🔔 ADMIN ALERT: New Order Received #${escapeHtml(order.id)}
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px; margin-top: 0;">A new order has been placed on <strong>Khanewal Connect</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 8px 0; color: #94a3b8;">Order ID:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #fbbf24;">#${escapeHtml(order.id)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 8px 0; color: #94a3b8;">Category / Item:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">${escapeHtml(title)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 8px 0; color: #94a3b8;">Customer:</td>
          <td style="padding: 8px 0; color: #ffffff;">${escapeHtml(customerName)} (${escapeHtml(customerPhone)})</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 8px 0; color: #94a3b8;">Address:</td>
          <td style="padding: 8px 0; color: #ffffff;">${escapeHtml(address)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 8px 0; color: #94a3b8;">Total Price:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #22c55e; font-size: 15px;">PKR ${total.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Payment Method:</td>
          <td style="padding: 8px 0; color: #ffffff; text-transform: uppercase;">${escapeHtml(order.paymentMethod || 'COD')}</td>
        </tr>
      </table>

      <div style="margin-top: 20px; text-align: center;">
        <a href="https://84wala.uqn88.store" target="_blank" style="display: inline-block; background: #f59e0b; color: #000; padding: 10px 24px; font-weight: bold; text-decoration: none; border-radius: 8px;">
          Open Admin Portal & Dispatch
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail: adminEmail,
    toName: 'Super Admin',
    subject: `🚨 [New Order] #${order.id} - ${title} (PKR ${total})`,
    htmlContent: html
  });
}

// =========================================================================
// 3. Order Confirmation Email to Customer
// =========================================================================
export async function sendOrderCustomerConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  order: any;
}): Promise<{ success: boolean; error?: string }> {
  const { customerEmail, customerName, order } = params;
  const { senderName } = getSenderConfig();

  const title = order.serviceDetails?.serviceName || 
                order.deliveryDetails?.itemName || 
                order.transportDetails?.vehicleName || 
                order.eventDetails?.eventTitle || 
                order.category || 'Order';

  const total = order.pricing?.total || 0;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #0b0d14; color: #e2e8f0; padding: 25px;">
  <div style="max-width: 580px; margin: auto; background: #131722; border-radius: 12px; border: 1px solid #334155; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #10b981, #059669); padding: 15px 20px; color: #ffffff; font-weight: 800; font-size: 16px;">
      ✅ Order Confirmed: #${escapeHtml(order.id)}
    </div>
    <div style="padding: 24px;">
      <p style="margin-top: 0; font-size: 14px;">Assalam-o-Alaikum <strong>${escapeHtml(customerName)}</strong>,</p>
      <p style="color: #94a3b8; font-size: 13px;">
        Aapka order kamyabi se book ho gaya hai. Humari team jald worker / rider assign karke aap se rabta karegi.
      </p>

      <div style="background: #090b10; border-radius: 8px; padding: 16px; margin: 18px 0; border: 1px solid #1e293b;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Booked Service / Delivery:</div>
        <div style="font-size: 15px; font-weight: bold; color: #fbbf24;">${escapeHtml(title)}</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 8px;">Delivery Address: ${escapeHtml(order.deliveryAddress || 'Khanewal')}</div>
        <div style="font-size: 14px; font-weight: bold; color: #34d399; margin-top: 8px;">Total Payable: PKR ${total.toLocaleString()} (${escapeHtml((order.paymentMethod || 'cod').toUpperCase())})</div>
      </div>

      <p style="font-size: 12px; color: #64748b;">
        Tracking URL: <a href="https://84wala.uqn88.store" style="color: #38bdf8;">84wala.uqn88.store</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail: customerEmail,
    toName: customerName,
    subject: `✅ Order Confirmation #${order.id} - ${senderName}`,
    htmlContent: html
  });
}

// =========================================================================
// 4. Order Status Update Email to Customer
// =========================================================================
export async function sendOrderStatusUpdateEmail(params: {
  customerEmail: string;
  customerName: string;
  order: any;
  newStatus: string;
  note?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { customerEmail, customerName, order, newStatus, note } = params;
  const { senderName } = getSenderConfig();

  const statusMap: Record<string, { label: string; urdu: string; color: string }> = {
    assigned: { label: 'Provider Assigned', urdu: 'Worker Assign Ho Gaya Hai', color: '#38bdf8' },
    on_the_way: { label: 'Rider / Technician On The Way', urdu: 'Worker Rastey Mein Hai', color: '#f59e0b' },
    work_started: { label: 'Work In Progress', urdu: 'Kaam Shuru Kar Diya Gaya Hai', color: '#a855f7' },
    completed: { label: 'Order Completed Successfully', urdu: 'Order Kamyabi Se Mukammal Ho Gaya', color: '#10b981' },
    cancelled: { label: 'Order Cancelled', urdu: 'Order Mansookh Kar Diya Gaya', color: '#ef4444' }
  };

  const statusInfo = statusMap[newStatus] || { label: newStatus, urdu: newStatus, color: '#f59e0b' };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #0b0d14; color: #e2e8f0; padding: 25px;">
  <div style="max-width: 580px; margin: auto; background: #131722; border-radius: 12px; border: 1px solid #334155; overflow: hidden;">
    <div style="background: ${statusInfo.color}; padding: 15px 20px; color: #000000; font-weight: 800; font-size: 16px;">
      📦 Order #${escapeHtml(order.id)} Status Update: ${statusInfo.label}
    </div>
    <div style="padding: 24px;">
      <p style="margin-top: 0; font-size: 14px;">Assalam-o-Alaikum <strong>${escapeHtml(customerName)}</strong>,</p>
      <p style="font-size: 14px; color: #ffffff;">
        Aapke order ka status update ho chuka hai: <strong>${statusInfo.urdu}</strong>.
      </p>

      ${order.assignedProviderName ? `
        <div style="background: #090b10; border-radius: 8px; padding: 14px; margin: 16px 0; border: 1px solid #1e293b;">
          <div style="font-size: 12px; color: #94a3b8;">Assigned Specialist / Rider:</div>
          <div style="font-size: 14px; font-weight: bold; color: #fbbf24; margin-top: 2px;">${escapeHtml(order.assignedProviderName)} (${escapeHtml(order.assignedProviderPhone || 'Phone hidden')})</div>
        </div>
      ` : ''}

      ${note ? `
        <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 10px 14px; font-size: 12px; color: #fde68a; margin: 14px 0;">
          <strong>Note:</strong> ${escapeHtml(note)}
        </div>
      ` : ''}

      <div style="margin-top: 20px; text-align: center;">
        <a href="https://84wala.uqn88.store" target="_blank" style="display: inline-block; background: #f59e0b; color: #000; padding: 10px 24px; font-weight: bold; text-decoration: none; border-radius: 8px;">
          Track Live in App
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail: customerEmail,
    toName: customerName,
    subject: `📦 Order #${order.id} Status: ${statusInfo.label} - ${senderName}`,
    htmlContent: html
  });
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
