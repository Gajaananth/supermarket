import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  apiErrorMessage,
  apiJson,
  backendUrl,
  isAuthTokens,
  sameOriginRequest,
  setAuthCookies,
} from "@/lib/server/backend";

type AdminRole = "SUPER_ADMIN" | "STORE_ADMIN";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLoginInput(value: unknown): value is { email: string; password: string } {
  return isRecord(value) &&
    typeof value.email === "string" &&
    value.email.includes("@") &&
    typeof value.password === "string" &&
    value.password.length > 0;
}

function isTwoFactorRequired(value: unknown): value is { requires2fa: true; email: string; demoCode?: unknown } {
  return isRecord(value) &&
    value.requires2fa === true &&
    typeof value.email === "string";
}

async function revokeSession(refreshToken: string): Promise<boolean> {
  const response = await fetch(backendUrl("/api/v1/auth/logout"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  return response.ok;
}

export async function loginAdmin(request: Request, expectedRole: AdminRole): Promise<NextResponse> {
  if (!sameOriginRequest(request)) {
    return NextResponse.json({ message: "Cross-origin requests are not allowed." }, { status: 403 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
    }
    throw error;
  }
  if (!isLoginInput(input)) {
    return NextResponse.json({ message: "A valid email and password are required." }, { status: 400 });
  }

  const deviceId = randomUUID();
  const response = await fetch(backendUrl("/api/v1/auth/admin/login"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      ...input,
      email: input.email.trim().toLowerCase(),
      deviceId,
      deviceInfo: "BuyMe Admin Web",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body: unknown = await response.json();
    return NextResponse.json({ message: apiErrorMessage(body) }, { status: response.status });
  }

  const data = await apiJson<unknown>(response);
  if (isTwoFactorRequired(data)) {
    if (expectedRole !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Use the Super Admin sign-in page for this account." }, { status: 403 });
    }
    const demoCode = isRecord(data) &&
      typeof data.demoCode === "string" &&
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
    return NextResponse.json({ message: "The login endpoint returned invalid session data." }, { status: 502 });
  }
  if (data.user?.role !== expectedRole) {
    if (!(await revokeSession(data.refreshToken))) {
      return NextResponse.json({ message: "The account is not authorized and its session could not be revoked." }, { status: 502 });
    }
    const portal = expectedRole === "SUPER_ADMIN" ? "Super Admin" : "Store Admin";
    return NextResponse.json({ message: `This account cannot access the ${portal} portal.` }, { status: 403 });
  }

  const result = NextResponse.json({ user: data.user });
  setAuthCookies(result, data, deviceId);
  return result;
}
