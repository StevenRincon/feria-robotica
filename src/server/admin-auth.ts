import { createHash, timingSafeEqual } from 'node:crypto';

const adminPassword = 'T1cN0b54';

export function isValidAdminPassword(value: unknown): boolean {
  if (typeof value !== 'string') return false;

  const expectedHash = createHash('sha256').update(adminPassword).digest();
  const providedHash = createHash('sha256').update(value).digest();
  return timingSafeEqual(expectedHash, providedHash);
}
