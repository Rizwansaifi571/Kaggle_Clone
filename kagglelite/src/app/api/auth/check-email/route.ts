import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const e = searchParams.get('e');
  if (!e) return NextResponse.json({ available: false });

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(e);
  return NextResponse.json({ available: !user });
}
