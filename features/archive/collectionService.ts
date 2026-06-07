import { apiFetch } from '@/lib/apiFetch';
import type { DBAsset } from './imageService';

export interface Collection {
  id: string;
  name: string;
  cover_asset_id?: string | null;
  created_at: string;
  description?: string | null;
  cover_asset?: { url: string; thumbnail_url: string; status?: string } | null;
}

async function parseResponse<T>(res: { json: () => Promise<any>; ok: boolean; status: number }): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export async function getCollections(): Promise<Collection[]> {
  return parseResponse<Collection[]>(await apiFetch('/api/collections'));
}

export async function createCollection(name: string): Promise<Collection> {
  return parseResponse<Collection>(await apiFetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }));
}

export async function deleteCollection(id: string): Promise<void> {
  await parseResponse<void>(await apiFetch(`/api/collections/${id}`, { method: 'DELETE' }));
}

export async function updateCollection(id: string, name: string): Promise<Collection> {
  return parseResponse<Collection>(await apiFetch(`/api/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }));
}

export async function getCollection(id: string): Promise<Collection> {
  return parseResponse<Collection>(await apiFetch(`/api/collections/${id}`));
}

export async function getCollectionItems(id: string): Promise<DBAsset[]> {
  return parseResponse<DBAsset[]>(await apiFetch(`/api/collections/${id}/items`));
}

export async function addItemToCollection(collectionId: string, assetId: string): Promise<void> {
  await parseResponse<void>(await apiFetch(`/api/collections/${collectionId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId }),
  }));
}

export async function removeItemFromCollection(collectionId: string, assetId: string): Promise<void> {
  await parseResponse<void>(await apiFetch(`/api/collections/${collectionId}/items`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId }),
  }));
}
