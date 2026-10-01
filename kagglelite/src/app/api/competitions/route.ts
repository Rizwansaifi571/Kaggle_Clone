import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  let query = 'SELECT * FROM competitions WHERE 1=1';
  const params: any[] = [];

  if (q) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY deadline DESC';

  try {
    const competitions = db.prepare(query).all(...params);
    return NextResponse.json({ competitions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
  }
}
