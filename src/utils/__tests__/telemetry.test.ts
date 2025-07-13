// Import types for TypeScript without loading the module
import type { CLIENT_ID_KEY as KEY_TYPE } from '../telemetry';
const MODULE_PATH = '../telemetry';

describe('getClientId', () => {
  beforeEach(() => {
    jest.resetModules();
    (globalThis as any).crypto = (globalThis as any).crypto || {};
    (globalThis as any).crypto.randomUUID = () => 'uuid-mock';
  });

  function createChromeMocks(initial: Record<string, unknown>) {
    const setMock = jest.fn();
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: jest.fn(
            (_keys: string | string[] | null, cb: (items: any) => void) =>
              cb(initial)
          ),
          set: setMock,
        },
      },
    } as any;
    return { setMock };
  }

  it('returns stored id if present', async () => {
    const mod: any = await import(MODULE_PATH);
    createChromeMocks({ [mod.CLIENT_ID_KEY]: 'existing' });
    const id = await mod.getClientId();
    expect(id).toBe('existing');
  });

  it('generates and stores id if missing', async () => {
    const mod: any = await import(MODULE_PATH);
    const { setMock } = createChromeMocks({});
    const id = await mod.getClientId();
    expect(id).toBe('uuid-mock');
    expect(setMock).toHaveBeenCalledWith({ [mod.CLIENT_ID_KEY]: 'uuid-mock' });
  });
});

describe('telemetry enabled', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('defaults to true when key missing', async () => {
    const mod: any = await import(MODULE_PATH);
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: jest.fn((_k: any, cb: any) => cb({})),
        },
      },
    } as any;
    const result = await mod.getTelemetryEnabled();
    expect(result).toBe(true);
  });

  it('returns false when stored as false', async () => {
    const mod: any = await import(MODULE_PATH);
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: jest.fn((_k: any, cb: any) => cb({ telemetry_enabled: false })),
        },
      },
    } as any;
    const result = await mod.getTelemetryEnabled();
    expect(result).toBe(false);
  });
});

describe('trackEvent', () => {
  beforeEach(() => {
    jest.resetModules();
    (globalThis as any).crypto = { randomUUID: () => 'uuid-mock' };
  });
  let mod: any;

  function setup(enabled: boolean) {
    const fetchMock = jest.fn(() => Promise.resolve());
    (globalThis as any).fetch = fetchMock;
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: jest.fn((key: any, cb: any) => {
            const data: Record<string, unknown> = {
              [mod.CLIENT_ID_KEY]: 'uuid-mock',
            };
            if (!enabled) data.telemetry_enabled = false;
            cb(data);
          }),
          set: jest.fn(),
        },
      },
    } as any;
    return fetchMock;
  }

  it('does nothing when disabled', async () => {
    mod = await import(MODULE_PATH);
    const fetchMock = setup(false);
    await mod.trackEvent('test');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends event when enabled', async () => {
    mod = await import(MODULE_PATH);
    const fetchMock = setup(true);
    await mod.trackEvent('opened');
    expect(fetchMock).toHaveBeenCalled();
    const [url, options] = fetchMock.mock.calls[0] as any;
    expect(url).toContain('https://www.google-analytics.com/mp/collect');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(options.body);
    expect(body.client_id).toBe('uuid-mock');
    expect(body.events[0].name).toBe('opened');
  });

  it('debounces events by default', async () => {
    jest.useFakeTimers();
    mod = await import(MODULE_PATH);
    const fetchMock = setup(true);
    await mod.trackEvent('opened');
    await mod.trackEvent('opened');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('forces event when specified', async () => {
    mod = await import(MODULE_PATH);
    const fetchMock = setup(true);
    await mod.trackEvent('opened');
    await mod.trackEvent('opened', {}, { force: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('cleans up old events', async () => {
    jest.useFakeTimers();
    mod = await import(MODULE_PATH);
    const fetchMock = setup(true);
    await mod.trackEvent('old');
    expect((mod.eventTimestamps as Map<string, number>).has('old')).toBe(true);
    jest.advanceTimersByTime(300001);
    await mod.trackEvent('new');
    expect((mod.eventTimestamps as Map<string, number>).has('old')).toBe(false);
    jest.useRealTimers();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
