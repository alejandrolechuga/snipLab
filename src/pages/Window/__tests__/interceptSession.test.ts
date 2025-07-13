import { ExtensionReceivedState } from '../ExtensionReceivedState';
import type { Rule } from '../../../types/rule';
import { setGlobalFetch } from '../../../utils/globalFetch';
import { initialize, loadSession, update } from '../intercept';

jest.mock('../../../utils/globalFetch', () => {
  return {
    getOriginalFetch: jest.fn(() => fetch),
    setGlobalFetch: jest.fn(),
  };
});

describe('intercept session persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
    (setGlobalFetch as jest.Mock).mockClear();
  });

  it('restores interception on reload when previously enabled', () => {
    const state = new ExtensionReceivedState();
    state.updateState({ settings: { patched: true } });
    state.updateState({
      ruleset: [
        {
          id: '1',
          urlPattern: '/persist',
          isRegExp: false,
          method: 'GET',
          enabled: true,
          date: '',
          response: null,
          statusCode: 200,
          delayMs: null,
        },
      ] as Rule[],
    });
    update(state);

    expect(sessionStorage.getItem('patched')).toBe('true');

    const stored = loadSession();
    const newState = new ExtensionReceivedState({
      settings: { patched: stored.patched },
      ruleset: stored.ruleset,
    });
    initialize(newState);

    expect((setGlobalFetch as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });
});
