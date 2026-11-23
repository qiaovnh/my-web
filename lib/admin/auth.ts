import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'inaue_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const secret = () => process.env.ADMIN_SECRET ?? 'inaue-dev-secret-change-me';
const adminPassword = () => process.env.ADMIN_PASSWORD ?? 'inaue-admin';

export function checkPassword(input: string): boolean {
  const expected = Buffer.from(adminPassword());
  const actual = Buffer.from(input ?? '');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const signature = createHmac('sha256', secret()).update(String(expires)).digest('hex');
  return `${expires}.${signature}`;
}

export function verifySessionToken(value: string | undefined): boolean {
  if (!value) return false;
  const [expiresRaw, signature] = value.split('.');
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now() || !signature) return false;
  const expected = createHmac('sha256', secret()).update(String(expires)).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
