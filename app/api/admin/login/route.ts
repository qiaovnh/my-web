import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, checkPassword, createSessionToken } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || !checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 250));
    return NextResponse.json({ ok: false, error: 'INVALID_PASSWORD' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}
