import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import db from './db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-kagglelite');

export async function createSession(userId: number, username: string, tier: string) {
  const token = await new SignJWT({ userId, username, tier })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function deleteSession() {
  (await cookies()).delete('session');
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET);
    return payload as { userId: number; username: string; tier: string };
  } catch (error) {
    return null;
  }
}

export async function getUserInfo() {
  const session = await getUserSession();
  if (!session) return null;
  const user = db.prepare('SELECT id, username, email, bio, tier, avatar_url FROM users WHERE id = ?').get(session.userId) as any;
  return user || null;
}
