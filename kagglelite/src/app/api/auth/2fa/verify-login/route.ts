import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifySync } from 'otplib';
import { signAccessJWT, generateOpaqueToken, hashOpaqueToken } from '@/lib/auth/tokens';
import crypto from 'crypto';

// Note: This API is hit after login if requires2FA: true was returned.
export async function POST(request: Request) {
  try {
    const { userId, token } = await request.json();
    const user = db.prepare('SELECT id, two_factor_secret FROM users WHERE id = ?').get(userId) as any;
    
    if (!user || !user.two_factor_secret) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const isValid = verifySync({ token, secret: user.two_factor_secret });
    if (!isValid) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

    const refreshToken = generateOpaqueToken();
    const hashedRefresh = hashOpaqueToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const sessionId = crypto.randomUUID();
    db.prepare('INSERT INTO sessions (id, user_id, refresh_token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(sessionId, user.id, hashedRefresh, request.headers.get('user-agent') || '', request.headers.get('x-forwarded-for') || '', expiresAt);

    const accessToken = await signAccessJWT({ sub: user.id, sid: sessionId });
    const cookieStore = await cookies();
    
    cookieStore.set('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    cookieStore.set('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
