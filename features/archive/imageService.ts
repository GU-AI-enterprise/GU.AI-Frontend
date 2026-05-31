import { apiFetch } from '@/lib/apiFetch';

export interface DBAsset {
  id: string;
  url: string;
  thumbnail_url: string;
  type: string;
  category?: string;
  file_size: number;
  created_at: string;
}

export interface SyncImagePayload {
  fileUrl: string;
  fileSize: number;
  type: string;
  category: string;
  thumbnailUrl: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export async function getImages(): Promise<DBAsset[]> {
  return parseResponse<DBAsset[]>(await apiFetch('/api/images'));
}

export async function syncImage(payload: SyncImagePayload): Promise<DBAsset> {
  return parseResponse<DBAsset>(await apiFetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
}

export async function deleteImage(id: string): Promise<void> {
  await parseResponse<void>(await apiFetch(`/api/images/${id}`, { method: 'DELETE' }));
}
