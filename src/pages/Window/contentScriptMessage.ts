import { ExtensionMessageOrigin } from '../../types/runtimeMessage';
import { ExtensionStateData } from './ExtensionReceivedState';

export interface PostMessagePayload extends Record<string, any> {
  action: string;
}

export const postMessage = <T extends PostMessagePayload>(payload: T) => {
  const message = {
    from: ExtensionMessageOrigin.RECEIVER,
    ...payload,
  };
  try {
    window.postMessage(message, '*');
  } catch (error) {
    console.log('Error posting message:', error);
  }
};

export const listenContentScriptMessages = (
  callback: (data: {
    action: string;
    state: Partial<ExtensionStateData>;
  }) => void
) => {
  window.addEventListener('message', function (event) {
    // Filter out any messages not sent by our extension code
    if (event.source !== window || !event.data) return;

    // Process messages coming from the injected script
    if (event.data.from === ExtensionMessageOrigin.DEVTOOLS) {
      callback(event.data);
    }
  });
};
