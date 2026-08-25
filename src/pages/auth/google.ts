import type { APIRoute } from 'astro';
import { googleRedirectUri, setOAuthState, siteUrl } from '../../lib/auth';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response('GOOGLE_CLIENT_ID is not configured', { status: 500 });
  }

  const state = crypto.randomUUID();
  setOAuthState(cookies, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  // Ensure SITE_URL is configured early (throws if missing)
  siteUrl();

  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};
