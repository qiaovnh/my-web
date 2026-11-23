import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { storageDriver } from '@/lib/storefront/db';

export const UPLOAD_DIR = path.join(process.cwd(), '.data', 'uploads');
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const SAFE_NAME = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|avif)$/;

export type UploadResult = { ok: true; url: string; name: string } | { ok: false; error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return { ok: false, error: 'UNSUPPORTED_TYPE' };
  if (file.size <= 0) return { ok: false, error: 'EMPTY_FILE' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'FILE_TOO_LARGE' };

  const name = `${randomUUID().slice(0, 8)}-${Date.now().toString(36)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (storageDriver() === 'blob') {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${name}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.type,
    });
    return { ok: true, url: blob.url, name };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);

  return { ok: true, url: `/media/${name}`, name };
}

export async function readUpload(
  name: string,
): Promise<{ body: ArrayBuffer; type: string; size: number } | null> {
  if (!SAFE_NAME.test(name)) return null;
  try {
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, name));
    const copy = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    const ext = name.split('.').pop()!.toLowerCase();
    return {
      body: copy,
      size: copy.byteLength,
      type: TYPE_BY_EXT[ext] ?? 'application/octet-stream',
    };
  } catch {
    return null;
  }
}
