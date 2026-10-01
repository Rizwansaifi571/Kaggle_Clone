import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/oauth/github/callback`;
  const state = Math.random().toString(36).substring(2, 15);
  // Ideally, state should be stored in an HTTPOnly cookie here for validation in the callback

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=read:user user:email`;
  
  const response = NextResponse.redirect(url);
  response.cookies.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600 });
  return response;
}
