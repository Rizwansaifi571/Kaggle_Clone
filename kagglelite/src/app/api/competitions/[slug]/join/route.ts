import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const comp = db.prepare('SELECT id, teams_count FROM competitions WHERE slug = ?').get(params.slug) as any;
    if (!comp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check if already joined
    const exists = db.prepare('SELECT id FROM competition_members WHERE user_id = ? AND competition_id = ?').get(session.userId, comp.id);
    if (exists) return NextResponse.json({ success: true, message: 'Already joined' });

    db.prepare('INSERT INTO competition_members (user_id, competition_id) VALUES (?, ?)').run(session.userId, comp.id);
    db.prepare('UPDATE competitions SET teams_count = teams_count + 1 WHERE id = ?').run(comp.id);
    
    // Add to leaderboard with null score
    db.prepare('INSERT INTO leaderboard (competition_id, user_id, team_name, score, entries) VALUES (?, ?, ?, ?, ?)').run(comp.id, session.userId, session.username, null, 0);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
