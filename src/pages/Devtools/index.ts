import {
  emitExtensionState,
  store,
  setDevtoolsPanelReady,
  setContentScriptReady,
} from '../../store';
import { trackEvent } from '../../utils/telemetry';
import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../types/runtimeMessage';
import {
  safeDevtoolsInspectedWindow,
  safeSendMessage,
} from '../../chrome';

trackEvent('panel_opened');

if (chrome.devtools?.panels) {
  chrome.devtools.panels.create(
    'SnipLab',
    'icon-34.png',
    'panel.html',
    () => {
      console.log('SnipLab panel created');
      store.dispatch(setDevtoolsPanelReady(true));
      chrome.devtools?.inspectedWindow?.eval?.('location.hostname', (hostname) => {
        if (typeof hostname === 'string') {
          trackEvent('panel_opened', { hostname });
        }
      });
    }
  );
} else {
  console.error('DevTools panels API is not available');
}


window.addEventListener('beforeunload', () => {
  store.dispatch(setDevtoolsPanelReady(false));
  store.dispatch(setContentScriptReady(false));
  const inspectedWindow = safeDevtoolsInspectedWindow();
  if (chrome.tabs && inspectedWindow) {
    safeSendMessage(inspectedWindow.tabId, {
      action: ExtensionMessageType.STATE_UPDATE,
      from: ExtensionMessageOrigin.DEVTOOLS,
      state: {
        settings: { patched: false },
        scripts: [],
      },
    });
  }
});
