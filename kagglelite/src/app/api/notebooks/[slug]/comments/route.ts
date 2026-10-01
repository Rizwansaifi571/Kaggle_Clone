import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const notebook = db.prepare('SELECT id FROM notebooks WHERE slug = ?').get(params.slug) as any;
    if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const comments = db.prepare(`
      SELECT c.*, u.username as author_name, u.avatar_url as author_avatar 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.notebook_id = ? 
      ORDER BY c.created_at DESC
    `).all(notebook.id);

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.body?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 });

    const notebook = db.prepare('SELECT id FROM notebooks WHERE slug = ?').get(params.slug) as any;
    if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    db.prepare('INSERT INTO comments (notebook_id, user_id, body) VALUES (?, ?, ?)')
      .run(notebook.id, session.userId, body.body);
    
    db.prepare('UPDATE notebooks SET comments_count = comments_count + 1 WHERE id = ?').run(notebook.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
