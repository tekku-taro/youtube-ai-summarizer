export interface HttpRequest {
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse<T> {
  status: number;
  headers: Headers;
  data: T;
}

export class HttpError extends Error {
  public readonly status: number | undefined;
  public readonly code: string | undefined;
  public override readonly cause: unknown;

  constructor(message: string, options?: { status?: number; code?: string; cause?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.status = options?.status;
    this.code = options?.code;
    this.cause = options?.cause;
  }
}

export class HttpClient {
  private readonly defaultTimeoutMs = 10000;

  public async get<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    return this.request<T>({ ...request, method: 'GET' });
  }

  public async post<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    return this.request<T>({ ...request, method: 'POST' });
  }

  private async request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    const timeoutMs = request.timeout ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const headers = new Headers(request.headers);
      const init: RequestInit = {
        method: request.method,
        headers,
        signal: controller.signal,
      };

      if (request.body !== undefined) {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
        init.body = JSON.stringify(request.body);
      }

      const response = await fetch(request.url, init);
      const contentType = response.headers.get('content-type') ?? '';
      let data: T;

      if (response.status === 204) {
        data = undefined as T;
      } else if (contentType.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as T;
      }

      if (!response.ok) {
        throw new HttpError(`HTTP ${response.status}`, {
          status: response.status,
          code: 'HTTP_ERROR',
          cause: data,
        });
      }

      return {
        status: response.status,
        headers: response.headers,
        data,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new HttpError('Request timed out', {
          code: 'TIMEOUT',
          cause: error,
        });
      }

      throw new HttpError('Network request failed', {
        cause: error,
      });
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }
}
