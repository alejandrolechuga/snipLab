chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === 'RUN_SCRIPT' && message.script?.code) {
      const targetTabId =
        message.tabId !== undefined ? message.tabId : sender.tab?.id;
      if (targetTabId !== undefined && chrome.scripting) {
        chrome.scripting.executeScript({
          target: { tabId: targetTabId },
          world: 'ISOLATED',
          func: (code: string) => {
            // eslint-disable-next-line no-eval
            eval(code);
          },
          args: [message.script.code],
        });
      } else {
        console.warn('[Background] Could not determine tabId for RUN_SCRIPT');
      }
    } else if (message.action === 'GET_CURRENT_TAB_ID') {
      if (sender.tab && sender.tab.id !== undefined) {
        sendResponse({ tabId: sender.tab.id });
      } else {
        sendResponse({ tabId: undefined });
      }
      return true;
    }
    return undefined;
  }
);
