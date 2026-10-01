import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { logAudit } from '@/lib/auth/audit';
import { signAccessJWT, generateOpaqueToken, hashOpaqueToken } from '@/lib/auth/tokens';
import { loginSchema } from '@/lib/validators/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const { identifier, password, rememberMe } = result.data;
    if (!checkRateLimit(`login:${ip}:${identifier}`, 5, 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts, please try again later', code: 'RATE_LIMIT' }, { status: 429 });
    }

    // Generic error delay to prevent timing attacks
    const artificialDelay = new Promise(resolve => setTimeout(resolve, 500));

    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier) as any;
    if (!user) {
      await artificialDelay;
      return NextResponse.json({ error: 'Invalid credentials', code: 'INVALID_CREDS' }, { status: 401 });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account locked. Try again later.', code: 'LOCKED' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      const fails = user.failed_login_attempts + 1;
      let lockedUntil = null;
      if (fails >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?').run(fails, lockedUntil, user.id);
      logAudit(user.id, 'login_failed', ip, request.headers.get('user-agent') || '');
      await artificialDelay;
      return NextResponse.json({ error: 'Invalid credentials', code: 'INVALID_CREDS' }, { status: 401 });
    }

    db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    
    // Re-hash logic
    if (!user.password_hash.startsWith('$argon2')) {
       const newHash = await hashPassword(password);
       db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
    }

    if (user.two_factor_enabled) {
      return NextResponse.json({ requires2FA: true, userId: user.id });
    }

    // Create session
    const refreshToken = generateOpaqueToken();
    const hashedRefresh = hashOpaqueToken(refreshToken);
    const expiresDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();
    
    const sessionId = crypto.randomUUID();
    db.prepare('INSERT INTO sessions (id, user_id, refresh_token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(sessionId, user.id, hashedRefresh, request.headers.get('user-agent') || '', ip, expiresAt);

    const accessToken = await signAccessJWT({ sub: user.id, sid: sessionId });
    const cookieStore = await cookies();
    
    cookieStore.set('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    cookieStore.set('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });

    logAudit(user.id, 'login_success', ip, request.headers.get('user-agent') || '');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
