import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notebook = db.prepare('SELECT * FROM notebooks WHERE slug = ?').get(params.slug) as any;
    if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newSlug = notebook.slug + '-copy-' + Math.floor(Math.random() * 10000);
    const newTitle = notebook.title + ' (Copy)';
    
    db.prepare(`
      INSERT INTO notebooks (slug, title, author_id, content_json, language, upvotes, comments_count)
      VALUES (?, ?, ?, ?, ?, 0, 0)
    `).run(newSlug, newTitle, session.userId, notebook.content_json, notebook.language);

    return NextResponse.json({ success: true, slug: newSlug });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
