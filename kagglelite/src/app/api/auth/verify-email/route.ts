import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = db.prepare('SELECT * FROM email_verification_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP').get(tokenHash) as any;
    
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    db.prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(record.id);
    db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(record.user_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
