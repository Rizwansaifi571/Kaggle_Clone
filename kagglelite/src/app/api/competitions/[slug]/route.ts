import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const comp = db.prepare('SELECT * FROM competitions WHERE slug = ?').get(params.slug);
    if (!comp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ competition: comp });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
