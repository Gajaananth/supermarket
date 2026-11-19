import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE } from '@/lib/server/backend';

const activeSuperAdminRoutes = new Set([
  '/admin',
  '/admin/overview',
  '/admin/inventory',
  '/admin/transfers',
  '/admin/stores',
  '/admin/riders',
  '/admin/reports',
]);

const activeStoreAdminRoutes = new Set([
  '/admin',
  '/admin/orders',
  '/admin/store-stock',
  '/admin/transfers',
  '/admin/deposits',
]);

type AdminRole = 'SUPER_ADMIN' | 'STORE_ADMIN';

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

async function getAdminTokenRole(token: string): Promise<AdminRole | null> {
  const secret = process.env.BUYME_JWT_SECRET;
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { alg?: string };
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as {
      exp?: number;
      role?: string;
    };
    if (
      header.alg !== 'HS256' ||
      (payload.role !== 'SUPER_ADMIN' && payload.role !== 'STORE_ADMIN') ||
      !payload.exp ||
      payload.exp <= Date.now() / 1000
    ) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid ? payload.role : null;
  } catch {
    return null;
  }
}

function adminHome(role: AdminRole): string {
  return role === 'STORE_ADMIN' ? '/admin/orders' : '/admin/overview';
}

function loginRedirect(request: NextRequest): NextResponse {
  const login = new URL('/login', request.url);
  login.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/login') {
    const token = request.cookies.get(ACCESS_COOKIE)?.value;
    const role = token ? await getAdminTokenRole(token) : null;
    if (role) {
      return NextResponse.redirect(new URL(adminHome(role), request.url));
    }
    return NextResponse.next();
  }

  if (path === '/shop' || path.startsWith('/shop/') || path === '/rider' || path.startsWith('/rider/')) {
    const notStarted = new URL('/login', request.url);
    notStarted.searchParams.set('phase', 'not-started');
    return NextResponse.redirect(notStarted);
  }

  if (!path.startsWith('/admin')) return NextResponse.next();

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const role = token ? await getAdminTokenRole(token) : null;
  if (!role) {
    return loginRedirect(request);
  }

  if (path === '/admin') {
    return NextResponse.redirect(new URL(adminHome(role), request.url));
  }

  const activeRoutes = role === 'STORE_ADMIN' ? activeStoreAdminRoutes : activeSuperAdminRoutes;
  if (!activeRoutes.has(path)) {
    const otherRoleRoutes = role === 'STORE_ADMIN' ? activeSuperAdminRoutes : activeStoreAdminRoutes;
    if (otherRoleRoutes.has(path)) {
      return NextResponse.redirect(new URL(adminHome(role), request.url));
    }
    return NextResponse.redirect(new URL(`${adminHome(role)}?phase=not-started`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
