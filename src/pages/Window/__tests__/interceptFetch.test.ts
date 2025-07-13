import { ExtensionReceivedState } from '../ExtensionReceivedState';
import type { Rule } from '../../../types/rule';
import { ExtensionMessageType } from '../../../types/runtimeMessage';

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

jest.mock('../contentScriptMessage', () => ({
  postMessage: jest.fn(),
}));

describe('interceptFetch', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.fn(() =>
      Promise.resolve(new Response('orig', { status: 200 }))
    );
    (globalThis as any).fetch = fetchMock;
    (globalThis as any).Request = class MockRequest {};
    jest.resetModules();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    delete (globalThis as any).Request;
    jest.useRealTimers();
  });

  it('delays returning the overridden response', async () => {
    const { interceptFetch } = await import('../intercept');
    const state = new ExtensionReceivedState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/match',
          isRegExp: false,
          method: 'GET',
          enabled: true,
          statusCode: 200,
          date: '',
          response: 'override',
          delayMs: 200,
        } as Rule,
      ],
    });
    interceptFetch(state);

    const resultPromise = fetch('/match');
    let resolved = false;
    resultPromise.then(() => {
      resolved = true;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(199);
    await Promise.resolve();
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1);
    const response = await resultPromise;
    expect(await response.text()).toBe('override');
    const { postMessage } = await import('../contentScriptMessage');
    expect((postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      action: ExtensionMessageType.RULE_MATCHED,
      ruleId: '1',
    });
  });

  it('caps the delay at 10000ms', async () => {
    const { interceptFetch } = await import('../intercept');
    const state = new ExtensionReceivedState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/match',
          isRegExp: false,
          method: 'GET',
          enabled: true,
          statusCode: 200,
          date: '',
          response: 'override',
          delayMs: 50000,
        } as Rule,
      ],
    });
    interceptFetch(state);

    const resultPromise = fetch('/match');
    let resolved = false;
    resultPromise.then(() => {
      resolved = true;
    });

    await Promise.resolve();
    jest.advanceTimersByTime(9999);
    await Promise.resolve();
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1);
    const response = await resultPromise;
    expect(await response.text()).toBe('override');
  });

  it('overrides request body when requestBody is set', async () => {
    const { interceptFetch } = await import('../intercept');
    const state = new ExtensionReceivedState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/body',
          isRegExp: false,
          method: 'POST',
          enabled: true,
          statusCode: 200,
          date: '',
          response: null,
          delayMs: null,
          requestBody: '{"x":1}',
        } as Rule,
      ],
    });
    interceptFetch(state);

    await fetch('/body', { method: 'POST', body: 'orig' });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: '{"x":1}',
    });
  });

  it('keeps original request body when requestBody is not set', async () => {
    const { interceptFetch } = await import('../intercept');
    const state = new ExtensionReceivedState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/body',
          isRegExp: false,
          method: 'POST',
          enabled: true,
          statusCode: 200,
          date: '',
          response: null,
          delayMs: null,
        } as Rule,
      ],
    });
    interceptFetch(state);

    await fetch('/body', { method: 'POST', body: 'orig' });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: 'orig',
    });
  });

  it('uses the first matching rule for both request and response', async () => {
    const { interceptFetch } = await import('../intercept');
    const state = new ExtensionReceivedState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/combo',
          isRegExp: false,
          method: 'POST',
          enabled: true,
          statusCode: 200,
          date: '',
          response: null,
          delayMs: null,
          requestBody: 'patched',
        } as Rule,
        {
          id: '2',
          urlPattern: '/combo',
          isRegExp: false,
          method: 'POST',
          enabled: true,
          statusCode: 200,
          date: '',
          response: 'override',
          delayMs: null,
        } as Rule,
      ],
    });
    interceptFetch(state);

    const resp = await fetch('/combo', { method: 'POST', body: 'orig' });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ body: 'patched' });
    expect(await resp.text()).toBe('orig');
  });
});
