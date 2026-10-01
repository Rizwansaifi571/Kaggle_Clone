import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const course = db.prepare('SELECT id, lessons_count FROM courses WHERE id = ?').get(params.id) as any;
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const cp = db.prepare('SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?').get(session.userId, course.id) as any;
    
    if (!cp) {
      db.prepare('INSERT INTO course_progress (user_id, course_id, completed_lessons) VALUES (?, ?, 1)').run(session.userId, course.id);
    } else if (cp.completed_lessons < course.lessons_count) {
      db.prepare('UPDATE course_progress SET completed_lessons = completed_lessons + 1 WHERE id = ?').run(cp.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
