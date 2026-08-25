const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateFamilySlug(length = 5): string {
  let slug = '';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    slug += SLUG_CHARS[bytes[i]! % SLUG_CHARS.length]!;
  }
  return slug;
}
