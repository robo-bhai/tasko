// =========================================================================
// Lightweight signed session tokens (HMAC-SHA256)
// Issued at login. Used to prove WHO is calling an API, so that e.g. only the
// provider assigned to a job can quote extra work and only the order's customer
// can approve it. Set SESSION_SECRET in your environment (see .env.example).
// =========================================================================
import crypto from 'crypto';
import type { Request } from 'express';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

let SECRET = (process.env.SESSION_SECRET || '').trim();
if (!SECRET) {
  // No secret configured: random per server start. Everyone just has to log in again after a restart.
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[Session] SESSION_SECRET is not set. Using a temporary secret; users must log in again after each server restart. Set SESSION_SECRET in your environment.');
}

const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const sign = (data: string) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

export interface SessionActor {
  id: string;
  role: string;
}

export function issueSessionToken(user: { id: string; role: string }): string {
  const payload = b64(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null): SessionActor | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || !data.id || !data.role || !data.exp || Date.now() > Number(data.exp)) return null;
    return { id: String(data.id), role: String(data.role) };
  } catch {
    return null;
  }
}

export function getRequestActor(req: Request): SessionActor | null {
  const h = String(req.headers['authorization'] || '');
  const token = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
  return verifySessionToken(token);
}
