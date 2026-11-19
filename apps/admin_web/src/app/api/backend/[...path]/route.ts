import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, backendUrl } from '@/lib/server/backend';

type RouteContext = { params: Promise<{ path: string[] }> };
const maxBodyBytes = 6 * 1024 * 1024;
const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path: segments } = await context.params;
  if (
    segments.length < 2 ||
    segments[0] !== 'api' ||
    segments[1] !== 'v1' ||
    segments.some((segment) => !/^[A-Za-z0-9._-]+$/.test(segment) || segment === '.' || segment === '..')
  ) {
    return NextResponse.json({ message: 'Invalid API route.' }, { status: 404 });
  }

  if (
    mutatingMethods.has(request.method) &&
    request.headers.get('origin') !== request.nextUrl.origin
  ) {
    return NextResponse.json({ message: 'Cross-origin requests are not allowed.' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > maxBodyBytes) {
    return NextResponse.json({ message: 'Request body exceeds the allowed size.' }, { status: 413 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: 'Sign-in required.' }, { status: 401 });
  }

  const target = new URL(backendUrl(`/${segments.join('/')}`));
  target.search = request.nextUrl.search;
  const headers = new Headers({
    authorization: `Bearer ${accessToken}`,
    accept: request.headers.get('accept') ?? 'application/json',
  });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const body = mutatingMethods.has(request.method)
    ? await request.arrayBuffer()
    : undefined;
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });
  const responseHeaders = new Headers({
    'cache-control': 'no-store',
    'content-type': upstream.headers.get('content-type') ?? 'application/json',
  });
  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
