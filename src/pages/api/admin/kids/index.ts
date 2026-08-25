import type { APIRoute } from 'astro';
import { db } from '../../../../../db';
import { kids } from '../../../../../db/schema';
import { requireParentUser } from '../../../../lib/auth';
import { parseMoneyInput } from '../../../../lib/money';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await requireParentUser(cookies);
  if (!user) {
    return redirect('/auth/google');
  }

  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const weekly = parseMoneyInput(String(form.get('weeklyAllowance') || ''));

  if (!name || name.length > 80) {
    return redirect('/admin?error=' + encodeURIComponent('Enter a kid name (max 80 characters).'));
  }
  if (weekly === null || weekly < 0) {
    return redirect('/admin?error=' + encodeURIComponent('Enter a valid weekly allowance.'));
  }

  await db.insert(kids).values({
    userId: user.id,
    name,
    weeklyAllowanceCents: weekly,
  });

  return redirect('/admin?ok=' + encodeURIComponent(`Added ${name}.`));
};
