import type { APIRoute } from 'astro';
import { clearFamilySession } from '../../../../lib/auth';

export const POST: APIRoute = async ({ params, cookies, redirect }) => {
  clearFamilySession(cookies);
  const slug = params.slug || '';
  return redirect(slug ? `/f/${slug}` : '/');
};
