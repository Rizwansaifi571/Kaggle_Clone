import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { verifySync } from 'otplib';
import { logAudit } from '@/lib/auth/audit';

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { token } = await request.json();
    const user = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(session.userId) as any;
    
    if (!user || !user.two_factor_secret) {
      return NextResponse.json({ error: '2FA not setup' }, { status: 400 });
    }

    const isValid = verifySync({ token, secret: user.two_factor_secret });
    if (!isValid) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

    db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(session.userId);
    logAudit(session.userId, '2fa_enabled', request.headers.get('x-forwarded-for') || '');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
