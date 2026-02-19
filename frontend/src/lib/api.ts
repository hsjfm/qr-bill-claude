const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json as T;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export interface NewApiKey extends ApiKey {
  key: string;
  warning: string;
}

export interface ApiLog {
  id: string;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  ip: string | null;
  created_at: string;
  key_name: string | null;
  key_prefix: string | null;
}

export interface LogStats {
  total_calls: string;
  successful_calls: string;
  failed_calls: string;
  calls_today: string;
  calls_this_month: string;
  avg_duration_ms: string | null;
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  listKeys: () => request<ApiKey[]>('/api/keys'),

  createKey: (name: string) =>
    request<NewApiKey>('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  revokeKey: (id: string) =>
    request<{ message: string }>(`/api/keys/${id}`, { method: 'DELETE' }),

  listLogs: () => request<ApiLog[]>('/api/logs'),

  logStats: () => request<LogStats>('/api/logs/stats'),
};
