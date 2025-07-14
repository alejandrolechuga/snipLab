import {
  safeDevtoolsInspectedWindow,
  safeSendMessage,
  safeGetStorageLocal,
} from '../../chrome';
import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../../src/types/runtimeMessage';

export const emitExtensionState = async () => {
  console.log('Emitting initial state to devtools panel');
  const { scripts, settings } = await safeGetStorageLocal([
    'scripts',
    'settings',
  ]);
  const inspectedWindow = safeDevtoolsInspectedWindow();
  if (chrome.tabs && inspectedWindow) {
    safeSendMessage(inspectedWindow.tabId, {
      action: ExtensionMessageType.STATE_UPDATE,
      from: ExtensionMessageOrigin.DEVTOOLS,
      state: {
        scripts: scripts ?? [],
        settings: {
          patched: settings?.patched ?? false,
        },
      },
    });
  } else {
    console.log('chrome devtools not available, skipping state broadcast');
  }
};

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    let targetTabId: number | undefined;

    if (message.tabId !== undefined) {
      targetTabId = message.tabId;
    } else if (sender.tab?.id !== undefined) {
      targetTabId = sender.tab.id;
    }

    if (
      message.action === ExtensionMessageType.RUN_SCRIPT &&
      message.script?.code
    ) {
      if (targetTabId !== undefined) {
        safeSendMessage(targetTabId, {
          action: ExtensionMessageType.RUN_SCRIPT,
          from: ExtensionMessageOrigin.BACKGROUND,
          script: message.script,
        });
        console.log(
          `[Background] Sent RUN_SCRIPT message to content script in tab ${targetTabId}`
        );
      } else {
        console.warn(
          '[Background] Script execution skipped: No target tab ID available in message or sender.'
        );
      }
    } else if (message.action === 'GET_CURRENT_TAB_ID') {
      if (sender.tab && sender.tab.id !== undefined) {
        sendResponse({ tabId: sender.tab.id });
      } else {
        sendResponse({ tabId: undefined });
      }
      return true;
    } else if (
      message.action === ExtensionMessageType.INJECTED_SCRIPT_ERROR &&
      message.from === ExtensionMessageOrigin.CONTENT_SCRIPT
    ) {
      console.error(
        '[Background] Injected script error from tab',
        sender.tab?.id,
        ':',
        message.error,
        message.stack
      );
      const inspectedWindow = safeDevtoolsInspectedWindow();
      if (inspectedWindow && inspectedWindow.tabId === sender.tab?.id) {
        safeSendMessage(inspectedWindow.tabId, {
          action: ExtensionMessageType.INJECTED_SCRIPT_ERROR,
          from: ExtensionMessageOrigin.BACKGROUND,
          error: message.error,
          stack: message.stack,
        });
      }
    }
    return undefined;
  }
);
