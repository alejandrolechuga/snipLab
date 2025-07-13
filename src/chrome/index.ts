// Wrapper for Chrome API functions to prevent errors if not available

export function safeSendMessage(tabId: number, message: any) {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[chromeApi] Error sending message', {
            tabId,
            message,
            error: chrome.runtime.lastError.message,
          });
        }
      });
    } catch (error) {
      console.error('[chromeApi] failed to send message', {
        tabId,
        message,
        error,
      });
    }
  } else {
    console.error('[chromeApi] chrome.tabs.sendMessage is not available', {
      tabId,
      message,
    });
  }
}

export function safeGetStorageLocal(
  keys?: string[] | string | null
): Promise<any> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.get) {
      chrome.storage.local.get(keys ?? null, (result) => {
        resolve(result);
      });
    } else {
      console.error('[chromeApi] chrome.storage.local.get is not available', {
        keys,
      });
      resolve({});
    }
  });
}

export function safeSetStorageLocal(items: object) {
  if (typeof chrome !== 'undefined' && chrome.storage?.local?.set) {
    chrome.storage.local.set(items);
  } else {
    console.error('[chromeApi] chrome.storage.local.set is not available', {
      items,
    });
  }
}

export function safeDevtoolsInspectedWindow() {
  if (typeof chrome !== 'undefined' && chrome.devtools?.inspectedWindow) {
    return chrome.devtools.inspectedWindow;
  } else {
    console.error(
      '[chromeApi] chrome.devtools.inspectedWindow is not available'
    );
    return undefined;
  }
}
