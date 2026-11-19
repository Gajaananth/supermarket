import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { components } from '@/lib/api/generated';
import {
  apiErrorMessage,
  apiJson,
  backendUrl,
  isAuthTokens,
  sameOriginRequest,
  setAuthCookies,
} from '@/lib/server/backend';

type VerifyInput = Pick<components['schemas']['AdminVerify2faDto'], 'email' | 'code'>;

function isVerifyInput(value: unknown): value is VerifyInput {
  return typeof value === 'object' &&
    value !== null &&
    'email' in value &&
    typeof value.email === 'string' &&
    value.email.includes('@') &&
    'code' in value &&
    typeof value.code === 'string' &&
    /^\d{6}$/.test(value.code);
}

async function revokeNonSuperAdminSession(refreshToken: string): Promise<boolean> {
  const response = await fetch(backendUrl('/api/v1/auth/logout'), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });
  return response.ok;
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) {
    return NextResponse.json({ message: 'Cross-origin requests are not allowed.' }, { status: 403 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    }
    throw error;
  }
  if (!isVerifyInput(input)) {
    return NextResponse.json({ message: 'A valid email and six-digit code are required.' }, { status: 400 });
  }

  const deviceId = randomUUID();
  const response = await fetch(backendUrl('/api/v1/auth/admin/verify-2fa'), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      code: input.code,
      deviceId,
      deviceInfo: 'BuyMe Admin Web',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body: unknown = await response.json();
    return NextResponse.json({ message: apiErrorMessage(body) }, { status: response.status });
  }

  const data = await apiJson<unknown>(response);
  if (isAuthTokens(data) && data.user?.role !== 'SUPER_ADMIN') {
    if (!(await revokeNonSuperAdminSession(data.refreshToken))) {
      return NextResponse.json({ message: 'The account is not authorized and its session could not be revoked.' }, { status: 502 });
    }
    return NextResponse.json({ message: 'This account cannot access the Super Admin portal.' }, { status: 403 });
  }
  if (!isAuthTokens(data)) {
    return NextResponse.json({ message: 'The verification endpoint returned invalid session data.' }, { status: 502 });
  }

  const result = NextResponse.json({ user: data.user });
  setAuthCookies(result, data, deviceId);
  return result;
}
