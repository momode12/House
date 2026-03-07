// ─── HTTP utilities ────────────────────────────────────────────────────────
// Les types/interfaces sont dans src/types/api.ts

export const API_BASE_URL = 'http://localhost:5000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = options.headers instanceof Headers
    ? options.headers
    : new Headers(options.headers as Record<string, string>);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}/${endpoint}`;
  console.log('Request URL:', url);

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur API ${response.status}`);
  }

  return response.json();
}

export async function post<T>(endpoint: string, body: object): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function getJson<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

export async function uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: formData });
}