chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'RUN_SCRIPT' && message.script?.code) {
    const tabId =
      message.tabId !== undefined ? message.tabId : sender.tab?.id;
    if (tabId !== undefined && chrome.scripting) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: (code: string) => {
          // eslint-disable-next-line no-eval
          eval(code);
        },
        args: [message.script.code],
        world: 'MAIN',
      });
    }
  }
});
