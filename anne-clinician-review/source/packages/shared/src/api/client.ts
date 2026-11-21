import type { AuthUser } from "../types/auth";

type MaybePromise<T> = T | Promise<T>;

type ApiClientConfig = {
  baseUrl?: string;
  getToken: () => MaybePromise<string | null>;
  getRefreshToken?: () => MaybePromise<string | null>;
  onTokenRefreshed?: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser
  ) => MaybePromise<void>;
  onUnauthorized?: () => MaybePromise<void>;
  onSuspended?: (error: ApiError) => MaybePromise<void>;
  onLog?: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    context?: Record<string, unknown>
  ) => void;
};

export type ApiError = Error & {
  status?: number;
  code?: string;
  supportEmail?: string;
};

let _config: ApiClientConfig | null = null;
let _isRefreshing = false;
const _refreshQueue: Array<(token: string | null) => void> = [];

const getBaseUrl = () =>
  _config?.baseUrl ||
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  (typeof process !== "undefined" && process.env.EXPO_PUBLIC_API_URL) ||
  "http://localhost:8000";

export function initApiClient(config: ApiClientConfig) {
  _config = config;
}

function emitApiLog(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context: Record<string, unknown> = {}
) {
  _config?.onLog?.(level, message, { logger: "api-client", ...context });
}

async function doRefresh(triggerPath: string): Promise<string | null> {
  if (!_config?.getRefreshToken || !_config.onTokenRefreshed) return null;

  const refreshToken = await _config.getRefreshToken();
  if (!refreshToken) {
    emitApiLog("warn", "Token refresh skipped without refresh token", { triggerPath });
    return null;
  }

  emitApiLog("debug", "Token refresh request started", { triggerPath });
  const res = await fetch(`${getBaseUrl()}/api/v1/account/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    emitApiLog("warn", "Token refresh request failed", {
      triggerPath,
      status: res.status,
    });
    return null;
  }

  const data = await res.json();
  await _config.onTokenRefreshed(data.accessToken, data.refreshToken, data.user);
  emitApiLog("info", "Token refresh request succeeded", {
    triggerPath,
    status: res.status,
  });
  return data.accessToken as string;
}

async function refreshOnce(triggerPath: string): Promise<string | null> {
  if (_isRefreshing) {
    emitApiLog("debug", "Token refresh queued", { triggerPath });
    return new Promise((resolve) => {
      _refreshQueue.push(resolve);
    });
  }

  _isRefreshing = true;
  let newToken: string | null = null;

  try {
    newToken = await doRefresh(triggerPath);
  } finally {
    _isRefreshing = false;
    const queue = _refreshQueue.splice(0);
    for (const resolve of queue) {
      resolve(newToken);
    }
  }

  return newToken;
}

async function unauthorized() {
  if (_config?.onUnauthorized) {
    await _config.onUnauthorized();
  }
}

async function readError(res: Response): Promise<Error> {
  const err = await res.json().catch(() => ({ detail: res.statusText }));
  const detail = (err as any).detail;
  const message =
    typeof detail === "object" && detail
      ? detail.message
      : detail || (err as any).message || `HTTP ${res.status}`;
  return Object.assign(new Error(message), {
    status: res.status,
    code: typeof detail === "object" && detail ? detail.code : (err as any).code,
    supportEmail:
      typeof detail === "object" && detail ? detail.supportEmail : (err as any).supportEmail,
  }) as ApiError;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = _config ? await _config.getToken() : null;
  const method = options.method ?? "GET";
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  emitApiLog("debug", "API request started", {
    method,
    path,
    hasAccessToken: Boolean(token),
  });

  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });
  const durationMs = Date.now() - startedAt;

  if (res.status === 401) {
    emitApiLog("warn", "API request returned unauthorized", {
      method,
      path,
      status: res.status,
      durationMs,
      hasAccessToken: Boolean(token),
    });

    const newToken = await refreshOnce(path);
    if (newToken) {
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(`${getBaseUrl()}${path}`, {
        ...options,
        headers: retryHeaders,
      });
      const retryDurationMs = Date.now() - startedAt;

      if (!retryRes.ok) {
        if (retryRes.status === 401) {
          emitApiLog("warn", "API request retry returned unauthorized", {
            method,
            path,
            status: retryRes.status,
            durationMs: retryDurationMs,
          });
          await unauthorized();
        }
        throw await readError(retryRes);
      }

      if (retryRes.status === 204) return undefined as T;
      emitApiLog("debug", "API request retry completed", {
        method,
        path,
        status: retryRes.status,
        durationMs: retryDurationMs,
      });
      return retryRes.json() as Promise<T>;
    }

    emitApiLog("warn", "API request triggering unauthorized callback", {
      method,
      path,
      status: res.status,
    });
    await unauthorized();
    throw await readError(res);
  }

  if (!res.ok) {
    const error = (await readError(res)) as ApiError;
    emitApiLog("warn", "API request failed", {
      method,
      path,
      status: res.status,
      durationMs,
    });
    if (res.status === 403 && error.code === "account_suspended") {
      await _config?.onSuspended?.(error);
    }
    throw error;
  }

  if (res.status === 204) {
    emitApiLog("debug", "API request completed", {
      method,
      path,
      status: res.status,
      durationMs,
    });
    return undefined as T;
  }

  emitApiLog("debug", "API request completed", {
    method,
    path,
    status: res.status,
    durationMs,
  });
  return res.json() as Promise<T>;
}

export async function apiRequestBlob(
  path: string,
  options: RequestInit = {}
): Promise<Blob> {
  const token = _config ? await _config.getToken() : null;
  const method = options.method ?? "GET";
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  emitApiLog("debug", "API blob request started", {
    method,
    path,
    hasAccessToken: Boolean(token),
  });

  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });
  const durationMs = Date.now() - startedAt;

  if (res.status === 401) {
    emitApiLog("warn", "API blob request returned unauthorized", {
      method,
      path,
      status: res.status,
      durationMs,
      hasAccessToken: Boolean(token),
    });

    const newToken = await refreshOnce(path);
    if (newToken) {
      const retryHeaders: Record<string, string> = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(`${getBaseUrl()}${path}`, {
        ...options,
        headers: retryHeaders,
      });
      const retryDurationMs = Date.now() - startedAt;

      if (!retryRes.ok) {
        if (retryRes.status === 401) {
          emitApiLog("warn", "API blob request retry returned unauthorized", {
            method,
            path,
            status: retryRes.status,
            durationMs: retryDurationMs,
          });
          await unauthorized();
        }
        throw await readError(retryRes);
      }

      emitApiLog("debug", "API blob request retry completed", {
        method,
        path,
        status: retryRes.status,
        durationMs: retryDurationMs,
      });
      return retryRes.blob();
    }

    emitApiLog("warn", "API blob request triggering unauthorized callback", {
      method,
      path,
      status: res.status,
    });
    await unauthorized();
    throw await readError(res);
  }

  if (!res.ok) {
    const error = (await readError(res)) as ApiError;
    emitApiLog("warn", "API blob request failed", {
      method,
      path,
      status: res.status,
      durationMs,
    });
    if (res.status === 403 && error.code === "account_suspended") {
      await _config?.onSuspended?.(error);
    }
    throw error;
  }

  emitApiLog("debug", "API blob request completed", {
    method,
    path,
    status: res.status,
    durationMs,
  });
  return res.blob();
}
