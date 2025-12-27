import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse, GameError } from './types';

function coerceMessage(payload: ApiErrorResponse | undefined): string | undefined {
  if (!payload) return undefined;
  if (typeof payload.error === 'string') return payload.error;
  if (typeof payload.detail === 'string') return payload.detail;
  if (typeof payload.message === 'string') return payload.message;
  if (Array.isArray(payload.non_field_errors) && payload.non_field_errors[0]) return payload.non_field_errors[0];
  return undefined;
}

export function parseApiError(error: unknown): GameError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const status = axiosErr.response?.status;
    const payload = axiosErr.response?.data;

    return {
      status,
      message: coerceMessage(payload) ?? axiosErr.message ?? 'خطای ناشناخته',
      details: payload ?? axiosErr.toJSON(),
    };
  }

  if (error && typeof error === 'object') {
    const maybe = error as Partial<GameError> & { message?: unknown };
    if (typeof maybe.message === 'string') {
      return {
        status: typeof maybe.status === 'number' ? maybe.status : undefined,
        code: typeof maybe.code === 'string' ? maybe.code : undefined,
        message: maybe.message,
        details: maybe.details,
        requestId: typeof maybe.requestId === 'string' ? maybe.requestId : undefined,
      };
    }
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'خطای ناشناخته' };
}

export function getErrorMessage(err: unknown): string {
  const e = parseApiError(err);

  if (e.status === 0) return 'مشکل در اتصال به اینترنت';

  // Handle specific error codes from the ticket
  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: 'نام کاربری یا رمز عبور نادرست است',
    USER_EXISTS: 'این نام کاربری قبلا ثبت شده است',
    INSUFFICIENT_BALANCE: 'موجودی کافی نیست',
    CARD_NOT_FOUND: 'کارت یافت نشد',
    SERVER_ERROR: 'خطای سرور',
    NETWORK_ERROR: 'مشکل در اتصال',
  };

  if (e.code && messages[e.code]) {
    return messages[e.code];
  }

  switch (e.status) {
    case 400:
      return e.message || 'درخواست نامعتبر است';
    case 401:
      return 'برای ادامه ابتدا وارد شوید';
    case 403:
      return 'دسترسی غیرمجاز';
    case 404:
      return 'موردی یافت نشد';
    case 408:
      return 'زمان پاسخ‌گویی سرور به پایان رسید';
    case 429:
      return 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید';
    case 500:
      return 'خطای سرور. لطفاً بعداً دوباره تلاش کنید';
    default:
      return e.message || 'خطای ناشناخته';
  }
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  const parsed = parseApiError(error);
  // eslint-disable-next-line no-console
  console.error('[OathBreakers] Error', {
    ...parsed,
    context,
  });
}

export function createErrorReport(error: unknown, context?: Record<string, unknown>) {
  const parsed = parseApiError(error);

  return {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    error: parsed,
    context,
  };
}
