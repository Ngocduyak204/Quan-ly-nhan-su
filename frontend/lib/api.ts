const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  // Nếu gặp lỗi 401 Unauthorized và có Refresh Token -> Tự động gọi Refresh Token
  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refresh_token');
    if (endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      try {
        const refreshHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (refreshToken) {
          refreshHeaders['Authorization'] = `Bearer ${refreshToken}`;
        }

        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: refreshHeaders,
          body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        });

        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          localStorage.setItem('access_token', newTokens.accessToken);
          if (newTokens.refreshToken) {
            localStorage.setItem('refresh_token', newTokens.refreshToken);
          }

          // Thử lại request ban đầu với Access Token mới
          headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers,
          });
        } else {
          // Refresh Token hết hạn -> Xóa token và về trang login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        window.location.href = '/login';
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Đã có lỗi xảy ra';
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}
