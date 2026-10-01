import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { generateSecret, generateURI } from 'otplib';
import qrcode from 'qrcode';

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = db.prepare('SELECT email, two_factor_enabled FROM users WHERE id = ?').get(session.userId) as any;
    if (user.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
    }

    const secret = generateSecret();
    db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?').run(secret, session.userId);

    const otpauth = generateURI({ label: user.email, issuer: 'KaggleLite', secret });
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    return NextResponse.json({ secret, qrDataUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
