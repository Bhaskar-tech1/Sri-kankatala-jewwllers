import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'skj_admin_session';

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'skj_default_secret_key_2026';
}

/**
 * Generate a signed session token
 */
export function createSessionToken(username) {
  const payload = JSON.stringify({
    username,
    createdAt: Date.now(),
  });
  const hmac = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:::${hmac}`).toString('base64');
  return token;
}

/**
 * Verify a session token
 */
export function verifySessionToken(token) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadStr, signature] = decoded.split(':::');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', getSecret()).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(payloadStr);
    // Session valid for 7 days
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > maxAgeMs) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validate username and password against .env.local
 */
export function validateAdminCredentials(username, password) {
  const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim();
  const expectedPass = (process.env.ADMIN_PASSWORD || 'skjadmin123').trim();

  return username?.trim() === expectedUser && password?.trim() === expectedPass;
}

/**
 * Check if the current request is from an authenticated admin
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return null;
  return verifySessionToken(sessionCookie.value);
}

export { COOKIE_NAME };
