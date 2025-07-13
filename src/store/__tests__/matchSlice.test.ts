import reducer, {
  incrementMatch,
  resetMatches,
  removeMatch,
  MatchCountState,
} from '../matchSlice';

describe('matchSlice', () => {
  it('increments match count for rule id', () => {
    const state: MatchCountState = {};
    const newState = reducer(state, incrementMatch('abc'));
    expect(newState['abc']).toBe(1);
  });

  it('resets match counts', () => {
    const state: MatchCountState = { abc: 2 };
    const newState = reducer(state, resetMatches());
    expect(newState).toEqual({});
  });

  it('removes a specific match count', () => {
    const state: MatchCountState = { abc: 2, def: 1 };
    const newState = reducer(state, removeMatch('abc'));
    expect(newState).toEqual({ def: 1 });
  });
});
