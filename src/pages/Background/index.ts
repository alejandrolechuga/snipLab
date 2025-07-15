import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../../src/types/runtimeMessage';

const devtoolsPorts: Record<number, chrome.runtime.Port> = {};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'devtools-page') {
    let tabId: number | null = null;
    port.onMessage.addListener((message) => {
      if (typeof message.tabId === 'number') {
        const id = message.tabId as number;
        tabId = id;
        devtoolsPorts[id] = port;
      }
    });
    port.onDisconnect.addListener(() => {
      if (tabId !== null) {
        delete devtoolsPorts[tabId];
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'RUN_SCRIPT' && message.script?.code) {
    const tabId = typeof message.tabId === 'number' ? message.tabId : undefined;
    if (tabId !== undefined) {
      const port = devtoolsPorts[tabId];
      if (port) {
        port.postMessage({
          action: ExtensionMessageType.RUN_SCRIPT,
          from: ExtensionMessageOrigin.BACKGROUND,
          script: message.script,
        });
      } else {
        console.error('[SnipLab Background] No devtools connection for tab', tabId);
      }
    }
  }
});
