import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notebook = db.prepare('SELECT id FROM notebooks WHERE slug = ?').get(params.slug) as any;
    if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { body } = await request.json();
    if (!body) return NextResponse.json({ error: 'Comment body required' }, { status: 400 });

    db.prepare('INSERT INTO comments (notebook_id, user_id, body) VALUES (?, ?, ?)').run(notebook.id, session.userId, body);
    db.prepare('UPDATE notebooks SET comments_count = comments_count + 1 WHERE id = ?').run(notebook.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
