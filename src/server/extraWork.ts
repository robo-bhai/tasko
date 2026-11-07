// =========================================================================
// Extra Work Quote workflow
//   provider (assigned to the job)  -> POST /api/orders/:id/extra-work
//   customer (owner of the order)   -> POST /api/orders/:id/extra-work/:quoteId/respond
// Every call needs a valid session token. Emails go to admin, provider AND customer.
// =========================================================================
import type { Express, Request, Response } from 'express';
import { isDbConnected, query } from './db.js';
import { sendBrevoEmail } from './brevo.js';
import { saveDiskPersistentState } from './snapshotManager.js';
import { getRequestActor } from './session.js';

export interface ExtraWorkContext {
  getOrders: () => any[];
  getUsers: () => any[];
}

const QUOTE_ALLOWED_STATUSES = ['assigned', 'on_the_way', 'work_started'];
const MAX_AMOUNT = 200000;

const esc = (v: any) =>
  String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const adminEmail = () =>
  (process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com').trim();

async function findUser(ctx: ExtraWorkContext, id?: string): Promise<any | null> {
  if (!id) return null;
  const mem = ctx.getUsers().find(u => u && u.id === id);
  if (mem && mem.email) return mem;
  if (isDbConnected()) {
    try {
      const rows = await query('SELECT id, name, email, phone, role FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows && rows[0]) return rows[0];
    } catch { /* ignore */ }
  }
  return mem || null;
}

const approvedSum = (order: any) =>
  (Array.isArray(order.extraWork) ? order.extraWork : [])
    .filter((q: any) => q.status === 'approved')
    .reduce((s: number, q: any) => s + (Number(q.amount) || 0), 0);

function recomputeTotals(order: any) {
  if (order.pricingBaseTotal === undefined) {
    order.pricingBaseTotal = Number(order.pricing?.total) || 0;
  }
  order.extraWorkTotal = approvedSum(order);
  order.pricing = { ...order.pricing, total: order.pricingBaseTotal + order.extraWorkTotal };
}

async function persistOrder(ctx: ExtraWorkContext, order: any) {
  const list = ctx.getOrders();
  const idx = list.findIndex(o => o.id === order.id);
  if (idx >= 0) list[idx] = order;
  saveDiskPersistentState({ orders: list });
  if (isDbConnected()) {
    try {
      await query(
        'UPDATE orders SET pricing_total = ?, raw_json = ?, updated_at = NOW() WHERE id = ?',
        [Number(order.pricing?.total) || 0, JSON.stringify(order), order.id]
      );
    } catch (err: any) {
      console.warn('[ExtraWork] MySQL update note:', err.message);
    }
  }
}

type Audience = 'customer' | 'admin' | 'provider';
type EventKind = 'requested' | 'approved' | 'rejected';

function copyFor(kind: EventKind, who: Audience, order: any, quote: any): { subject: string; heading: string; intro: string } {
  const id = order.id;
  const amt = `PKR ${Number(quote.amount).toLocaleString()}`;
  const prov = order.assignedProviderName || 'Provider';
  const cust = order.customerName || 'Customer';
  const t = {
    requested: {
      customer: {
        subject: `[Khanewal Connect] Order #${id}: Extra kaam ka quote (${amt}) - approval darkar hai`,
        heading: 'Extra kaam ka quote aya hai',
        intro: `${prov} ne inspection ke baad extra kaam ka quote bheja hai. App mein jaa kar Approve ya Reject karein. Aap ki manzoori ke baghair ye raqam bill mein shamil nahi hogi.`
      },
      admin: {
        subject: `[Khanewal Connect] Order #${id}: ${prov} ne extra quote bheja (${amt})`,
        heading: 'Provider ne extra charges ka quote bheja',
        intro: `${prov} ne ${cust} ke order par extra kaam ka quote bheja hai. Customer ke jawab ka intezar hai.`
      },
      provider: {
        subject: `[Khanewal Connect] Order #${id}: Aap ka extra quote customer ko bhej diya gaya`,
        heading: 'Quote customer ko bhej diya gaya',
        intro: `Aap ka quote ${cust} ko bhej diya gaya hai. Customer ke approve karne tak extra kaam shuru na karein.`
      }
    },
    approved: {
      customer: {
        subject: `[Khanewal Connect] Order #${id}: Aap ne extra kaam approve kar diya (${amt})`,
        heading: 'Extra kaam approve ho gaya',
        intro: 'Aap ne extra kaam ka quote approve kiya. Neeche naya total diya gaya hai.'
      },
      admin: {
        subject: `[Khanewal Connect] Order #${id}: Customer ne extra charges approve kiye (${amt})`,
        heading: 'Customer ne extra charges approve kiye',
        intro: `${cust} ne ${prov} ka extra quote approve kar diya. Order ka total update ho gaya hai.`
      },
      provider: {
        subject: `[Khanewal Connect] Order #${id}: Customer ne aap ka extra quote approve kar diya (${amt})`,
        heading: 'Quote approve ho gaya - kaam shuru karein',
        intro: `${cust} ne aap ka extra quote approve kar diya hai. Ab aap extra kaam kar sakte hain.`
      }
    },
    rejected: {
      customer: {
        subject: `[Khanewal Connect] Order #${id}: Aap ne extra kaam reject kar diya`,
        heading: 'Extra kaam reject ho gaya',
        intro: 'Aap ne extra kaam ka quote reject kiya. Aap se sirf original charges (visit + equipment) liye jayenge.'
      },
      admin: {
        subject: `[Khanewal Connect] Order #${id}: Customer ne extra charges reject kiye (${amt})`,
        heading: 'Customer ne extra charges reject kiye',
        intro: `${cust} ne ${prov} ka extra quote reject kar diya. Total mein koi izafa nahi hua.`
      },
      provider: {
        subject: `[Khanewal Connect] Order #${id}: Customer ne aap ka extra quote reject kar diya`,
        heading: 'Quote reject ho gaya',
        intro: `${cust} ne extra quote reject kar diya. Extra kaam na karein aur sirf original kaam mukammal karein. Extra raqam talab nahi ki ja sakti.`
      }
    }
  } as const;
  return t[kind][who];
}

function buildHtml(kind: EventKind, who: Audience, order: any, quote: any): string {
  const c = copyFor(kind, who, order, quote);
  const accent = kind === 'approved' ? '#10b981' : kind === 'rejected' ? '#f43f5e' : '#f59e0b';
  const statusLabel = kind === 'requested' ? 'Customer ke jawab ka intezar' : kind === 'approved' ? 'Approved' : 'Rejected';
  const baseTotal = Number(order.pricingBaseTotal ?? order.pricing?.total) || 0;
  const row = (l: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#94a3b8;font-size:13px;">${esc(l)}</td><td style="padding:6px 0;color:#fff;font-size:13px;text-align:right;font-weight:600;">${v}</td></tr>`;
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#0b0d14;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#131722;border:1px solid #2d3748;border-radius:16px;overflow:hidden;">
<tr><td style="height:5px;background:${accent};"></td></tr>
<tr><td style="padding:26px 28px 8px;">
<div style="font-size:11px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:.8px;">Khanewal Connect &bull; Extra Work</div>
<h1 style="margin:10px 0 6px;font-size:20px;color:#fff;">${esc(c.heading)}</h1>
<p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">${esc(c.intro)}</p></td></tr>
<tr><td style="padding:14px 28px 6px;"><table width="100%" style="border-top:1px solid #2d3748;">
${row('Order', '#' + esc(order.id))}
${row('Customer', esc(order.customerName))}
${row('Provider', esc(order.assignedProviderName || '-'))}
${row('Extra kaam', esc(quote.description))}
${row('Extra raqam', 'PKR ' + Number(quote.amount).toLocaleString())}
${row('Status', esc(statusLabel))}
${quote.responseNote ? row('Customer ka note', esc(quote.responseNote)) : ''}
${row('Original total', 'PKR ' + baseTotal.toLocaleString())}
${row('Approved extra (total)', 'PKR ' + Number(order.extraWorkTotal || 0).toLocaleString())}
<tr><td style="padding:10px 0 0;border-top:1px solid #2d3748;color:#fff;font-weight:800;">Kul raqam</td>
<td style="padding:10px 0 0;border-top:1px solid #2d3748;text-align:right;color:${accent};font-weight:800;font-size:16px;">PKR ${Number(order.pricing?.total || 0).toLocaleString()}</td></tr>
</table></td></tr>
<tr><td style="padding:18px 28px 24px;color:#64748b;font-size:11px;">Ye khud kaar email hai. Order ki tafseel aur jawab dene ke liye Khanewal Connect app kholein.</td></tr>
</table></body></html>`;
}

async function sendToAll(ctx: ExtraWorkContext, kind: EventKind, order: any, quote: any) {
  const [customer, provider] = await Promise.all([
    findUser(ctx, order.customerId),
    findUser(ctx, order.assignedProviderId)
  ]);
  const targets: Array<{ who: Audience; email?: string; name: string }> = [
    { who: 'customer', email: customer?.email || order.customerEmail, name: order.customerName || 'Customer' },
    { who: 'admin', email: adminEmail(), name: 'Administrator' },
    { who: 'provider', email: provider?.email, name: order.assignedProviderName || 'Provider' }
  ];
  const results = await Promise.allSettled(
    targets
      .filter(t => t.email && String(t.email).includes('@') && !String(t.email).endsWith('@customer.khw'))
      .map(t =>
        sendBrevoEmail({
          toEmail: String(t.email).trim(),
          toName: t.name,
          subject: copyFor(kind, t.who, order, quote).subject,
          htmlContent: buildHtml(kind, t.who, order, quote)
        })
      )
  );
  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r.value as any)?.success));
  if (failed.length) console.warn(`[ExtraWork] ${failed.length} email(s) failed for order #${order.id} (${kind}).`);
}

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function registerExtraWorkRoutes(app: Express, ctx: ExtraWorkContext) {
  // ---- Provider sends an extra-work quote ---------------------------------
  app.post('/api/orders/:id/extra-work', async (req: Request, res: Response) => {
    const actor = getRequestActor(req);
    if (!actor) {
      return res.status(401).json({ success: false, error: 'Session khatam ho gaya hai. Dobara login karein.' });
    }
    const order = ctx.getOrders().find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order nahi mila.' });

    if (actor.role !== 'provider' || !order.assignedProviderId || order.assignedProviderId !== actor.id) {
      return res.status(403).json({
        success: false,
        error: 'Sirf wohi provider extra charges bhej sakta hai jise ye job assign hui hai.'
      });
    }
    if (!QUOTE_ALLOWED_STATUSES.includes(order.status)) {
      return res.status(409).json({ success: false, error: 'Is order par ab extra quote nahi bheja ja sakta.' });
    }
    if (Array.isArray(order.extraWork) && order.extraWork.some((q: any) => q.status === 'pending')) {
      return res.status(409).json({ success: false, error: 'Pehla quote abhi customer ke jawab ka muntazir hai.' });
    }

    const description = String(req.body?.description ?? '').trim();
    const amount = Math.round(Number(req.body?.amount));
    if (description.length < 5 || description.length > 300) {
      return res.status(400).json({ success: false, error: 'Extra kaam ki tafseel 5 se 300 harf mein likhein.' });
    }
    if (!Number.isFinite(amount) || amount < 1 || amount > MAX_AMOUNT) {
      return res.status(400).json({ success: false, error: `Raqam 1 se ${MAX_AMOUNT.toLocaleString()} PKR ke darmiyan honi chahiye.` });
    }

    const provider = await findUser(ctx, actor.id);
    const quote = {
      id: `xw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      requestedById: actor.id,
      requestedByName: provider?.name || order.assignedProviderName || 'Provider'
    };

    if (order.pricingBaseTotal === undefined) order.pricingBaseTotal = Number(order.pricing?.total) || 0;
    order.extraWork = [...(Array.isArray(order.extraWork) ? order.extraWork : []), quote];
    order.timeline = [
      ...(Array.isArray(order.timeline) ? order.timeline : []),
      { status: order.status, label: `Extra Work Quote: PKR ${amount.toLocaleString()}`, timestamp: timeNow(), note: description }
    ];
    order.updatedAt = new Date().toISOString();
    await persistOrder(ctx, order);

    sendToAll(ctx, 'requested', order, quote).catch(() => {});
    res.json({ success: true, order, quote });
  });

  // ---- Customer approves / rejects ----------------------------------------
  app.post('/api/orders/:id/extra-work/:quoteId/respond', async (req: Request, res: Response) => {
    const actor = getRequestActor(req);
    if (!actor) {
      return res.status(401).json({ success: false, error: 'Session khatam ho gaya hai. Dobara login karein.' });
    }
    const order = ctx.getOrders().find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order nahi mila.' });

    if (actor.role !== 'customer' || actor.id !== order.customerId) {
      return res.status(403).json({ success: false, error: 'Sirf is order ka customer quote approve ya reject kar sakta hai.' });
    }
    const decision = String(req.body?.decision || '');
    if (decision !== 'approve' && decision !== 'reject') {
      return res.status(400).json({ success: false, error: 'decision "approve" ya "reject" hona chahiye.' });
    }
    const quote = (Array.isArray(order.extraWork) ? order.extraWork : []).find((q: any) => q.id === req.params.quoteId);
    if (!quote) return res.status(404).json({ success: false, error: 'Quote nahi mila.' });
    if (quote.status !== 'pending') {
      return res.status(409).json({ success: false, error: 'Is quote par pehle hi jawab diya ja chuka hai.' });
    }
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(409).json({ success: false, error: 'Ye order band ho chuka hai.' });
    }

    quote.status = decision === 'approve' ? 'approved' : 'rejected';
    quote.respondedAt = new Date().toISOString();
    const note = String(req.body?.note ?? '').trim().slice(0, 200);
    if (note) quote.responseNote = note;

    recomputeTotals(order);
    order.timeline = [
      ...(Array.isArray(order.timeline) ? order.timeline : []),
      {
        status: order.status,
        label: decision === 'approve'
          ? `Extra Work Approved: PKR ${Number(quote.amount).toLocaleString()}`
          : 'Extra Work Rejected by Customer',
        timestamp: timeNow(),
        note: quote.description
      }
    ];
    order.updatedAt = new Date().toISOString();
    await persistOrder(ctx, order);

    sendToAll(ctx, quote.status as EventKind, order, quote).catch(() => {});
    res.json({ success: true, order, quote });
  });
}
