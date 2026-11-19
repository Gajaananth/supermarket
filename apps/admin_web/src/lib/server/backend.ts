import type { NextResponse } from 'next/server';

export const ACCESS_COOKIE = 'buyme_access';
export const REFRESH_COOKIE = 'buyme_refresh';
export const DEVICE_COOKIE = 'buyme_device';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user?: {
    id: string;
    role: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function backendUrl(path: string): string {
  const configured = process.env.BUYME_API_BASE_URL || 'http://127.0.0.1:4000';
  const base = new URL(configured);
  if (base.protocol !== 'http:' && base.protocol !== 'https:') {
    throw new Error('BUYME_API_BASE_URL must use HTTP or HTTPS.');
  }
  return new URL(path.replace(/^\/+/, ''), `${base.toString().replace(/\/+$/, '')}/`).toString();
}

export async function apiJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json();
  if (!response.ok) {
    const message = isRecord(body) ? body.message : undefined;
    const text = typeof message === 'string'
      ? message
      : Array.isArray(message) && message.every((item) => typeof item === 'string')
        ? message.join(', ')
        : response.statusText || 'The API request failed.';
    throw new Error(text);
  }
  if (!isRecord(body) || body.success !== true || !('data' in body)) {
    throw new Error('The API returned an invalid response envelope.');
  }
  return body.data as T;
}

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthTokens,
  deviceId: string,
): void {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  response.cookies.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, DEVICE_COOKIE]) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}

export function isAuthTokens(value: unknown): value is AuthTokens {
  return isRecord(value) &&
    typeof value.accessToken === 'string' &&
    typeof value.refreshToken === 'string' &&
    typeof value.expiresIn === 'string';
}

export function sameOriginRequest(request: Request): boolean {
  return request.headers.get('origin') === new URL(request.url).origin;
}

export function apiErrorMessage(value: unknown): string {
  if (!isRecord(value)) return 'The API request failed.';
  if (typeof value.message === 'string') return value.message;
  if (Array.isArray(value.message) && value.message.every((item) => typeof item === 'string')) {
    return value.message.join(', ');
  }
  return 'The API request failed.';
}
