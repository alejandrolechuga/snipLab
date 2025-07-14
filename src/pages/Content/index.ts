import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../../src/types/runtimeMessage';

declare const chrome: any;

function injectCode(code: string) {
  const blob = new Blob([`(function() { ${code} })();`], {
    type: 'text/javascript',
  });
  const url = URL.createObjectURL(blob);
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => {
    script.remove();
    URL.revokeObjectURL(url);
  };
  (document.head || document.documentElement).appendChild(script);
}

const injectMainWorldBridge = async () => {
  if (!chrome.scripting) {
    console.warn('[Content] chrome.scripting API not available.');
    return;
  }

  const response = await chrome.runtime.sendMessage({ action: 'GET_CURRENT_TAB_ID' });
  const currentTabId = response?.tabId;

  if (currentTabId === undefined) {
    console.warn('[Content] Failed to retrieve current tabId for bridge injection.');
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: currentTabId },
      world: 'MAIN',
      func: () => {
        return typeof window.__snipLabMainWorldAPI !== 'undefined';
      },
    },
    (results: any[]) => {
      const bridgeAlreadyInjected = results && results[0]?.result;
      if (!bridgeAlreadyInjected) {
        chrome.scripting.executeScript(
          {
            target: { tabId: currentTabId },
            files: ['src/content-scripts/main-world-bridge.js'],
            world: 'MAIN',
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error('[Content] Error injecting main-world bridge:', chrome.runtime.lastError.message);
            } else {
              console.log('[Content] Main-world bridge injected successfully.');
            }
          }
        );
      } else {
        console.log('[Content] Main-world bridge already present.');
      }
    }
  );
};

export const listenInjectedScript = () => {
  window.addEventListener('message', function (event) {
    // Filter out any messages not sent by our extension code
    if (
      event.source !== window ||
      !event.data ||
      event.origin !== window.location.origin
    )
      return;

    // Process messages coming from the injected script
    if (event.data.from === ExtensionMessageOrigin.RECEIVER) {
      console.log('[FORWARD-FROM-RECEIVER-TO-DEVTOOLS]', event.data);
      try {
        this.chrome.runtime.sendMessage(
          {
            source: ExtensionMessageOrigin.CONTENT_SCRIPT,
            payload: event.data,
          },
          () => {
            if (chrome.runtime.lastError) {
              console.warn(
                '[Content] Error sending message to devtools:',
                chrome.runtime.lastError
              );
            }
          }
        );
      } catch (error) {
        console.error('[Content] Failed to forward message', error);
      }
    }

    if (event.data.type === 'SNIPLAB_RESPONSE') {
      console.log('[Content] Received response from main world bridge:', event.data);
      chrome.runtime.sendMessage({
        source: ExtensionMessageOrigin.CONTENT_SCRIPT,
        payload: { action: 'BRIDGE_RESPONSE', data: event.data },
      });
    } else if (event.data.source === 'injected-script-error') {
      console.error(
        '[Content] Error caught from injected script:',
        event.data.error,
        event.data.stack
      );
      chrome.runtime.sendMessage({
        action: ExtensionMessageType.INJECTED_SCRIPT_ERROR,
        from: ExtensionMessageOrigin.CONTENT_SCRIPT,
        error: event.data.error,
        stack: event.data.stack,
      });
    }
  });
};

export function listenPanelMessages() {
  if (
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.onMessage
  ) {
    chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
      console.log('[Content] Received runtime message:', message, sender);
      if (message.from === ExtensionMessageOrigin.BACKGROUND && message.action === ExtensionMessageType.RUN_SCRIPT && message.script?.code) {
        injectCode(message.script.code);
        sendResponse({ status: 'script_injected', scriptId: message.script.id });
      } else if (message.from === ExtensionMessageOrigin.DEVTOOLS) {
        if (message.payload?.action === 'CALL_MAIN_WORLD_API') {
          chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            world: 'MAIN',
            func: (bridgeAction: string, bridgeArgs: any[]) => {
              if (window.__snipLabMainWorldAPI && window.__snipLabMainWorldAPI[bridgeAction]) {
                window.__snipLabMainWorldAPI[bridgeAction](...bridgeArgs);
              }
            },
            args: [message.payload.bridgeAction, message.payload.bridgeArgs],
          });
        } else {
          window.postMessage(message, '*');
        }
      }
    });
  } else {
    console.warn('[Content] chrome.runtime.onMessage is not available');
  }
}
injectMainWorldBridge();
listenInjectedScript();
listenPanelMessages();
