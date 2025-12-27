import type { GameError } from './types';

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryOn?: (response: Response | null, error: unknown | null) => boolean;
}

export interface TimeoutOptions {
  timeoutMs?: number;
}

export interface CacheOptions {
  ttlMs?: number;
  key?: (input: RequestInfo | URL, init?: RequestInit) => string;
  storage?: 'memory' | 'localStorage';
}

const memoryCache = new Map<string, { expiresAt: number; value: unknown }>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withAuth(fetcher: Fetcher, getToken: () => string | null): Fetcher {
  return async (input, init = {}) => {
    const token = getToken();

    const headers = new Headers(init.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Token ${token}`);
    }

    return fetcher(input, { ...init, headers });
  };
}

export function withTimeout(fetcher: Fetcher, options: TimeoutOptions = {}): Fetcher {
  const timeoutMs = options.timeoutMs ?? 15000;

  return async (input, init = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedInit: RequestInit = {
        ...init,
        signal: init.signal ?? controller.signal,
      };

      return await fetcher(input, mergedInit);
    } finally {
      clearTimeout(timeout);
    }
  };
}

export function withRetry(fetcher: Fetcher, options: RetryOptions = {}): Fetcher {
  const {
    retries = 2,
    baseDelayMs = 250,
    maxDelayMs = 3000,
    retryOn = (response, error) => {
      if (error) return true;
      if (!response) return true;
      return response.status >= 500 || response.status === 429;
    },
  } = options;

  return async (input, init) => {
    let lastError: unknown = null;
    let lastResponse: Response | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        lastResponse = await fetcher(input, init);
        lastError = null;

        if (!retryOn(lastResponse, null) || attempt === retries) {
          return lastResponse;
        }
      } catch (err) {
        lastError = err;
        lastResponse = null;

        if (!retryOn(null, err) || attempt === retries) {
          throw err;
        }
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      await sleep(delay);
    }

    if (lastError) throw lastError;
    if (lastResponse) return lastResponse;

    throw new Error('Unexpected retry failure');
  };
}

export function withErrorHandling(fetcher: Fetcher): Fetcher {
  return async (input, init) => {
    const res = await fetcher(input, init);

    if (res.ok) return res;

    let payload: unknown = null;
    try {
      payload = await res.clone().json();
    } catch {
      try {
        payload = await res.clone().text();
      } catch {
        payload = null;
      }
    }

    let message = res.statusText || `HTTP ${res.status}`;
    if (payload && typeof payload === 'object') {
      const p = payload as Record<string, unknown>;
      const maybe =
        (typeof p.error === 'string' && p.error) ||
        (typeof p.detail === 'string' && p.detail) ||
        (typeof p.message === 'string' && p.message);
      if (maybe) message = maybe;
    }

    const apiError: GameError = {
      status: res.status,
      message,
      details: payload,
    };

    throw apiError;
  };
}

export function withCaching(fetcher: Fetcher, options: CacheOptions = {}): Fetcher {
  const ttlMs = options.ttlMs ?? 30_000;
  const storage = options.storage ?? 'memory';

  const keyFn =
    options.key ??
    ((input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method ?? 'GET';
      const body = typeof init?.body === 'string' ? init.body : '';
      return `${method}:${url}:${body}`;
    });

  return async (input, init = {}) => {
    const method = (init.method ?? 'GET').toUpperCase();
    if (method !== 'GET') return fetcher(input, init);

    const key = keyFn(input, init);
    const now = Date.now();

    const read = (): unknown | undefined => {
      if (storage === 'memory') {
        const entry = memoryCache.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt <= now) {
          memoryCache.delete(key);
          return undefined;
        }
        return entry.value;
      }

      if (typeof window === 'undefined') return undefined;
      const raw = window.localStorage.getItem(`cache:${key}`);
      if (!raw) return undefined;
      try {
        const parsed = JSON.parse(raw) as { expiresAt: number; value: unknown };
        if (parsed.expiresAt <= now) {
          window.localStorage.removeItem(`cache:${key}`);
          return undefined;
        }
        return parsed.value;
      } catch {
        window.localStorage.removeItem(`cache:${key}`);
        return undefined;
      }
    };

    const cached = read();
    if (cached !== undefined) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    const res = await fetcher(input, init);

    if (res.ok) {
      try {
        const data = await res.clone().json();
        const entry = { expiresAt: now + ttlMs, value: data };

        if (storage === 'memory') {
          memoryCache.set(key, entry);
        } else if (typeof window !== 'undefined') {
          window.localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
        }
      } catch {
        // ignore non-JSON responses
      }
    }

    return res;
  };
}
