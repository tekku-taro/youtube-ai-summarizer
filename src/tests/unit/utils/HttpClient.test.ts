import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { HttpClient, HttpError } from '@/utils';

// 1. MSWのモックサーバー設定
const server = setupServer(
  // 正常系: JSONを返すリクエスト
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({ id: 1, name: 'Tanaka' });
  }),

  // 204 No Content のリクエスト
  http.post('https://api.example.com/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // タイムアウトを発生させるための遅延リクエスト
  http.get('https://api.example.com/timeout', async () => {
    await delay(200); // 200ms 遅延させる
    return HttpResponse.json({ ok: true });
  })
);

// テスト実行前後のライフサイクル処理
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers(); // タイマーのモックをリセット
});
afterAll(() => server.close());

describe('HttpClient', () => {
  const client = new HttpClient();

  it('GETリクエストでJSONデータを正しく取得できること', async () => {
    const response = await client.get<{ id: number; name: string }>({
      method:"GET",
      url: 'https://api.example.com/user',
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: 1, name: 'Tanaka' });
  });

  it('204 No Contentの場合、dataがundefinedになること', async () => {
    const response = await client.post<undefined>({
      method:"GET",
      url: 'https://api.example.com/logout',
    });

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });

  it('タイムアウト時にHttpError(TIMEOUT)がスローされること', async () => {
    // VitestのFake Timersを使って、実際時間を待たずにタイムアウトをシミュレート
    vi.useFakeTimers();

    const requestPromise = client.get({
      method:"GET",
      url: 'https://api.example.com/timeout',
      timeout: 50, // 50msでタイムアウトするように設定（MSW側は200ms待つ）
    });

    // タイマーを50ms進める
    vi.advanceTimersByTime(50);

    await expect(requestPromise).rejects.toThrow(HttpError);
    await expect(requestPromise).rejects.toMatchObject({
      code: 'TIMEOUT',
      message: 'Request timed out'
    });
  });
});