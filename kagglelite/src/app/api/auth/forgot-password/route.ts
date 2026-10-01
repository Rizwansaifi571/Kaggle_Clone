import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { logAudit } from '@/lib/auth/audit';
import { sendMail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    if (!checkRateLimit(`forgot:${email}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const artificialDelay = new Promise(resolve => setTimeout(resolve, 500));
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
      
      db.prepare('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
        .run(crypto.randomUUID(), user.id, tokenHash, expires);
      
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await sendMail(email, 'Reset your KaggleLite password', `<p>Click here to reset: <a href="${resetUrl}">${resetUrl}</a></p>`);
      logAudit(user.id, 'password_reset_requested', request.headers.get('x-forwarded-for') || '');
    }

    await artificialDelay;
    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
