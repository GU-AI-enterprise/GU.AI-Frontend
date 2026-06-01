import { apiFetch } from '@/lib/apiFetch';
import { NotificationStatus } from '@/constants/notification';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  status: NotificationStatus;
  priority: string;
  action_url?: string | null;
  data: Record<string, any>;
  created_at: string;
  read_at?: string | null;
}

export async function getNotifications(limit = 20, offset = 0): Promise<{ notifications: AppNotification[]; total: number }> {
  const res = await apiFetch(`/api/notifications?limit=${limit}&offset=${offset}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiFetch('/api/notifications/unread-count');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data.count;
}

export async function markRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllRead(): Promise<void> {
  await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
}
