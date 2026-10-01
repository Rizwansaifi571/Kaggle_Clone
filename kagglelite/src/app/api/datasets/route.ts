import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'Hottest';

  let query = 'SELECT d.*, u.username as owner_name, u.avatar_url as owner_avatar FROM datasets d JOIN users u ON d.owner_id = u.id WHERE 1=1';
  const params: any[] = [];

  if (q) {
    query += ' AND (d.title LIKE ? OR d.description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (tag) {
    query += ' AND d.tags LIKE ?';
    params.push(`%${tag}%`);
  }

  if (sort === 'Most Votes') {
    query += ' ORDER BY d.upvotes DESC';
  } else if (sort === 'Newest') {
    query += ' ORDER BY d.created_at DESC';
  } else {
    // Hottest - dummy logic based on upvotes
    query += ' ORDER BY d.upvotes DESC, d.created_at DESC';
  }

  try {
    const datasets = db.prepare(query).all(...params);
    return NextResponse.json({ datasets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 });
  }
}
