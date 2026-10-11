import { NextResponse } from 'next/server';
import { validateAdminCredentials, createSessionToken, COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
