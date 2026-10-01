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
