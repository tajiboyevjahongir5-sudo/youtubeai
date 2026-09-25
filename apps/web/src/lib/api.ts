import { getWorkspaceId } from './workspace';

export const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const fetchApi = async (url: string, options: RequestInit = {}, getToken?: () => Promise<string | null>) => {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('jpilot_auth_token');
  }
  if (!token && getToken) {
    token = await getToken();
  }
  if (!token) {
    token = 'mock_token';
  }
  const headers = new Headers(options.headers);

  // Set Authorization header
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const workspaceId = getWorkspaceId();
  if (workspaceId) {
    headers.set('x-workspace-id', workspaceId);
  }
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Automatically send httpOnly secure cookies
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
};
