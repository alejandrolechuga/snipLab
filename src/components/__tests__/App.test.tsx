import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../pages/Panel/App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rulesetReducer from '../../Panel/ruleset/rulesetSlice';
import settingsReducer from '../../store/settingsSlice';
import matchesReducer from '../../store/matchSlice';
import featuresReducer from '../../store/featureSlice';
import type { Rule } from '../../types/rule';
import { trackEvent } from '../../utils/telemetry';
import mockData from '../../__mocks__/rules.json';

jest.mock('../../utils/telemetry', () => ({
  trackEvent: jest.fn(),
}));

const manyRules: Rule[] = [
  ...mockData,
  ...Array.from({ length: 7 }, (_, i) => ({
    ...mockData[0],
    id: `extra-${i}`,
  })),
];

const createStore = (rules: Rule[] = mockData) =>
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

describe('<App />', () => {
  it('renders the app container', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });

  it('filters rules based on url', () => {
    jest.useFakeTimers();
    const store = createStore(manyRules);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    const input = screen.getByPlaceholderText('Type out to filter list');
    fireEvent.change(input, { target: { value: 'static' } });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // header + 1 filtered row
    expect(
      screen.getByText('https://static.example.com/*')
    ).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('clears the filter and shows all rules', () => {
    const store = createStore(manyRules);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    const input = screen.getByPlaceholderText('Type out to filter list');
    fireEvent.change(input, { target: { value: 'static' } });

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(manyRules.length + 1);
  });

  it('toggles interception button', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    const button = screen.getByRole('button', { name: 'Enable Interception' });
    fireEvent.click(button);
    expect(
      screen.getByRole('button', { name: 'Interception Enabled' })
    ).toBeInTheDocument();
  });

  it('tracks view events', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(trackEvent).toHaveBeenCalledWith('main_view', {
      rule_count: store.getState().ruleset.length,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add Rule' }));

    expect(trackEvent).toHaveBeenCalledWith('rule_form_opened', {
      mode: 'add',
    });
  });

  it('hides the report bug button when a form is visible', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // report button visible in list view
    expect(
      screen.getByRole('button', { name: /report a bug/i })
    ).toBeInTheDocument();

    // open add form
    fireEvent.click(screen.getByRole('button', { name: 'Add Rule' }));
    expect(
      screen.queryByRole('button', { name: /report a bug/i })
    ).not.toBeInTheDocument();

    // return to list and open edit form
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    expect(
      screen.queryByRole('button', { name: /report a bug/i })
    ).not.toBeInTheDocument();
  });
});
