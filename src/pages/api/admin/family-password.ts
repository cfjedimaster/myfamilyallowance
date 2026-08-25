import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { requireParentUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await requireParentUser(cookies);
  if (!user) {
    return redirect('/auth/google');
  }

  const form = await request.formData();
  const password = String(form.get('password') || '');
  if (password.length < 4 || password.length > 72) {
    return redirect('/admin?error=' + encodeURIComponent('Password must be 4–72 characters.'));
  }

  const hash = await bcrypt.hash(password, 10);
  await db
    .update(users)
    .set({
      familyPasswordHash: hash,
      familyPasswordVersion: user.familyPasswordVersion + 1,
    })
    .where(eq(users.id, user.id));

  return redirect('/admin?ok=' + encodeURIComponent('Family password saved.'));
};
