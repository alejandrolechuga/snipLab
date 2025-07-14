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
    let createCallback: () => void = jest.fn();
    const createMock = jest.fn(
      (
        _title: string,
        _icon: string,
        _page: string,
        cb: () => void
      ) => {
        createCallback = cb;
      }
    );
    (globalThis as any).chrome = {
      tabs: { sendMessage: jest.fn() },
      devtools: {
        inspectedWindow: { eval: evalMock },
        panels: { create: createMock },
      },
      runtime: { onMessage: { addListener: jest.fn() } },
    } as any;

    jest.isolateModules(() => {
      require('../index');
      createCallback();
    });

    const { trackEvent } = require('../../../utils/telemetry');
    expect(trackEvent).toHaveBeenCalledWith('panel_opened');
    expect(trackEvent).toHaveBeenCalledWith('panel_opened', {
      hostname: 'example.com',
    });
  });
});
