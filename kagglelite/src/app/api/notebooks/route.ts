import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const notebooks = db.prepare('SELECT n.*, u.username as author_name, u.avatar_url as author_avatar FROM notebooks n JOIN users u ON n.author_id = u.id ORDER BY n.upvotes DESC').all();
    return NextResponse.json({ notebooks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notebooks' }, { status: 500 });
  }
}
