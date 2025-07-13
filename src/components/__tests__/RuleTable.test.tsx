// src/components/__tests__/RuleTable.test.tsx
import React from 'react';

import { render, screen, fireEvent, within } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import RuleTable from '../RuleTable';
import type { Rule } from '../../types/rule';
import { COLUMN_ORDER, COLUMN_LABELS } from '../columnConfig';
import rulesetReducer from '../../Panel/ruleset/rulesetSlice';
import settingsReducer from '../../store/settingsSlice';
import matchesReducer from '../../store/matchSlice';
import mockRules from '../../__mocks__/rules.json';
import { trackEvent } from '../../utils/telemetry';

jest.mock('../../utils/telemetry', () => ({
  trackEvent: jest.fn(),
}));

describe('<RuleTable />', () => {
  const renderRuleTable = (rules: Rule[] = [], onEdit = jest.fn()) => {
    const store = configureStore({
      reducer: {
        settings: settingsReducer,
        ruleset: rulesetReducer,
        matches: matchesReducer,
      },
      preloadedState: {
        settings: { patched: false },
        ruleset: rules,
        matches: {},
      },
    });
    render(
      <Provider store={store}>
        <RuleTable onEdit={onEdit} />
      </Provider>
    );
    return store;
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('renders the component without crashing with an empty array', () => {
    renderRuleTable();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders the correct table headers', () => {
    renderRuleTable();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(COLUMN_ORDER.length);
    COLUMN_ORDER.forEach((column) => {
      expect(screen.getByText(COLUMN_LABELS[column])).toBeInTheDocument();
    });
  });

  it('renders rows from the store', () => {
    // Mock requests data
    renderRuleTable(mockRules);

    // Use screen.getAllByRole to get all table rows
    const rows = screen.getAllByRole('row');

    // Assert that the number of rows is correct (header + data rows)
    expect(rows).toHaveLength(mockRules.length + 1);

    // Iterate through the mock requests and assert that the data is rendered correctly
    mockRules.forEach((rule, index) => {
      // rows[index + 1] because the first row is the header
      const row = rows[index + 1];
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(COLUMN_ORDER.length);

      expect(row).toHaveTextContent(rule.urlPattern);
      expect(row).toHaveTextContent(rule.method);
      expect(
        within(row).getByRole('button', {
          name: rule.enabled ? 'Enabled' : 'Disabled',
        })
      ).toBeInTheDocument();

      const buttons = row.querySelectorAll('button');
      expect(buttons).toHaveLength(3);
      expect(buttons[1]).toHaveTextContent('Edit');
      expect(buttons[2]).toHaveTextContent('Delete');
    });
  });

  it('header and row column counts match', () => {
    renderRuleTable(mockRules);
    const headerCells = screen.getAllByRole('columnheader');
    const dataRows = screen.getAllByRole('row').slice(1);

    dataRows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(headerCells.length);
    });
  });

  it('deletes a rule when the delete button is clicked', () => {
    const rules = mockRules.slice(0, 2);
    const store = renderRuleTable(rules);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(rules.length); // header + remaining row
    expect(screen.queryByText(rules[0].urlPattern)).not.toBeInTheDocument();
    expect(store.getState().ruleset).toHaveLength(1);
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    renderRuleTable(mockRules.slice(0, 1), onEdit);

    const editButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockRules[0].id);
  });
});
