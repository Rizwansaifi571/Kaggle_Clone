import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(params.id) as any;
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const session = await getUserSession();
    let progress = 0;
    if (session) {
      const cp = db.prepare('SELECT completed_lessons FROM course_progress WHERE user_id = ? AND course_id = ?').get(session.userId, course.id) as any;
      if (cp) progress = cp.completed_lessons;
    }

    return NextResponse.json({ course, progress });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
