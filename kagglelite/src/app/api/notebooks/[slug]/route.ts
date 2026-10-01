import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const notebook = db.prepare('SELECT n.*, u.username as author_name, u.avatar_url as author_avatar FROM notebooks n JOIN users u ON n.author_id = u.id WHERE n.slug = ?').get(params.slug) as any;
    if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ notebook });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
