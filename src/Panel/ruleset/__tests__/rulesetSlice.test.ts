import reducer, {
  addRule,
  removeRule,
  updateRule,
  clearRules,
  setRules,
} from '../rulesetSlice';
import type { Rule } from '../../../types/rule';

describe('rulesetSlice', () => {
  const initialState: Rule[] = [
    {
      id: '1',
      urlPattern: 'https://api.example.com/*',
      isRegExp: false,
      method: 'GET',
      enabled: true,
      statusCode: 200,
      date: '2024-01-01',
      response: null,
      delayMs: null,
    },
    {
      id: '2',
      urlPattern: 'https://static.example.com/*',
      isRegExp: false,
      method: 'POST',
      enabled: false,
      statusCode: 200,
      date: '2024-02-01',
      response: null,
      delayMs: null,
    },
  ];

  it('should add a rule', () => {
    const newRule = {
      urlPattern: 'https://new.example.com/*',
      isRegExp: false,
      method: 'PUT',
      enabled: true,
      statusCode: 200,
      date: '2024-03-01',
      response: null,
      delayMs: null,
    };
    const state = reducer(initialState, addRule(newRule));
    expect(state).toHaveLength(3);
    expect(state[2]).toMatchObject(newRule);
    expect(state[2].id).toBeDefined();
  });

  it('should remove a rule by id', () => {
    const state = reducer(initialState, removeRule('1'));
    expect(state).toHaveLength(1);
    expect(state.find((r) => r.id === '1')).toBeUndefined();
  });

  it('should update a rule by id', () => {
    const state = reducer(
      initialState,
      updateRule({ id: '1', changes: { urlPattern: 'https://changed.com' } })
    );
    expect(state[0].urlPattern).toBe('https://changed.com');
  });

  it('should toggle the enabled state of a rule', () => {
    const state = reducer(
      initialState,
      updateRule({ id: '2', changes: { enabled: true } })
    );
    const updated = state.find((r) => r.id === '2');
    expect(updated?.enabled).toBe(true);
  });

  it('should clear all rules', () => {
    const state = reducer(initialState, clearRules());
    expect(state).toEqual([]);
  });

  it('should replace all rules with setRules', () => {
    const replacement: Rule[] = [
      {
        id: '9',
        urlPattern: 'https://replace.example.com/*',
        isRegExp: false,
        method: 'GET',
        enabled: false,
        statusCode: 200,
        date: '2024-04-01',
        response: null,
        delayMs: null,
      },
    ];
    const state = reducer(initialState, setRules(replacement));
    expect(state).toEqual(replacement);
  });
});
