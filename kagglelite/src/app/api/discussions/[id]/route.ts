import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const discussion = db.prepare('SELECT d.*, u.username as author_name, u.avatar_url as author_avatar FROM discussions d JOIN users u ON d.author_id = u.id WHERE d.id = ?').get(params.id) as any;
    if (!discussion) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const replies = db.prepare('SELECT r.*, u.username as author_name, u.avatar_url as author_avatar FROM replies r JOIN users u ON r.author_id = u.id WHERE r.discussion_id = ? ORDER BY r.created_at ASC').all(discussion.id);
    return NextResponse.json({ discussion, replies });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
