import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const comp = db.prepare('SELECT id FROM competitions WHERE slug = ?').get(params.slug) as any;
    if (!comp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const leaderboard = db.prepare('SELECT l.*, u.username as user_name FROM leaderboard l JOIN users u ON l.user_id = u.id WHERE l.competition_id = ? AND l.score IS NOT NULL ORDER BY l.score DESC').all(comp.id);
    
    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { score } = await request.json();
    if (score === undefined) return NextResponse.json({ error: 'Score is required' }, { status: 400 });

    const comp = db.prepare('SELECT id FROM competitions WHERE slug = ?').get(params.slug) as any;
    if (!comp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const entry = db.prepare('SELECT id, score FROM leaderboard WHERE competition_id = ? AND user_id = ?').get(comp.id, session.userId) as any;
    
    if (entry) {
      const newScore = entry.score === null ? score : Math.max(entry.score, score);
      db.prepare('UPDATE leaderboard SET score = ?, entries = entries + 1, last_submission = CURRENT_TIMESTAMP WHERE id = ?').run(newScore, entry.id);
    } else {
      db.prepare('INSERT INTO leaderboard (competition_id, user_id, team_name, score, entries) VALUES (?, ?, ?, ?, ?)').run(comp.id, session.userId, session.username, score, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
