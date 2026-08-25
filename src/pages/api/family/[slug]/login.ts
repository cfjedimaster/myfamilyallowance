import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../db';
import { users } from '../../../../../db/schema';
import { setFamilySession } from '../../../../lib/auth';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const slug = params.slug;
  if (!slug || !/^[a-z0-9]{5}$/.test(slug)) {
    return redirect('/');
  }

  const [user] = await db.select().from(users).where(eq(users.familySlug, slug)).limit(1);
  if (!user || !user.familyPasswordHash) {
    return redirect(`/f/${slug}?error=` + encodeURIComponent('Family page is not ready yet.'));
  }

  const form = await request.formData();
  const password = String(form.get('password') || '');
  const ok = await bcrypt.compare(password, user.familyPasswordHash);
  if (!ok) {
    return redirect(`/f/${slug}?error=` + encodeURIComponent('Incorrect password.'));
  }

  await setFamilySession(cookies, {
    slug: user.familySlug,
    passwordVersion: user.familyPasswordVersion,
  });

  return redirect(`/f/${slug}`);
};
