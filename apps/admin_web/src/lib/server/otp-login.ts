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

type OtpPortal = "customer" | "rider";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isContact(value: unknown, portal: OtpPortal): value is string {
  if (typeof value !== "string" || value.length > 100) return false;
  return portal === "customer"
    ? /^\+94\d{9}$/.test(value)
    : /^(?:\+94\d{9}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})$/i.test(value);
}

function contactFromInput(value: unknown, portal: OtpPortal): string | null {
  if (!isRecord(value)) return null;
  const contact = portal === "customer" ? value.phone : value.destination;
  return isContact(contact, portal) ? contact.trim() : null;
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

function portalRole(portal: OtpPortal): "CUSTOMER" | "RIDER" {
  return portal === "customer" ? "CUSTOMER" : "RIDER";
}

export async function requestOtp(request: Request, portal: OtpPortal): Promise<NextResponse> {
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
  const contact = contactFromInput(input, portal);
  if (!contact) {
    const expected = portal === "customer" ? "a valid +94 mobile number" : "a valid +94 mobile number or email";
    return NextResponse.json({ message: `Please provide ${expected}.` }, { status: 400 });
  }

  const endpoint = portal === "customer" ? "customer/otp-request" : "rider/otp-request";
  const body = portal === "customer" ? { phone: contact } : { destination: contact };
  const response = await fetch(backendUrl(`/api/v1/auth/${endpoint}`), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const errorBody: unknown = await response.json();
    return NextResponse.json({ message: apiErrorMessage(errorBody) }, { status: response.status });
  }

  const data = await apiJson<unknown>(response);
  if (
    !isRecord(data) ||
    typeof data.message !== "string" ||
    typeof data.expiresInSeconds !== "number"
  ) {
    return NextResponse.json({ message: "The OTP endpoint returned invalid response data." }, { status: 502 });
  }
  const demoCode = typeof data.demoCode === "string" && /^\d{6}$/.test(data.demoCode)
    ? data.demoCode
    : undefined;
  return NextResponse.json({
    message: data.message,
    expiresInSeconds: data.expiresInSeconds,
    ...(demoCode ? { demoCode } : {}),
  });
}

export async function verifyOtp(request: Request, portal: OtpPortal): Promise<NextResponse> {
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
  const contact = contactFromInput(input, portal);
  if (!contact || !isRecord(input) || typeof input.code !== "string" || !/^\d{6}$/.test(input.code)) {
    return NextResponse.json({ message: "A valid contact and six-digit code are required." }, { status: 400 });
  }

  const deviceId = randomUUID();
  const endpoint = portal === "customer" ? "customer/otp-verify" : "rider/otp-verify";
  const body = portal === "customer"
    ? { phone: contact, code: input.code, deviceId, deviceInfo: "BuyMe Customer Web" }
    : { destination: contact, code: input.code, deviceId, deviceInfo: "BuyMe Rider Web" };
  const response = await fetch(backendUrl(`/api/v1/auth/${endpoint}`), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const errorBody: unknown = await response.json();
    return NextResponse.json({ message: apiErrorMessage(errorBody) }, { status: response.status });
  }

  const data = await apiJson<unknown>(response);
  if (!isAuthTokens(data)) {
    return NextResponse.json({ message: "The verification endpoint returned invalid session data." }, { status: 502 });
  }
  if (data.user?.role !== portalRole(portal)) {
    if (!(await revokeSession(data.refreshToken))) {
      return NextResponse.json({ message: "The account is not authorized and its session could not be revoked." }, { status: 502 });
    }
    return NextResponse.json({ message: `This account cannot access the ${portal} portal.` }, { status: 403 });
  }

  const result = NextResponse.json({ user: data.user });
  setAuthCookies(result, data, deviceId);
  return result;
}
