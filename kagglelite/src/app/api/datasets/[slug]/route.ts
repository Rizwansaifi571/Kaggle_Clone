import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const dataset = db.prepare('SELECT d.*, u.username as owner_name, u.avatar_url as owner_avatar FROM datasets d JOIN users u ON d.owner_id = u.id WHERE d.slug = ?').get(params.slug) as any;
    if (!dataset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const columns = db.prepare('SELECT * FROM dataset_columns WHERE dataset_id = ?').all(dataset.id);
    return NextResponse.json({ dataset, columns });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
