import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  apiErrorMessage,
  backendUrl,
  clearAuthCookies,
  DEVICE_COOKIE,
  REFRESH_COOKIE,
  sameOriginRequest,
} from '@/lib/server/backend';

async function rotateAccessToken(refreshToken: string, deviceId: string): Promise<string> {
  const response = await fetch(backendUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ refreshToken, deviceId }),
    cache: 'no-store',
  });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(apiErrorMessage(body));
  if (
    typeof body !== 'object' ||
    body === null ||
    !('success' in body) ||
    body.success !== true ||
    !('data' in body) ||
    typeof body.data !== 'object' ||
    body.data === null ||
    !('accessToken' in body.data) ||
    typeof body.data.accessToken !== 'string'
  ) {
    throw new Error('The refresh endpoint returned invalid session data.');
  }
  return body.data.accessToken;
}

async function revokeAll(accessToken: string): Promise<Response> {
  return fetch(backendUrl('/api/v1/auth/logout-all'), {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
    cache: 'no-store',
  });
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) {
    return NextResponse.json({ message: 'Cross-origin requests are not allowed.' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  let response: NextResponse;
  try {
    if (!accessToken && refreshToken && deviceId) {
      accessToken = await rotateAccessToken(refreshToken, deviceId);
    }

    if (!accessToken) {
      throw new Error('No valid access token was available to revoke all sessions.');
    }
    let apiResponse = await revokeAll(accessToken);
    if (apiResponse.status === 401 && refreshToken && deviceId) {
      accessToken = await rotateAccessToken(refreshToken, deviceId);
      apiResponse = await revokeAll(accessToken);
    }
    if (apiResponse.ok) {
      response = NextResponse.json({ loggedOut: true });
    } else {
      const body: unknown = await apiResponse.json();
      response = NextResponse.json(
        { message: apiErrorMessage(body) },
        { status: apiResponse.status },
      );
    }
  } catch (error) {
    response = NextResponse.json(
      { message: error instanceof Error ? error.message : 'The session could not be revoked.' },
      { status: 502 },
    );
  }
  clearAuthCookies(response);
  return response;
}
