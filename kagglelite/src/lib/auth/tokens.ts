import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-development-only');

export async function signAccessJWT(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyAccessJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

export function generateOpaqueToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashOpaqueToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
