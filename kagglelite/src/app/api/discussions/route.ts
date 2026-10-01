import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const discussions = db.prepare('SELECT d.*, u.username as author_name, u.avatar_url as author_avatar, (SELECT COUNT(*) FROM replies WHERE discussion_id = d.id) as replies_count FROM discussions d JOIN users u ON d.author_id = u.id ORDER BY d.created_at DESC').all();
    return NextResponse.json({ discussions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await import('@/lib/auth').then(m => m.getUserSession());
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.title || !body.body || !body.category) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const info = db.prepare('INSERT INTO discussions (title, body, author_id, category) VALUES (?, ?, ?, ?)').run(body.title, body.body, session.userId, body.category);
    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
