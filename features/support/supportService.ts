import { apiFetch } from '@/lib/apiFetch';
import { SenderType } from '@/constants/support';

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
  message_type: string;
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
