'use client';

import createClient from 'openapi-fetch';
import type { paths } from './generated';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function errorMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.message === 'string') {
    return value.message;
  }
  if (
    isRecord(value) &&
    Array.isArray(value.message) &&
    value.message.every((item) => typeof item === 'string')
  ) {
    return value.message.join(', ');
  }
  return fallback;
}

let refreshInProgress: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  if (!refreshInProgress) {
    refreshInProgress = (async () => {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new ApiError('Your session expired. Please sign in again.', response.status);
      }
    })();
  }

  try {
    await refreshInProgress;
  } finally {
    refreshInProgress = null;
  }
}

async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = { ...init, credentials: 'same-origin' as const };
  const response = await fetch(input, request);
  const url = new URL(input instanceof Request ? input.url : input.toString(), window.location.href);

  if (response.status !== 401 || !url.pathname.startsWith('/api/backend/')) {
    return response;
  }

  if ('locks' in navigator) {
    await navigator.locks.request('buyme-admin-session-refresh', refreshSession);
  } else {
    await refreshSession();
  }
  return fetch(input, request);
}

export const api = createClient<paths>({
  baseUrl: '/api/backend',
  fetch: authenticatedFetch,
});

export function unwrapApiResponse<T>(result: {
  data?: unknown;
  error?: unknown;
  response: Response;
}): T {
  if (!result.response.ok) {
    throw new ApiError(
      errorMessage(result.error, result.response.statusText || 'The API request failed.'),
      result.response.status,
    );
  }

  if (!isRecord(result.data) || result.data.success !== true || !('data' in result.data)) {
    throw new ApiError('The API returned an invalid response envelope.', result.response.status);
  }

  return result.data.data as T;
}

export function describeApiError(error: unknown): string {
  return error instanceof Error ? error.message : 'The request could not be completed.';
}
