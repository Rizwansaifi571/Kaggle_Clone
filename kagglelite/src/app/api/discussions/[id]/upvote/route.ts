import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const discussion = db.prepare('SELECT id FROM discussions WHERE id = ?').get(params.id) as any;
    if (!discussion) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const existingVote = db.prepare('SELECT * FROM upvotes WHERE user_id = ? AND target_type = ? AND target_id = ?')
      .get(session.userId, 'discussion', discussion.id);

    if (existingVote) {
      db.prepare('DELETE FROM upvotes WHERE user_id = ? AND target_type = ? AND target_id = ?')
        .run(session.userId, 'discussion', discussion.id);
      db.prepare('UPDATE discussions SET votes = votes - 1 WHERE id = ?').run(discussion.id);
      return NextResponse.json({ success: true, upvoted: false });
    } else {
      db.prepare('INSERT INTO upvotes (user_id, target_type, target_id) VALUES (?, ?, ?)')
        .run(session.userId, 'discussion', discussion.id);
      db.prepare('UPDATE discussions SET votes = votes + 1 WHERE id = ?').run(discussion.id);
      return NextResponse.json({ success: true, upvoted: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
