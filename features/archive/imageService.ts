import { apiFetch } from '@/lib/apiFetch';

export type AssetStatus = 'active' | 'archived';

export interface DBAsset {
  id: string;
  url: string;
  thumbnail_url: string;
  type: string;
  category?: string;
  file_size: number;
  created_at: string;
  status: AssetStatus;
  archived_at?: string | null;
}

export interface SyncImagePayload {
  fileUrl: string;
  fileSize: number;
  type: string;
  category: string;
  thumbnailUrl: string;
}

async function parseResponse<T>(res: { json: () => Promise<any>; ok: boolean; status: number }): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

// ── Gallery (active) ──────────────────────────────────────────────────────────

export async function getImages(category?: string): Promise<DBAsset[]> {
  const url = category ? `/api/images?category=${encodeURIComponent(category)}` : '/api/images';
  return parseResponse<DBAsset[]>(await apiFetch(url));
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
}

/** Bản phân trang của getImages — dùng cho lazy-load (infinite scroll trong modal picker). */
export async function getImagesPaginated(
  limit: number, offset: number, opts: { category?: string; type?: string } = {}
): Promise<PaginatedResult<DBAsset>> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (opts.category) params.set('category', opts.category);
  if (opts.type) params.set('type', opts.type);
  return parseResponse<PaginatedResult<DBAsset>>(await apiFetch(`/api/images?${params.toString()}`));
}

/** Upload file lên Supabase qua backend (bypass RLS). Trả về public URL. */
export async function uploadFile(file: File, bucket: 'assets' | 'videos' | 'models' = 'assets'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetch(`/api/images/upload?bucket=${bucket}`, { method: 'POST', body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Upload failed');
  return json.data.url as string;
}

export async function syncImage(payload: SyncImagePayload): Promise<DBAsset> {
  return parseResponse<DBAsset>(await apiFetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
}

// ── Archive ───────────────────────────────────────────────────────────────────

export async function getArchivedImages(): Promise<DBAsset[]> {
  return parseResponse<DBAsset[]>(await apiFetch('/api/images/archived'));
}

/** Soft delete — chuyển vào Archive */
export async function archiveImage(id: string): Promise<DBAsset> {
  return parseResponse<DBAsset>(await apiFetch(`/api/images/${id}/archive`, { method: 'PATCH' }));
}

/** Khôi phục từ Archive về gallery */
export async function restoreFromArchive(id: string): Promise<DBAsset> {
  return parseResponse<DBAsset>(await apiFetch(`/api/images/${id}/restore`, { method: 'PATCH' }));
}

/** Xóa vĩnh viễn một ảnh trong Archive */
export async function permanentlyDeleteImage(id: string): Promise<void> {
  await parseResponse<void>(await apiFetch(`/api/images/${id}/permanent`, { method: 'DELETE' }));
}

/** Dọn sạch toàn bộ Archive */
export async function emptyArchive(): Promise<{ deletedCount: number }> {
  return parseResponse<{ deletedCount: number }>(await apiFetch('/api/images/archive', { method: 'DELETE' }));
}

/** Chuyển nhiều ảnh vào Archive */
export async function bulkArchive(ids: string[]): Promise<{ archivedCount: number }> {
  return parseResponse<{ archivedCount: number }>(await apiFetch('/api/images/bulk-archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  }));
}

/** Backward-compat — deleteImage = archiveImage */
export async function deleteImage(id: string): Promise<void> {
  await archiveImage(id);
}

/** Số ngày còn lại trước khi bị xóa vĩnh viễn (tối đa 2 ngày) */
export function daysUntilExpiry(archivedAt: string): number {
  const expiry = new Date(archivedAt).getTime() + 2 * 24 * 60 * 60 * 1000;
  const remaining = expiry - Date.now();
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}
