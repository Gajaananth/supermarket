import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/server/backend";

const activeSuperAdminRoutes = new Set([
  "/admin",
  "/admin/overview",
  "/admin/inventory",
  "/admin/transfers",
  "/admin/stores",
  "/admin/riders",
  "/admin/reports",
]);

const activeStoreAdminRoutes = new Set([
  "/admin",
  "/admin/orders",
  "/admin/store-stock",
  "/admin/transfers",
  "/admin/deposits",
]);

const storeAdminOnlyRoutes = new Set(["/admin/orders", "/admin/store-stock", "/admin/deposits"]);

type AppRole = "SUPER_ADMIN" | "STORE_ADMIN" | "CUSTOMER" | "RIDER";

function isAppRole(value: unknown): value is AppRole {
  return value === "SUPER_ADMIN" ||
    value === "STORE_ADMIN" ||
    value === "CUSTOMER" ||
    value === "RIDER";
}

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function getTokenRole(token: string): Promise<AppRole | null> {
  const secret = process.env.BUYME_JWT_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { alg?: string };
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as {
      exp?: number;
      role?: string;
    };
    if (
      header.alg !== "HS256" ||
      !isAppRole(payload.role) ||
      !payload.exp ||
      payload.exp <= Date.now() / 1000
    ) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid ? payload.role : null;
  } catch {
    return null;
  }
}

function roleHome(role: AppRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/overview";
    case "STORE_ADMIN":
      return "/admin/orders";
    case "RIDER":
      return "/rider";
    case "CUSTOMER":
      return "/";
  }
}

function loginRedirect(request: NextRequest, loginPath: string): NextResponse {
  const login = new URL(loginPath, request.url);
  login.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const role = token ? await getTokenRole(token) : null;

  if (path === "/login") {
    const legacyRedirect = new URL(`/admin/login${request.nextUrl.search}`, request.url);
    return NextResponse.redirect(legacyRedirect);
  }

  if (path === "/shop" || path === "/shop/") {
    return NextResponse.redirect(new URL(`/${request.nextUrl.search}`, request.url));
  }

  const loginRole: Record<string, AppRole> = {
    "/admin/login": "SUPER_ADMIN",
    "/store-admin/login": "STORE_ADMIN",
    "/customer/login": "CUSTOMER",
    "/rider/login": "RIDER",
  };
  if (loginRole[path]) {
    if (role) {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (role !== "SUPER_ADMIN" && role !== "STORE_ADMIN") {
      return role
        ? NextResponse.redirect(new URL(roleHome(role), request.url))
        : loginRedirect(request, storeAdminOnlyRoutes.has(path) ? "/store-admin/login" : "/admin/login");
    }

    if (path === "/admin") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    const activeRoutes = role === "STORE_ADMIN" ? activeStoreAdminRoutes : activeSuperAdminRoutes;
    if (!activeRoutes.has(path)) {
      const otherRoleRoutes = role === "STORE_ADMIN" ? activeSuperAdminRoutes : activeStoreAdminRoutes;
      if (otherRoleRoutes.has(path)) {
        return NextResponse.redirect(new URL(roleHome(role), request.url));
      }
      return NextResponse.redirect(new URL(`${roleHome(role)}?phase=not-started`, request.url));
    }
    return NextResponse.next();
  }

  if (path === "/shop/account" || path.startsWith("/shop/account/")) {
    if (role === "CUSTOMER") return NextResponse.next();
    return role
      ? NextResponse.redirect(new URL(roleHome(role), request.url))
      : loginRedirect(request, "/customer/login");
  }

  if (path === "/rider" || path.startsWith("/rider/")) {
    if (role === "RIDER") return NextResponse.next();
    return role
      ? NextResponse.redirect(new URL(roleHome(role), request.url))
      : loginRedirect(request, "/rider/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
