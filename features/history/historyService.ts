import { apiFetch } from '@/lib/apiFetch';
import { AIJobStatus } from '@/constants/ai';

export interface AIJob {
  id: string;
  type: string;
  status: AIJobStatus;
  credit_cost: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  provider?: string;
  input_params?: Record<string, unknown>;
  result_url?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  provider: string;
  status: string;
  created_at: string;
  package?: { name: string; credit_amount: number };
}

export interface HistoryData {
  aiJobs: AIJob[];
  aiJobsTotal: number;
  aiJobsPage: number;
  aiJobsLimit: number;
  aiJobsTotalPages: number;
  transactions: Transaction[];
}

export async function getHistory(params?: {
  jobPage?: number;
  jobLimit?: number;
  jobDateFrom?: string;
  jobDateTo?: string;
}): Promise<HistoryData> {
  const qs = new URLSearchParams();
  if (params?.jobPage) qs.set('job_page', String(params.jobPage));
  if (params?.jobLimit) qs.set('job_limit', String(params.jobLimit));
  if (params?.jobDateFrom) qs.set('job_date_from', params.jobDateFrom);
  if (params?.jobDateTo) qs.set('job_date_to', params.jobDateTo);

  const url = `/api/history${qs.toString() ? `?${qs}` : ''}`;
  const res = await apiFetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return {
    aiJobs: json.data.aiJobs ?? [],
    aiJobsTotal: json.data.aiJobsTotal ?? 0,
    aiJobsPage: json.data.aiJobsPage ?? 1,
    aiJobsLimit: json.data.aiJobsLimit ?? 10,
    aiJobsTotalPages: json.data.aiJobsTotalPages ?? 1,
    transactions: json.data.transactions ?? [],
  };
}
