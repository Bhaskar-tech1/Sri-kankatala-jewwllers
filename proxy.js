import { NextResponse } from 'next/server';

const COOKIE_NAME = 'skj_admin_session';

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'skj_default_secret_key_2026';
}

/**
 * Verify HMAC-SHA256 signature using Web Crypto API (compatible with all runtimes)
 */
async function isValidSession(token) {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const delimiterIndex = decoded.lastIndexOf(':::');
    if (delimiterIndex === -1) return false;

    const payloadStr = decoded.slice(0, delimiterIndex);
    const signature = decoded.slice(delimiterIndex + 3);
    if (!payloadStr || !signature) return false;

    const secret = getSecret();
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(payloadStr)
    );

    if (!isValid) return false;

    const payload = JSON.parse(payloadStr);
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (Date.now() - payload.createdAt > maxAgeMs) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Only handle /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const authenticated = await isValidSession(sessionCookie?.value);

  // If visiting /admin/login while already authenticated, redirect to /admin
  if (pathname === '/admin/login') {
    if (authenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // All other /admin routes (/admin, /admin/add, /admin/edit/...) require authentication
  if (!authenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    // Attach original path for seamless return after login if needed
    loginUrl.searchParams.set('from', pathname);

    const response = NextResponse.redirect(loginUrl);
    // If an invalid or expired cookie was present, clean it up
    if (sessionCookie) {
      response.cookies.delete(COOKIE_NAME);
    }
    return response;
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
