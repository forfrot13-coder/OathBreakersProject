import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { buildApiUrl } from './endpoints';
import { withAuth, withCaching, withErrorHandling, withRetry, withTimeout, type Fetcher } from './apiHelpers';
import { logError } from './errorHandler';

const DEFAULT_TIMEOUT_MS = 15_000;

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

const circuit = {
  state: 'CLOSED' as CircuitState,
  failures: 0,
  openedAt: 0,
  failureThreshold: 5,
  cooldownMs: 30_000,
};

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

let tokenProvider: () => string | null = getStoredToken;
let unauthorizedHandler: (() => void) | null = null;

export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function isCircuitOpen(): boolean {
  if (circuit.state !== 'OPEN') return false;
  return Date.now() - circuit.openedAt < circuit.cooldownMs;
}

function recordSuccess() {
  circuit.failures = 0;
  circuit.state = 'CLOSED';
}

function recordFailure() {
  circuit.failures += 1;
  if (circuit.failures >= circuit.failureThreshold) {
    circuit.state = 'OPEN';
    circuit.openedAt = Date.now();
  }
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isCircuitOpen()) {
    return Promise.reject({
      message: 'Circuit open: too many recent failures',
      code: 'CIRCUIT_OPEN',
    });
  }

  const token = tokenProvider();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Token ${token}`;
  }

  (config as InternalAxiosRequestConfig & { metadata?: { start: number } }).metadata = { start: Date.now() };

  return config;
});

api.interceptors.response.use(
  (response) => {
    recordSuccess();
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (!status || status >= 500 || status === 429) {
      recordFailure();
    }

    if (status === 401) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('user');
        }
      } finally {
        unauthorizedHandler?.();
      }
    }

    const config = error.config as (InternalAxiosRequestConfig & { metadata?: { start: number } }) | undefined;
    const timingMs = config?.metadata?.start ? Date.now() - config.metadata.start : undefined;

    logError(error, {
      timingMs,
      url: config?.url,
      method: config?.method,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
    });

    return Promise.reject(error);
  }
);

export default api;

function createFetchClient(options?: {
  timeoutMs?: number;
  useCache?: boolean;
  cacheTtlMs?: number;
  cacheStorage?: 'memory' | 'localStorage';
}): Fetcher {
  const base: Fetcher = (input, init) => fetch(input, init);

  const wrapped = withAuth(base, tokenProvider);
  const timed = withTimeout(wrapped, { timeoutMs: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS });
  const retried = withRetry(timed, { retries: 2 });

  const maybeCached = options?.useCache
    ? withCaching(retried, {
        ttlMs: options.cacheTtlMs,
        storage: options.cacheStorage,
      })
    : retried;

  return withErrorHandling(maybeCached);
}

export async function apiFetchJson<T>(
  path: string,
  init?: (RequestInit & {
    timeoutMs?: number;
    useCache?: boolean;
    cacheTtlMs?: number;
    cacheStorage?: 'memory' | 'localStorage';
  })
): Promise<T> {
  if (isCircuitOpen()) {
    const err = new Error('سرویس موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید') as Error & {
      code?: string;
    };
    err.code = 'CIRCUIT_OPEN';
    throw err;
  }

  const { timeoutMs, useCache, cacheTtlMs, cacheStorage, ...requestInit } = init ?? {};

  const client = createFetchClient({
    timeoutMs,
    useCache,
    cacheTtlMs,
    cacheStorage,
  });

  const res = await client(buildApiUrl(path), requestInit);
  const data = (await res.json()) as T;
  recordSuccess();
  return data;
}
