import { apiFetch } from '@/lib/apiFetch';
import { SenderType, MessageType } from '@/constants/support';

export interface SupportUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
  sender?: SupportUser | SupportUser[] | null;
}

export interface SupportConversation {
  id: string;
  status: string;
}

export interface SupportData {
  conversation: SupportConversation;
  messages: SupportMessage[];
}

export async function getSupportConversation(): Promise<SupportData> {
  const res = await apiFetch('/api/support/me');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Không thể tải hội thoại hỗ trợ');
  return json.data as SupportData;
}

export async function sendSupportMessage(conversationId: string, content: string): Promise<SupportMessage> {
  const res = await apiFetch(`/api/support/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gửi tin nhắn thất bại');
  return json.data as SupportMessage;
}

export async function getSupportBadgeCount(): Promise<{
  count: number;
  role: string;
  conversationId: string | null;
}> {
  const res = await apiFetch('/api/support/badge-count');
  const json = await res.json();
  if (!json.success) return { count: 0, role: 'customer', conversationId: null };
  return {
    count: json.data.count ?? 0,
    role: json.data.role ?? 'customer',
    conversationId: json.data.conversationId ?? null,
  };
}

export async function markSupportRead(conversationId: string): Promise<void> {
  await apiFetch(`/api/support/conversations/${conversationId}/read`, { method: 'PATCH' });
}

export async function uploadSupportImage(
  conversationId: string,
  file: File
): Promise<SupportMessage> {
  const form = new FormData();
  form.append('image', file);
  const res = await apiFetch(`/api/support/conversations/${conversationId}/image`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Upload ảnh thất bại');
  return json.data as SupportMessage;
}
