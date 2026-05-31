import { apiFetch } from '@/lib/apiFetch';
import { AIJobStatus } from '@/constants/ai';

export interface AIJob {
  id: string;
  type: string;
  status: AIJobStatus;
  credit_cost: number;
  created_at: string;
  result_url?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  provider: string;
  status: string;
  created_at: string;
  package?: { name: string; credits: number };
}

export interface HistoryData {
  aiJobs: AIJob[];
  transactions: Transaction[];
}

export async function getHistory(): Promise<HistoryData> {
  const res = await apiFetch('/api/history');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return {
    aiJobs: json.data.aiJobs || [],
    transactions: json.data.transactions || [],
  };
}
