import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const model = db.prepare('SELECT * FROM models WHERE slug = ?').get(params.slug) as any;
    if (!model) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ model });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
