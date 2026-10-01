import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
