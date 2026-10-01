import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  
  if (!q) return NextResponse.json({ results: { competitions: [], datasets: [], notebooks: [] } });

  try {
    const term = `%${q}%`;
    const competitions = db.prepare('SELECT slug, title, "competition" as type FROM competitions WHERE title LIKE ? OR description LIKE ? LIMIT 3').all(term, term);
    const datasets = db.prepare('SELECT slug, title, "dataset" as type FROM datasets WHERE title LIKE ? OR description LIKE ? LIMIT 3').all(term, term);
    const notebooks = db.prepare('SELECT slug, title, "notebook" as type FROM notebooks WHERE title LIKE ? LIMIT 3').all(term);

    return NextResponse.json({ results: { competitions, datasets, notebooks } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
