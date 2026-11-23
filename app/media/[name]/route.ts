import { readUpload } from '@/lib/admin/uploads';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await readUpload(name);

  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(file.body, {
    headers: {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(file.size),
    },
  });
}
