import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { kids, transactions } from '../../db/schema';
import { hasRecentAllowance } from '../../src/lib/data';

function isAuthorized(req: Request): boolean {
  if (req.headers.get('x-netlify-event') === 'schedule') {
    return true;
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * Sunday ~7am America/Chicago (CDT = UTC-5 → 12:00 UTC).
 * Duplicate guard: skip if an from_allowance credit exists in the past 6 days.
 */
export default async (req: Request, _context: Context) => {
  if (!isAuthorized(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const allKids = await db.select().from(kids);
  let credited = 0;
  let skipped = 0;

  for (const kid of allKids) {
    if (kid.weeklyAllowanceCents <= 0) {
      skipped += 1;
      continue;
    }

    const recent = await hasRecentAllowance(kid.id, 6);
    if (recent) {
      skipped += 1;
      continue;
    }

    await db.insert(transactions).values({
      kidId: kid.id,
      amountCents: kid.weeklyAllowanceCents,
      memo: 'Allowance added!',
      fromAllowance: true,
    });
    credited += 1;
  }

  return Response.json({
    ok: true,
    credited,
    skipped,
    checked: allKids.length,
  });
};

export const config: Config = {
  schedule: '0 12 * * 0',
};
