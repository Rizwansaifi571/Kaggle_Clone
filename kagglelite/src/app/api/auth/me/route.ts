import { NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';

export async function GET() {
  const user = await getUserInfo();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
