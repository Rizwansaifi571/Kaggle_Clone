import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/auth/audit';
import crypto from 'crypto';
import { passwordSchema } from '@/lib/validators/auth';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) return NextResponse.json({ error: 'Weak password', details: result.error.errors }, { status: 400 });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = db.prepare('SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP').get(tokenHash) as any;
    
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    
    db.transaction(() => {
      db.prepare('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(record.id);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedPassword, record.user_id);
      db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(record.user_id); // Revoke all sessions on reset
    })();

    logAudit(record.user_id, 'password_changed', request.headers.get('x-forwarded-for') || '');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
