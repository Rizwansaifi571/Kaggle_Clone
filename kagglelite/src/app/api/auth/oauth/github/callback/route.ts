import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { generateOpaqueToken, hashOpaqueToken, signAccessJWT } from '@/lib/auth/tokens';
import { logAudit } from '@/lib/auth/audit';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!code || !state || state !== storedState) {
      return NextResponse.redirect('/login?error=OAuthFailed');
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return NextResponse.redirect('/login?error=OAuthNotConfigured');
    }

    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return NextResponse.redirect('/login?error=OAuthTokenFailed');

    // Get GitHub user
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const githubUser = await userRes.json();
    
    // Get GitHub emails
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const emails = await emailsRes.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
    
    if (!githubUser.id || !primaryEmail) return NextResponse.redirect('/login?error=OAuthNoEmail');

    // DB Sync
    let user = db.prepare('SELECT users.id, users.two_factor_enabled FROM users JOIN oauth_accounts ON users.id = oauth_accounts.user_id WHERE oauth_accounts.provider = ? AND oauth_accounts.provider_account_id = ?').get('github', String(githubUser.id)) as any;
    
    if (!user) {
      // Find by email?
      user = db.prepare('SELECT id, two_factor_enabled FROM users WHERE email = ?').get(primaryEmail) as any;
      if (user) {
        db.prepare('INSERT INTO oauth_accounts (user_id, provider, provider_account_id) VALUES (?, ?, ?)').run(user.id, 'github', String(githubUser.id));
      } else {
        // Create user
        const info = db.prepare('INSERT INTO users (username, email, password_hash, email_verified) VALUES (?, ?, ?, 1)')
          .run(githubUser.login, primaryEmail, 'OAUTH_NO_PASSWORD');
        user = { id: info.lastInsertRowid, two_factor_enabled: 0 };
        db.prepare('INSERT INTO oauth_accounts (user_id, provider, provider_account_id) VALUES (?, ?, ?)').run(user.id, 'github', String(githubUser.id));
      }
    }

    if (user.two_factor_enabled) {
      // Edge case: if 2fa is on, we'd need a way to pass this state to the client. Let's redirect with an OTP query flag for now.
      return NextResponse.redirect(`/login?requires2FA=true&userId=${user.id}`);
    }

    const refreshToken = generateOpaqueToken();
    const hashedRefresh = hashOpaqueToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const sessionId = crypto.randomUUID();
    db.prepare('INSERT INTO sessions (id, user_id, refresh_token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(sessionId, user.id, hashedRefresh, request.headers.get('user-agent') || '', request.headers.get('x-forwarded-for') || '', expiresAt);

    const accessToken = await signAccessJWT({ sub: user.id, sid: sessionId });
    
    cookieStore.set('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    cookieStore.set('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    
    logAudit(user.id, 'login_success_github', request.headers.get('x-forwarded-for') || '', request.headers.get('user-agent') || '');

    return NextResponse.redirect('/');
  } catch (error) {
    return NextResponse.redirect('/login?error=OAuthServerError');
  }
}
