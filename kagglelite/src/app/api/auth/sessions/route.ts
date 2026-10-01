import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const activeSessions = db.prepare('SELECT id, user_agent, ip, device_label, last_used_at, created_at, expires_at FROM sessions WHERE user_id = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP ORDER BY last_used_at DESC').all(session.userId);
    
    return NextResponse.json({ sessions: activeSessions });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
