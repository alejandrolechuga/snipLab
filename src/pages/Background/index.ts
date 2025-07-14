chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === 'RUN_SCRIPT' && message.script?.code) {
      const tabId =
        message.tabId !== undefined ? message.tabId : sender.tab?.id;
      if (tabId !== undefined && chrome.scripting) {
        chrome.scripting.executeScript({
          target: { tabId },
          world: 'ISOLATED',
          func: (code: string) => {
            // eslint-disable-next-line no-eval
            eval(code);
          },
          args: [message.script.code],
        });
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
