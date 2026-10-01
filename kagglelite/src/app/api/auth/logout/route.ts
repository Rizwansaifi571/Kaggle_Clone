import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyAccessJWT, hashOpaqueToken } from '@/lib/auth/tokens';
import { logAudit } from '@/lib/auth/audit';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    let userId = null;
    if (accessToken) {
      const payload = await verifyAccessJWT(accessToken);
      if (payload) userId = payload.sub as number;
    }

    if (refreshToken) {
      const hash = hashOpaqueToken(refreshToken);
      db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE refresh_token_hash = ?').run(hash);
    }
    
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    if (userId) {
      logAudit(userId, 'logout', request.headers.get('x-forwarded-for') || '', request.headers.get('user-agent') || '');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
