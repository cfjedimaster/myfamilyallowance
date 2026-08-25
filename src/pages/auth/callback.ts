import type { APIRoute } from 'astro';
import {
  consumeOAuthState,
  googleRedirectUri,
  setParentSession,
} from '../../lib/auth';
import { findOrCreateUserFromGoogle } from '../../lib/data';

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  name?: string;
};

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = consumeOAuthState(cookies);

  if (!code || !state || !expected || state !== expected) {
    return redirect('/?error=oauth_state');
  }

  const clientId = import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    import.meta.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('Google OAuth is not configured', { status: 500 });
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token) {
    return redirect('/?error=oauth_token');
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });

  if (!profileRes.ok) {
    return redirect('/?error=oauth_profile');
  }

  const profile = (await profileRes.json()) as GoogleUserInfo;
  if (!profile.sub) {
    return redirect('/?error=oauth_profile');
  }

  const user = await findOrCreateUserFromGoogle({
    googleSub: profile.sub,
    email: profile.email || '',
    name: profile.name || profile.email || 'Parent',
  });

  await setParentSession(cookies, { userId: user.id });
  return redirect('/admin');
};
