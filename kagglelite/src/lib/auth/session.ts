import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyAccessJWT } from './tokens';

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  const payload = await verifyAccessJWT(token);
  if (!payload || !payload.sub) return null;

  const user = db.prepare('SELECT id, email, username, avatar_url, email_verified, two_factor_enabled FROM users WHERE id = ?').get(payload.sub) as any;
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatar_url,
    emailVerified: Boolean(user.email_verified),
    twoFactorEnabled: Boolean(user.two_factor_enabled)
  };
}

export async function requireAuth() {
  const session = await getUserSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
