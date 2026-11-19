import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  apiErrorMessage,
  apiJson,
  AuthTokens,
  backendUrl,
  clearAuthCookies,
  DEVICE_COOKIE,
  isAuthTokens,
  REFRESH_COOKIE,
  setAuthCookies,
} from '@/lib/server/backend';

interface SessionProfile {
  user: {
    id: string;
    role: 'SUPER_ADMIN' | 'STORE_ADMIN';
    fullName: string;
    email: string | null;
    phone: string | null;
    store: { id: string; code: string; name: string } | null;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSessionProfile(value: unknown): SessionProfile | null {
  if (!isRecord(value) || !isRecord(value.user)) return null;
  const user = value.user;
  if (
    typeof user.id !== 'string' ||
    typeof user.fullName !== 'string' ||
    (user.role !== 'SUPER_ADMIN' && user.role !== 'STORE_ADMIN')
  ) {
    return null;
  }

  let store: SessionProfile['user']['store'] = null;
  if (user.role === 'STORE_ADMIN') {
    if (
      !isRecord(user.store) ||
      typeof user.store.id !== 'string' ||
      typeof user.store.code !== 'string' ||
      typeof user.store.name !== 'string'
    ) {
      return null;
    }
    store = { id: user.store.id, code: user.store.code, name: user.store.name };
  }

  return {
    user: {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: typeof user.email === 'string' ? user.email : null,
      phone: typeof user.phone === 'string' ? user.phone : null,
      store,
    },
  };
}

async function getProfile(accessToken: string): Promise<Response> {
  return fetch(backendUrl('/api/v1/auth/me'), {
    headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
    cache: 'no-store',
  });
}

async function rotate(refreshToken: string, deviceId: string): Promise<Response> {
  return fetch(backendUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ refreshToken, deviceId }),
    cache: 'no-store',
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  let rotatedTokens: Pick<AuthTokens, 'accessToken' | 'refreshToken' | 'expiresIn'> | undefined;

  if (!accessToken && (!refreshToken || !deviceId)) {
    return NextResponse.json({ message: 'Sign-in required.' }, { status: 401 });
  }

  let profileResponse: Response | undefined;
  if (accessToken) {
    profileResponse = await getProfile(accessToken);
  }

  if (!profileResponse || profileResponse.status === 401) {
    if (!refreshToken || !deviceId) {
      const result = NextResponse.json({ message: 'Session expired. Please sign in again.' }, { status: 401 });
      clearAuthCookies(result);
      return result;
    }
    const refreshResponse = await rotate(refreshToken, deviceId);
    if (!refreshResponse.ok) {
      if (refreshResponse.status === 401) {
        const result = NextResponse.json({ message: 'Session expired. Please sign in again.' }, { status: 401 });
        clearAuthCookies(result);
        return result;
      }
      const body: unknown = await refreshResponse.json();
      return NextResponse.json({ message: apiErrorMessage(body) }, { status: 502 });
    }
    const refreshed = await apiJson<unknown>(refreshResponse);
    if (!isAuthTokens(refreshed)) {
      return NextResponse.json({ message: 'The refresh endpoint returned invalid session data.' }, { status: 502 });
    }
    rotatedTokens = refreshed;
    accessToken = refreshed.accessToken;
    profileResponse = await getProfile(accessToken);
  }

  if (!profileResponse.ok) {
    if (profileResponse.status === 401) {
      const result = NextResponse.json({ message: 'Session expired. Please sign in again.' }, { status: 401 });
      clearAuthCookies(result);
      return result;
    }
    const body: unknown = await profileResponse.json();
    return NextResponse.json({ message: apiErrorMessage(body) }, { status: 502 });
  }

  const profile = toSessionProfile(await apiJson<unknown>(profileResponse));
  if (!profile) {
    const result = NextResponse.json({ message: 'The account is not assigned to an admin portal.' }, { status: 403 });
    clearAuthCookies(result);
    return result;
  }

  const result = NextResponse.json(profile);
  if (rotatedTokens && deviceId) setAuthCookies(result, rotatedTokens, deviceId);
  return result;
}
