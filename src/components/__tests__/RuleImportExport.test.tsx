import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RuleImportExport from '../RuleImportExport';
import RuleForm from '../RuleForm';
import rulesetReducer from '../../Panel/ruleset/rulesetSlice';
import settingsReducer from '../../store/settingsSlice';
import matchesReducer from '../../store/matchSlice';
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
    },
    preloadedState: {
      settings: { patched: false },
      ruleset: rules,
      matches: {},
    },
  });

describe('<RuleImportExport />', () => {
  it('exports rules using URL.createObjectURL', () => {
    const rules: Rule[] = [
      {
        id: '1',
        urlPattern: '/api',
        isRegExp: false,
        method: 'GET',
        enabled: true,
        statusCode: 200,
        date: '2024-01-01',
        response: null,
      },
    ];
    const store = createStore(rules);
    const createObjectURL = jest.fn().mockReturnValue('blob:url');
    (URL as any).createObjectURL = createObjectURL;
    (URL as any).revokeObjectURL = jest.fn();
    render(
      <Provider store={store}>
        <RuleImportExport rules={rules} />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Export Rules' }));
    expect(createObjectURL).toHaveBeenCalled();
  });

  it('imports rules from a JSON file', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <RuleImportExport rules={[]} />
      </Provider>
    );
    const file = new File(
      [
        JSON.stringify([
          {
            urlPattern: '/api',
            method: 'GET',
            enabled: true,
            statusCode: 200,
          },
        ]),
      ],
      'rules.json',
      { type: 'application/json' }
    );
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const reader: any = {
      onload: null,
      result: '',
      readAsText() {
        reader.result = JSON.stringify([
          { urlPattern: '/api', method: 'GET', enabled: true, statusCode: 200 },
        ]);
        if (reader.onload) {
          reader.onload({} as ProgressEvent<FileReader>);
        }
      },
    };
    jest.spyOn(window as any, 'FileReader').mockImplementation(() => reader);
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(store.getState().ruleset).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Rules imported successfully'
    );
  });

  it('confirms before overwriting existing rules', () => {
    const initial: Rule[] = [
      {
        id: '1',
        urlPattern: '/api',
        isRegExp: false,
        method: 'GET',
        enabled: true,
        statusCode: 200,
        date: '2024-01-01',
        response: null,
      },
    ];
    const store = createStore(initial);
    render(
      <Provider store={store}>
        <RuleImportExport rules={initial} />
      </Provider>
    );
    const file = new File(
      [
        JSON.stringify([
          {
            urlPattern: '/other',
            method: 'POST',
            enabled: true,
            statusCode: 201,
          },
        ]),
      ],
      'rules.json',
      { type: 'application/json' }
    );
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const reader: any = {
      onload: null,
      result: '',
      readAsText() {
        reader.result = JSON.stringify([
          {
            urlPattern: '/other',
            method: 'POST',
            enabled: true,
            statusCode: 201,
          },
        ]);
        if (reader.onload) {
          reader.onload({} as ProgressEvent<FileReader>);
        }
      },
    };
    jest.spyOn(window as any, 'FileReader').mockImplementation(() => reader);
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(
      screen.getByText('Overwrite existing rules with imported ones?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(store.getState().ruleset).toHaveLength(2);
    expect(store.getState().ruleset[1].urlPattern).toBe('/other');
  });

  it('exports and reimports requestBody values', async () => {
    const rules: Rule[] = [
      {
        id: '1',
        urlPattern: '/api/test',
        isRegExp: false,
        method: 'POST',
        enabled: true,
        statusCode: 200,
        date: '2024-01-01',
        response: 'OK',
        requestBody: '{"x":1}',
      },
    ];
    const storeExport = createStore(rules);
    let captured = '';
    const originalBlob = globalThis.Blob;
    const FakeBlob = jest.fn().mockImplementation((parts: any[]) => {
      captured = parts[0];
      return {};
    });
    (globalThis as any).Blob = FakeBlob;
    (URL as any).createObjectURL = jest.fn(() => 'blob:url');
    (URL as any).revokeObjectURL = jest.fn();
    render(
      <Provider store={storeExport}>
        <RuleImportExport rules={rules} />
      </Provider>
    );
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = jest.fn();
    fireEvent.click(screen.getByRole('button', { name: 'Export Rules' }));
    HTMLAnchorElement.prototype.click = origClick;
    const exported = JSON.parse(captured);
    expect(exported[0].requestBody).toBe('{"x":1}');
    (globalThis as any).Blob = originalBlob;

    cleanup();

    const storeImport = createStore();
    render(
      <Provider store={storeImport}>
        <RuleImportExport rules={[]} />
      </Provider>
    );
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const reader: any = {
      onload: null,
      result: '',
      readAsText() {
        reader.result = captured;
        if (reader.onload) reader.onload({} as ProgressEvent<FileReader>);
      },
    };
    jest.spyOn(window as any, 'FileReader').mockImplementation(() => reader);
    const file = new File([captured], 'rules.json', {
      type: 'application/json',
    });
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    expect(storeImport.getState().ruleset).toHaveLength(1);
    expect(storeImport.getState().ruleset[0].requestBody).toBe('{"x":1}');
    render(
      <Provider store={storeImport}>
        <RuleForm
          mode="edit"
          ruleId={storeImport.getState().ruleset[0].id}
          onBack={jest.fn()}
        />
      </Provider>
    );
    const textarea = (await screen.findByLabelText(
      /override request body/i
    )) as HTMLTextAreaElement;
    await new Promise((r) => setTimeout(r, 0));
    expect(textarea).toBeInTheDocument();
  });
});
