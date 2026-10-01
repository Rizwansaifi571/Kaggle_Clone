import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dataset = db.prepare('SELECT id FROM datasets WHERE slug = ?').get(params.slug) as any;
    if (!dataset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const existing = db.prepare('SELECT id FROM upvotes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(session.userId, 'dataset', dataset.id);

    if (existing) {
      db.prepare('DELETE FROM upvotes WHERE id = ?').run((existing as any).id);
      db.prepare('UPDATE datasets SET upvotes = upvotes - 1 WHERE id = ?').run(dataset.id);
      return NextResponse.json({ success: true, upvoted: false });
    } else {
      db.prepare('INSERT INTO upvotes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(session.userId, 'dataset', dataset.id);
      db.prepare('UPDATE datasets SET upvotes = upvotes + 1 WHERE id = ?').run(dataset.id);
      return NextResponse.json({ success: true, upvoted: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
