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

type LoginInput = Pick<components['schemas']['AdminLoginDto'], 'email' | 'password'>;

function isLoginInput(value: unknown): value is LoginInput {
  return typeof value === 'object' &&
    value !== null &&
    'email' in value &&
    typeof value.email === 'string' &&
    value.email.includes('@') &&
    'password' in value &&
    typeof value.password === 'string' &&
    value.password.length > 0;
}

function isTwoFactorRequired(value: unknown): value is { requires2fa: true; email: string } {
  return typeof value === 'object' &&
    value !== null &&
    'requires2fa' in value &&
    value.requires2fa === true &&
    'email' in value &&
    typeof value.email === 'string';
}

function isAdminRole(role: unknown): role is 'SUPER_ADMIN' | 'STORE_ADMIN' {
  return role === 'SUPER_ADMIN' || role === 'STORE_ADMIN';
}

async function revokeUnauthorizedSession(refreshToken: string): Promise<boolean> {
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
  if (!isLoginInput(input)) {
    return NextResponse.json({ message: 'A valid email and password are required.' }, { status: 400 });
  }

  const deviceId = randomUUID();
  const response = await fetch(backendUrl('/api/v1/auth/admin/login'), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ ...input, email: input.email.trim().toLowerCase(), deviceId, deviceInfo: 'BuyMe Admin Web' }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body: unknown = await response.json();
    return NextResponse.json(
      { message: apiErrorMessage(body) },
      { status: response.status },
    );
  }

  const data = await apiJson<unknown>(response);
  if (isTwoFactorRequired(data)) {
    const demoCode = 'demoCode' in data &&
      typeof data.demoCode === 'string' &&
      /^\d{6}$/.test(data.demoCode)
      ? data.demoCode
      : undefined;
    return NextResponse.json({
      requires2fa: true,
      email: data.email,
      ...(demoCode ? { demoCode } : {}),
    });
  }
  if (!isAuthTokens(data)) {
    return NextResponse.json({ message: 'The login endpoint returned invalid session data.' }, { status: 502 });
  }
  if (!isAdminRole(data.user?.role)) {
    if (!(await revokeUnauthorizedSession(data.refreshToken))) {
      return NextResponse.json({ message: 'The account is not authorized and its session could not be revoked.' }, { status: 502 });
    }
    return NextResponse.json({ message: 'This account cannot access the admin portals.' }, { status: 403 });
  }

  const result = NextResponse.json({ user: data.user });
  setAuthCookies(result, data, deviceId);
  return result;
}
