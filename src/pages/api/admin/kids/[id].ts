import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../db';
import { kids } from '../../../../../db/schema';
import { requireParentUser } from '../../../../lib/auth';
import { getOwnedKid } from '../../../../lib/data';
import { parseMoneyInput } from '../../../../lib/money';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const user = await requireParentUser(cookies);
  if (!user) {
    return redirect('/auth/google');
  }

  const kidId = params.id;
  if (!kidId) {
    return redirect('/admin?error=' + encodeURIComponent('Missing kid id.'));
  }

  const owned = await getOwnedKid(user.id, kidId);
  if (!owned) {
    return new Response('Forbidden', { status: 403 });
  }

  const form = await request.formData();
  const method = String(form.get('_method') || 'PATCH').toUpperCase();

  if (method === 'DELETE') {
    await db.delete(kids).where(and(eq(kids.id, kidId), eq(kids.userId, user.id)));
    return redirect('/admin?ok=' + encodeURIComponent('Kid deleted.'));
  }

  const name = String(form.get('name') || '').trim();
  const weekly = parseMoneyInput(String(form.get('weeklyAllowance') || ''));

  if (!name || name.length > 80) {
    return redirect('/admin?error=' + encodeURIComponent('Enter a kid name (max 80 characters).'));
  }
  if (weekly === null || weekly < 0) {
    return redirect('/admin?error=' + encodeURIComponent('Enter a valid weekly allowance.'));
  }

  await db
    .update(kids)
    .set({
      name,
      weeklyAllowanceCents: weekly,
      updatedAt: new Date(),
    })
    .where(and(eq(kids.id, kidId), eq(kids.userId, user.id)));

  return redirect('/admin?ok=' + encodeURIComponent('Kid updated.'));
};
