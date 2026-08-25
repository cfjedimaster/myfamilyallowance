import type { APIRoute } from 'astro';
import { clearParentSession } from '../../lib/auth';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearParentSession(cookies);
  return redirect('/');
};
