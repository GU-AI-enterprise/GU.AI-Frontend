import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean; _tokenSet?: boolean };

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  // Never throw on HTTP error status — callers inspect json.success themselves
  validateStatus: () => true,
});

// Attach Bearer token — skip if token was already set by the retry handler
apiClient.interceptors.request.use(async (config: RetryConfig) => {
  if (config._tokenSet) return config;
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// On 401: refresh token once and retry
apiClient.interceptors.response.use(async (res) => {
  if (res.status !== 401) return res;
  const config = res.config as RetryConfig;
  if (config._retry) return res;

  config._retry = true;
  const { data } = await supabase.auth.refreshSession();
  if (!data.session) {
    await supabase.auth.signOut();
    return res;
  }

  // Set token directly and flag it so request interceptor won't overwrite
  config.headers.Authorization = `Bearer ${data.session.access_token}`;
  config._tokenSet = true;
  return apiClient(config);
});

/**
 * Drop-in replacement for the old apiFetch — callers that do await res.json() still work.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ json: () => Promise<any>; ok: boolean; status: number }> {
  const method = (options.method as AxiosRequestConfig['method']) || 'GET';
  const headers = (options.headers as Record<string, string>) || {};
  let data: any;

  if (options.body) {
    try { data = JSON.parse(options.body as string); } catch { data = options.body; }
  }

  const res: AxiosResponse = await apiClient.request({ url: path, method, headers, data });

  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    json: async () => res.data,
  };
}
