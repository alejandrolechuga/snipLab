import { applyRule } from '../intercept';
import type { Rule } from '../../../types/rule';

class FakeResponse {
  body: any;
  status: number;
  statusText: string;
  headers: any;
  constructor(
    body: any,
    init: { status: number; statusText?: string; headers?: any }
  ) {
    this.body = body;
    this.status = init.status;
    this.statusText = init.statusText ?? '';
    this.headers = init.headers;
  }
  clone() {
    return new FakeResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    });
  }
  text() {
    return Promise.resolve(String(this.body));
  }
}

(globalThis as any).Response = FakeResponse;

describe('applyRule', () => {
  it('matches using substring when isRegExp is false', async () => {
    const rule: Rule = {
      id: '1',
      urlPattern: '/api',
      isRegExp: false,
      method: 'GET',
      enabled: true,
      statusCode: 201,
      date: '',
      response: 'override',
      delayMs: null,
    };
    const result = applyRule(
      { requestUrl: '/v1/api/test', requestMethod: 'GET', requestHeaders: {} },
      rule,
      new Response('orig', { status: 200 })
    );
    expect(result).toBeInstanceOf(Response);
    expect(result && (await result.text())).toBe('override');
    expect(result?.status).toBe(201);
  });

  it('matches using RegExp when isRegExp is true', () => {
    const rule: Rule = {
      id: '1',
      urlPattern: '^/items/\\d+$',
      isRegExp: true,
      method: 'GET',
      enabled: true,
      statusCode: 200,
      date: '',
      response: null,
      delayMs: null,
    };
    const result = applyRule(
      { requestUrl: '/items/42', requestMethod: 'GET', requestHeaders: {} },
      rule,
      new Response('orig', { status: 200 })
    );
    expect(result).toBeInstanceOf(Response);
  });

  it('returns undefined when RegExp is invalid', () => {
    const rule: Rule = {
      id: '1',
      urlPattern: '(',
      isRegExp: true,
      method: 'GET',
      enabled: true,
      statusCode: 200,
      date: '',
      response: null,
      delayMs: null,
    };
    const result = applyRule(
      { requestUrl: '/test', requestMethod: 'GET', requestHeaders: {} },
      rule,
      new Response('orig', { status: 200 })
    );
    expect(result).toBeUndefined();
  });
});
