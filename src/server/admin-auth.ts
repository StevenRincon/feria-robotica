import { createHash, timingSafeEqual } from 'node:crypto';

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env['ADMIN_PASSWORD']);
}

export function isValidAdminPassword(value: unknown): boolean {
  const expected = process.env['ADMIN_PASSWORD'];
  if (!expected || typeof value !== 'string') return false;

  const expectedHash = createHash('sha256').update(expected).digest();
  const providedHash = createHash('sha256').update(value).digest();
  return timingSafeEqual(expectedHash, providedHash);
}
