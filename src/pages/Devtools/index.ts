import { emitExtensionState } from '../../../src/store';
import { trackEvent } from '../../../src/utils/telemetry';
import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../../src/types/runtimeMessage';
import {
  safeDevtoolsInspectedWindow,
  safeSendMessage,
} from '../../../src/chrome';

let backgroundPageConnection: chrome.runtime.Port | null = null;

if (chrome.runtime?.connect) {
  backgroundPageConnection = chrome.runtime.connect({ name: 'devtools-page' });
  const inspectedWindow = safeDevtoolsInspectedWindow();
  if (backgroundPageConnection && inspectedWindow) {
    backgroundPageConnection.postMessage({ tabId: inspectedWindow.tabId });
  }
  backgroundPageConnection.onDisconnect.addListener(() => {
    backgroundPageConnection = null;
  });
  backgroundPageConnection.onMessage.addListener((message) => {
    if (message.action === ExtensionMessageType.RUN_SCRIPT) {
      const iw = safeDevtoolsInspectedWindow();
      if (iw) {
        iw.eval(message.script.code, (result, isException) => {
          if (isException) {
            console.error('[SnipLab Devtools] Script execution error:', isException);
          } else {
            console.log('[SnipLab Devtools] Script executed successfully:', result);
          }
        });
      } else {
        console.error('[SnipLab Devtools] Inspected window not available to run script.');
      }
    }
  });
}

trackEvent('panel_opened');
if (typeof chrome !== 'undefined') {
  chrome.devtools?.inspectedWindow?.eval?.('location.hostname', (hostname) => {
    if (typeof hostname === 'string') {
      trackEvent('panel_opened', { hostname });
    }
  });
}

if (chrome.devtools?.panels) {
  chrome.devtools.panels.create(
    'SnipLab',
    'icon-34.png',
    'panel.html',
    () => {
      console.log('SnipLab panel created');
    }
  );
} else {
  console.error('DevTools panels API is not available');
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.source === ExtensionMessageOrigin.CONTENT_SCRIPT) {
    if (message.payload.action === ExtensionMessageType.RECEIVER_READY) {
      emitExtensionState();
    }
  }
});

window.addEventListener('beforeunload', () => {
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
