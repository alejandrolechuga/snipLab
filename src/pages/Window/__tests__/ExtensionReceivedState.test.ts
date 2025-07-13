import { ExtensionReceivedState } from '../ExtensionReceivedState';

describe('ExtensionReceivedState', () => {
  it('provides default state when no initial state is given', () => {
    const state = new ExtensionReceivedState();
    expect(state.getState()).toEqual({
      settings: { patched: false },
      ruleset: [],
    });
  });

  it('allows updating and retrieving the state', () => {
    const state = new ExtensionReceivedState();
    state.updateState({ settings: { patched: true } });
    expect(state.getState().settings.patched).toBe(true);

    const ruleset = [
      {
        id: '1',
        urlPattern: '/api',
        isRegExp: false,
        method: 'GET',
        enabled: true,
        date: '',
        response: null,
        statusCode: 200,
      },
    ];
    state.updateState({ ruleset });
    console.log(state.getState());
    expect(state.getState().ruleset).toEqual(ruleset);
  });

  it('merges updates with existing state', () => {
    const state = new ExtensionReceivedState({
      settings: { patched: false },
      ruleset: [],
    });
    state.updateState({ settings: { patched: true } });
    state.updateState({
      ruleset: [
        {
          id: '2',
          urlPattern: '/test',
          isRegExp: false,
          method: 'POST',
          enabled: false,
          date: '',
          response: null,
          statusCode: 200,
        },
      ],
    });
    expect(state.getState()).toEqual({
      settings: { patched: true },
      ruleset: [
        {
          id: '2',
          urlPattern: '/test',
          isRegExp: false,
          method: 'POST',
          enabled: false,
          date: '',
          response: null,
          statusCode: 200,
        },
      ],
    });
  });

  it('persists state to sessionStorage on update', () => {
    sessionStorage.clear();
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
        },
      ],
    });
    expect(sessionStorage.getItem('settings')).toBe(
      JSON.stringify({ patched: true })
    );
    const storedRules = JSON.parse(sessionStorage.getItem('ruleset') || '[]');
    expect(storedRules).toHaveLength(1);
  });
});
