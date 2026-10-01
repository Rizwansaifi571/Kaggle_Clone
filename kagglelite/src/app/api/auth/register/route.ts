import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { logAudit } from '@/lib/auth/audit';
import { registerSchema } from '@/lib/validators/auth';
import { sendMail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(`register:${ip}`, 3, 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMIT' }, { status: 429 });
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const { email, username, password } = result.data;
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists', code: 'USER_EXISTS' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const info = db.prepare('INSERT INTO users (email, username, password_hash, email_verified) VALUES (?, ?, ?, 0)')
      .run(email, username, passwordHash);
    
    const userId = info.lastInsertRowid as number;
    logAudit(userId, 'register', ip, request.headers.get('user-agent') || '');

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    db.prepare('INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
      .run(crypto.randomUUID(), userId, tokenHash, expires);

    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    await sendMail(email, 'Verify your KaggleLite email', `<p>Click here to verify: <a href="${verifyUrl}">${verifyUrl}</a></p>`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
