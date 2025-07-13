import { applyXhrRule } from '../intercept';
import type { Rule } from '../../../types/rule';

describe('applyXhrRule', () => {
  it('matches substring when isRegExp is false', () => {
    const rule: Rule = {
      id: '1',
      urlPattern: '/api',
      isRegExp: false,
      method: 'GET',
      enabled: true,
      statusCode: 200,
      date: '',
      response: 'override',
      delayMs: null,
    };
    const result = applyXhrRule(
      { requestUrl: '/v1/api/test', requestMethod: 'GET' },
      rule,
      'orig'
    );
    expect(result).toBe('override');
  });

  it('matches using RegExp when isRegExp is true', () => {
    const rule: Rule = {
      id: '1',
      urlPattern: '^/items/\\d+$',
      isRegExp: true,
      method: 'GET',
      enabled: true,
      statusCode: 200,
      date: '',
      response: null,
      delayMs: null,
    };
    const result = applyXhrRule(
      { requestUrl: '/items/42', requestMethod: 'GET' },
      rule,
      'orig'
    );
    expect(result).toBe('orig');
  });

  it('returns undefined when RegExp is invalid', () => {
    const rule: Rule = {
      id: '1',
      urlPattern: '(',
      isRegExp: true,
      method: 'GET',
      enabled: true,
      statusCode: 200,
      date: '',
      response: null,
      delayMs: null,
    };
    const result = applyXhrRule(
      { requestUrl: '/test', requestMethod: 'GET' },
      rule,
      'orig'
    );
    expect(result).toBeUndefined();
  });
});
