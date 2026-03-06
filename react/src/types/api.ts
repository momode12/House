export const API_BASE_URL = 'http://localhost:5000';

// Fonction générique pour faire une requête HTTP avec options custom
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = options.headers instanceof Headers
    ? options.headers
    : new Headers(options.headers as Record<string, string>);

  // Ajouter le token Bearer si disponible (sauf si déjà précisé)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}/${endpoint}`;
  console.log('Request URL:', url);

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur API ${response.status}`);
  }

  return response.json();
}

// POST JSON
export async function post<T>(endpoint: string, body: object): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// GET JSON
export async function getJson<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, {
    method: 'GET'
  });
}

// Upload de fichiers avec FormData
export async function uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: formData
    // Content-Type est automatiquement défini par le navigateur pour FormData
  });
}