import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get('u');
  if (!u) return NextResponse.json({ available: false });

  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(u);
  return NextResponse.json({ available: !user });
}
