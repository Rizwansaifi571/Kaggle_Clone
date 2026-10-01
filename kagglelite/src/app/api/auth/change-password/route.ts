import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/auth/audit';
import { passwordSchema } from '@/lib/validators/auth';

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) return NextResponse.json({ error: 'Weak new password', details: result.error.errors }, { status: 400 });

    const hashedPassword = await hashPassword(newPassword);
    
    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedPassword, session.userId);
      db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(session.userId);
    })();

    logAudit(session.userId, 'password_changed', request.headers.get('x-forwarded-for') || '');

    return NextResponse.json({ success: true, message: 'Password changed. All sessions revoked.' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
