import { ExtensionReceivedState } from '../ExtensionReceivedState';
import type { Rule } from '../../../types/rule';
import { setGlobalXMLHttpRequest } from '../../../utils/globalXMLHttpRequest';

jest.mock('../../../utils/globalFetch', () => {
  return {
    getOriginalFetch: jest.fn(() => (globalThis as any).fetch),
    setGlobalFetch: jest.fn(),
  };
});

const openMock = jest.fn();
const sendMock = jest.fn();

class FakeXMLHttpRequest {
  readyState = 0;
  responseType = '';
  private _responseText = 'orig';
  private _response: any = 'orig';
  listeners: Record<string, Array<() => void>> = {};

  open(
    method: string,
    url: string,
    async?: boolean,
    username?: string | null,
    password?: string | null
  ) {
    openMock(method, url, async, username, password);
  }

  addEventListener(event: string, cb: () => void) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  removeEventListener(event: string, cb: () => void) {
    const arr = this.listeners[event];
    if (!arr) return;
    const idx = arr.indexOf(cb);
    if (idx !== -1) arr.splice(idx, 1);
  }

  send(body?: any) {
    sendMock(body);
    this.readyState = 4;
    const handlers = this.listeners['readystatechange'] || [];
    handlers.forEach((cb) => cb.call(this));
  }

  simulateResponse(type: string, resp: any) {
    this.responseType = type;
    this._response = resp;
    this._responseText = typeof resp === 'string' ? resp : JSON.stringify(resp);
  }

  get response() {
    return this._response;
  }
  set response(val: any) {
    this._response = val;
  }

  get responseText() {
    if (this.responseType !== '' && this.responseType !== 'text') {
      throw new Error('InvalidStateError');
    }
    return this._responseText;
  }
  set responseText(val: string) {
    this._responseText = val;
  }
}

jest.mock('../../../utils/globalXMLHttpRequest', () => {
  return {
    getOriginalXMLHttpRequest: jest.fn(() => FakeXMLHttpRequest),
    setGlobalXMLHttpRequest: jest.fn((ctor: typeof XMLHttpRequest) => {
      (globalThis as any).XMLHttpRequest = ctor;
    }),
    getGlobalXMLHttpRequest: jest.fn(() => globalThis.XMLHttpRequest),
  };
});

describe('interceptXhr', () => {
  beforeEach(() => {
    (globalThis as any).XMLHttpRequest = FakeXMLHttpRequest as any;
    jest.resetModules();
    openMock.mockClear();
  });

  it('patch and unpatch swap the global constructor', async () => {
    const { patch, unpatch } = await import('../intercept');
    const state = new ExtensionReceivedState();
    const originalCtor = globalThis.XMLHttpRequest;
    patch(state);
    expect(globalThis.XMLHttpRequest).not.toBe(originalCtor);
    unpatch();
    expect(globalThis.XMLHttpRequest).toBe(originalCtor);
  });

  it('forwards username and password when async is omitted', async () => {
    const { interceptXhr } = await import('../intercept');
    const state = new ExtensionReceivedState();
    interceptXhr(state);
    const XhrCtor =
      globalThis.XMLHttpRequest as unknown as typeof FakeXMLHttpRequest;
    const xhr = new XhrCtor();
    xhr.open('GET', '/open', undefined, 'user', 'pass');
    expect(openMock).toHaveBeenCalledWith('GET', '/open', true, 'user', 'pass');
  });

  it('overrides response when rule matches even for json', async () => {
    const { interceptXhr } = await import('../intercept');
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
          delayMs: null,
        } as Rule,
      ],
    });
    interceptXhr(state);
    const XhrCtor =
      globalThis.XMLHttpRequest as unknown as typeof FakeXMLHttpRequest;
    const xhr: any = new XhrCtor();
    xhr.open('GET', '/match');
    xhr.simulateResponse('json', { ok: true });
    expect(() => xhr.send()).not.toThrow();
    expect(xhr.responseText).toBe('override');
    expect(xhr.response).toBe('override');
  });

  it('buffers callbacks until after delay', async () => {
    jest.useFakeTimers();
    const { interceptXhr } = await import('../intercept');
    const state = new ExtensionReceivedState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/delay',
          isRegExp: false,
          method: 'GET',
          enabled: true,
          statusCode: 200,
          date: '',
          response: 'override',
          delayMs: 50,
        } as Rule,
      ],
    });
    interceptXhr(state);
    const XhrCtor =
      globalThis.XMLHttpRequest as unknown as typeof FakeXMLHttpRequest;
    const xhr: any = new XhrCtor();
    const onload = jest.fn();
    xhr.onload = onload;
    xhr.open('GET', '/delay');
    xhr.simulateResponse('text', 'orig');
    xhr.send();
    expect(xhr.responseText).toBe('override');
    expect(onload).not.toHaveBeenCalled();
    jest.advanceTimersByTime(50);
    expect(onload).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('overrides request body when requestBody is set', async () => {
    const { interceptXhr } = await import('../intercept');
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
          requestBody: 'patched',
        } as Rule,
      ],
    });
    interceptXhr(state);
    const XhrCtor =
      globalThis.XMLHttpRequest as unknown as typeof FakeXMLHttpRequest;
    const xhr: any = new XhrCtor();
    xhr.open('POST', '/body');
    xhr.send('orig');
    expect(sendMock).toHaveBeenCalledWith('patched');
  });

  it('keeps original request body when requestBody is not set', async () => {
    const { interceptXhr } = await import('../intercept');
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
    interceptXhr(state);
    const XhrCtor =
      globalThis.XMLHttpRequest as unknown as typeof FakeXMLHttpRequest;
    const xhr: any = new XhrCtor();
    xhr.open('POST', '/body');
    xhr.send('orig');
    expect(sendMock).toHaveBeenCalledWith('orig');
  });

  it('uses the first matching rule for both request and response', async () => {
    const { interceptXhr } = await import('../intercept');
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
    interceptXhr(state);
    const XhrCtor =
      globalThis.XMLHttpRequest as unknown as typeof FakeXMLHttpRequest;
    const xhr: any = new XhrCtor();
    xhr.open('POST', '/combo');
    xhr.simulateResponse('text', 'orig');
    xhr.send('orig');
    expect(sendMock).toHaveBeenCalledWith('patched');
    expect(xhr.responseText).toBe('orig');
  });
});
