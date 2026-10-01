import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { generateOpaqueToken, hashOpaqueToken, signAccessJWT } from '@/lib/auth/tokens';
import { logAudit } from '@/lib/auth/audit';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get('refresh_token')?.value;
    if (!oldRefreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const oldHash = hashOpaqueToken(oldRefreshToken);
    const session = db.prepare('SELECT * FROM sessions WHERE refresh_token_hash = ?').get(oldHash) as any;

    if (!session) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    if (session.revoked_at) {
      // Reuse detection: token was already revoked!
      db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(session.user_id);
      logAudit(session.user_id, 'token_reuse_detected', request.headers.get('x-forwarded-for') || '', request.headers.get('user-agent') || '');
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json({ error: 'Token reuse detected, all sessions revoked' }, { status: 403 });
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Refresh token expired' }, { status: 401 });
    }

    // Revoke old token
    db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?').run(session.id);

    // Issue new pair
    const newRefreshToken = generateOpaqueToken();
    const newHash = hashOpaqueToken(newRefreshToken);
    const newSessionId = crypto.randomUUID();
    const expiresAt = session.expires_at; // keep original expiration or extend depending on policy. We keep it to avoid infinite sessions.

    db.prepare('INSERT INTO sessions (id, user_id, refresh_token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(newSessionId, session.user_id, newHash, request.headers.get('user-agent') || '', request.headers.get('x-forwarded-for') || '', expiresAt);

    const newAccessToken = await signAccessJWT({ sub: session.user_id, sid: newSessionId });
    
    cookieStore.set('access_token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    cookieStore.set('refresh_token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
