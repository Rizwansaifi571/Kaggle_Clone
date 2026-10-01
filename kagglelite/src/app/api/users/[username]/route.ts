import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  try {
    const user = db.prepare('SELECT id, username, bio, tier, avatar_url, created_at FROM users WHERE username = ?').get(params.username) as any;
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const stats = {
      competitions: db.prepare('SELECT COUNT(*) as count FROM competition_members WHERE user_id = ?').get(user.id) as any,
      datasets: db.prepare('SELECT COUNT(*) as count FROM datasets WHERE owner_id = ?').get(user.id) as any,
      notebooks: db.prepare('SELECT COUNT(*) as count FROM notebooks WHERE author_id = ?').get(user.id) as any,
      discussions: db.prepare('SELECT COUNT(*) as count FROM discussions WHERE author_id = ?').get(user.id) as any,
    };

    return NextResponse.json({ user, stats: {
      competitions: stats.competitions.count,
      datasets: stats.datasets.count,
      notebooks: stats.notebooks.count,
      discussions: stats.discussions.count,
    } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
