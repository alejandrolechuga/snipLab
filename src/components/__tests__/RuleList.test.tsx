import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RuleList from '../RuleList';
import rulesetReducer from '../../Panel/ruleset/rulesetSlice';
import settingsReducer from '../../store/settingsSlice';
import matchesReducer from '../../store/matchSlice';
import featuresReducer from '../../store/featureSlice';
import type { Rule } from '../../types/rule';
import { trackEvent } from '../../utils/telemetry';

jest.mock('../../utils/telemetry', () => ({
  trackEvent: jest.fn(),
}));

const createStore = (rules: Rule[] = []) =>
  configureStore({
    reducer: {
      settings: settingsReducer,
      ruleset: rulesetReducer,
      matches: matchesReducer,
      features: featuresReducer,
    },
    preloadedState: {
      settings: { patched: false },
      ruleset: rules,
      matches: {},
      features: { enableImportExport: false },
    },
  });

const manyRules: Rule[] = Array.from({ length: 11 }, (_, i) => ({
  id: `r${i}`,
  urlPattern: `/api/${i}`,
  method: 'GET',
  enabled: true,
  statusCode: 200,
  date: '',
  response: null,
}));

describe('<RuleList />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks when filter becomes visible', () => {
    const store = createStore(manyRules);
    render(
      <Provider store={store}>
        <RuleList onEdit={jest.fn()} onAdd={jest.fn()} />
      </Provider>
    );
    expect(trackEvent).toHaveBeenCalledWith('rule_filter_visible');
  });
});
