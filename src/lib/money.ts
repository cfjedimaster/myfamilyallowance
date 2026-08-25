export function dollarsToCents(value: string | number): number | null {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value).trim());
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toFixed(2)}`;
}

export function parseMoneyInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\$/g, '');
  if (!cleaned) return null;
  return dollarsToCents(cleaned);
}
