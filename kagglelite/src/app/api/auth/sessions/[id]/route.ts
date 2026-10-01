import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { logAudit } from '@/lib/auth/audit';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetSession = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(params.id, session.userId);
    if (!targetSession) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?').run(params.id);
    logAudit(session.userId, 'session_revoked', request.headers.get('x-forwarded-for') || '', `Revoked session ${params.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
