import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { transactions } from '../../../../db/schema';
import { requireParentUser } from '../../../lib/auth';
import { getOwnedKid } from '../../../lib/data';
import { parseMoneyInput } from '../../../lib/money';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await requireParentUser(cookies);
  if (!user) {
    return redirect('/auth/google');
  }

  const form = await request.formData();
  const kidId = String(form.get('kidId') || '');
  const amount = parseMoneyInput(String(form.get('amount') || ''));
  const memoRaw = String(form.get('memo') || '').trim();
  const memo = memoRaw ? memoRaw.slice(0, 200) : null;

  if (!kidId) {
    return redirect('/admin?error=' + encodeURIComponent('Missing kid.'));
  }

  const owned = await getOwnedKid(user.id, kidId);
  if (!owned) {
    return new Response('Forbidden', { status: 403 });
  }

  if (amount === null || amount === 0) {
    return redirect(
      '/admin?error=' + encodeURIComponent('Enter a non-zero amount (positive or negative).'),
    );
  }

  await db.insert(transactions).values({
    kidId,
    amountCents: amount,
    memo,
    fromAllowance: false,
  });

  return redirect('/admin?ok=' + encodeURIComponent(`Saved transaction for ${owned.name}.`));
};
