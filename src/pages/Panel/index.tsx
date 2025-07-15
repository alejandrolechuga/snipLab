import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import Panel from './Panel';
import { store } from '../../store';
import './index.css';
import '../../styles/globals.css';
import { safeDevtoolsInspectedWindow } from '../../chrome';

const container = document.getElementById('app-container');
if (container) {
  const root = createRoot(container);
  const inspectedWindow = safeDevtoolsInspectedWindow();
  const inspectedTabId = inspectedWindow?.tabId;

  if (inspectedTabId !== undefined) {
    root.render(
      <Provider store={store}>
        <Panel inspectedTabId={inspectedTabId} />
      </Provider>
    );
  } else {
    console.error('Inspected window tabId not found, cannot render panel.');
  }
} else {
  console.error('App container not found');
}
