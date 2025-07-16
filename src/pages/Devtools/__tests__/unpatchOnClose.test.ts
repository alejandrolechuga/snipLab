import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../../types/runtimeMessage';
import { trackEvent } from '../../../utils/telemetry';

jest.mock('../../../utils/telemetry', () => ({
  trackEvent: jest.fn(),
}));

declare const require: any;

describe('Devtools unload behavior', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('sends state update when window is closing', () => {
    const sendMessageMock = jest.fn();
    const portMock = {
      onMessage: { addListener: jest.fn() },
      postMessage: jest.fn(),
      onDisconnect: { addListener: jest.fn() },
    } as any;
    (globalThis as any).chrome = {
      tabs: { sendMessage: sendMessageMock },
      devtools: {
        inspectedWindow: { tabId: 1 },
        panels: { create: jest.fn() },
      },
      runtime: {
        onMessage: { addListener: jest.fn() },
        connect: jest.fn(() => portMock),
      },
    };

    jest.isolateModules(() => {
      require('../index');
    });

    window.dispatchEvent(new Event('beforeunload'));

    expect(sendMessageMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        action: ExtensionMessageType.STATE_UPDATE,
        from: ExtensionMessageOrigin.DEVTOOLS,
        state: {
          settings: { patched: false },
          items: [],
        },
      }),
      expect.anything()
    );
  });
});
