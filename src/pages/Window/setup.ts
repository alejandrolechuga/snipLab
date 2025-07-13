import { initialize, loadSession, update } from './intercept';
import {
  listenContentScriptMessages,
  postMessage,
} from './contentScriptMessage';
import {
  ExtensionReceivedState,
  ExtensionStateData,
  ExtensionStateEvents,
} from './ExtensionReceivedState';
import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../../types/runtimeMessage';
export const setup = () => {
  const stored = loadSession();
  const extensionStateReceiver = new ExtensionReceivedState({
    settings: { patched: stored.patched },
    ruleset: stored.ruleset,
  });
  extensionStateReceiver.on(ExtensionStateEvents.STATE_UPDATED, () => {
    update(extensionStateReceiver);
  });
  postMessage({
    action: ExtensionMessageType.RECEIVER_READY,
  });
  listenContentScriptMessages((data) => {
    console.log('[setup] listenContentScriptMessages called with:', data);
    if (data?.action === ExtensionMessageType.STATE_UPDATE) {
      extensionStateReceiver.updateState({
        settings: data.state?.settings,
        ruleset: data.state?.ruleset,
      } as Partial<ExtensionStateData>);
    }
  });
  initialize(extensionStateReceiver);
};
