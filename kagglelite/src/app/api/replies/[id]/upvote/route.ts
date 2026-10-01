import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reply = db.prepare('SELECT id, discussion_id FROM replies WHERE id = ?').get(params.id) as any;
    if (!reply) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const existingVote = db.prepare('SELECT * FROM upvotes WHERE user_id = ? AND target_type = ? AND target_id = ?')
      .get(session.userId, 'reply', reply.id);

    if (existingVote) {
      db.prepare('DELETE FROM upvotes WHERE user_id = ? AND target_type = ? AND target_id = ?')
        .run(session.userId, 'reply', reply.id);
      return NextResponse.json({ success: true, upvoted: false });
    } else {
      db.prepare('INSERT INTO upvotes (user_id, target_type, target_id) VALUES (?, ?, ?)')
        .run(session.userId, 'reply', reply.id);
      return NextResponse.json({ success: true, upvoted: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
