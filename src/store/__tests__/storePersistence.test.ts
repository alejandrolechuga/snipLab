import { setPatched } from '../settingsSlice';
import { addScript } from '../scriptSlice';

describe('store persistence', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  function createChromeMocks(initial: any) {
    const setMock = jest.fn();
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: jest.fn((_keys: string[], cb: (items: any) => void) =>
            cb(initial)
          ),
          set: setMock,
        },
      },
      tabs: {
        sendMessage: jest.fn(),
      },
      devtools: {
        inspectedWindow: { tabId: 1 },
      },
    };
    return { setMock };
  }

  it('loads persisted data on init', async () => {
    const stored = {
      settings: { patched: true },
      scripts: [
        {
          id: '1',
          name: 'test',
          description: '',
          code: 'console.log(1);',
        },
      ],
    };
    createChromeMocks(stored);
    const { store } = await import('../index');
    expect(store.getState().settings.patched).toBe(true);
    expect(store.getState().scripts).toEqual(stored.scripts);
  });

  it('persists updates to chrome.storage.local', async () => {
    const stored = { settings: { patched: false }, scripts: [] };
    const { setMock } = createChromeMocks(stored);
    const { store } = await import('../index');

    store.dispatch(setPatched(true));
    expect(setMock).toHaveBeenLastCalledWith({
      settings: { patched: true },
      scripts: [],
    });

    store.dispatch(
      addScript({
        name: 'demo',
        description: '',
        code: 'console.log(1);',
      })
    );
    expect(setMock).toHaveBeenLastCalledWith({
      settings: { patched: true },
      scripts: expect.any(Array),
    });
    const lastCall = setMock.mock.calls[setMock.mock.calls.length - 1][0];
    expect(lastCall.scripts).toHaveLength(1);
  });
});
