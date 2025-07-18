jest.mock('../../../utils/telemetry', () => ({
  trackEvent: jest.fn(),
}));

declare const require: any;

describe('Devtools panel open telemetry', () => {
  beforeEach(() => {
    jest.resetModules();
    const { trackEvent } = require('../../../utils/telemetry');
    (trackEvent as jest.Mock).mockClear();
  });

  it('fires panel_opened events with hostname', () => {
    const evalMock = jest.fn((_expr: string, cb: (val: any) => void) =>
      cb('example.com')
    );
    const portMock = {
      onMessage: { addListener: jest.fn() },
      postMessage: jest.fn(),
      onDisconnect: { addListener: jest.fn() },
    } as any;
    (globalThis as any).chrome = {
      tabs: { sendMessage: jest.fn() },
      devtools: {
        inspectedWindow: { eval: evalMock, tabId: 1 },
        panels: { create: jest.fn() },
      },
      runtime: {
        onMessage: { addListener: jest.fn() },
        connect: jest.fn(() => portMock),
      },
    } as any;

    jest.isolateModules(() => {
      require('../index');
    });

    const { trackEvent } = require('../../../utils/telemetry');
    expect(trackEvent).toHaveBeenCalledWith('panel_opened');
    expect(trackEvent).toHaveBeenCalledWith('panel_opened', {
      hostname: 'example.com',
    });
  });
});
