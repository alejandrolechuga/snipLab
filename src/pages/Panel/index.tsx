import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import Panel from './Panel';
import { store } from '../../store';
import './index.css';
import '../../styles/globals.css';

const container = document.getElementById('app-container');
if (container) {
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <Panel />
    </Provider>
  );
} else {
  console.error('App container not found');
}
