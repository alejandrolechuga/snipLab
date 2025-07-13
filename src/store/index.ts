import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import settingsReducer, { setPatched } from './settingsSlice';
import scriptsReducer, { setScripts } from './scriptSlice';
import matchesReducer, { incrementMatch } from './matchSlice';
import featuresReducer from './featureSlice';
import devtoolsReducer, {
  setDevtoolsPanelReady,
  setContentScriptReady,
} from './devtoolsSlice';
import {
  ExtensionMessageType,
  ExtensionMessageOrigin,
} from '../types/runtimeMessage';
import {
  safeGetStorageLocal,
  safeSetStorageLocal,
  safeSendMessage,
  safeDevtoolsInspectedWindow,
} from '../chrome';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    scripts: scriptsReducer,
    matches: matchesReducer,
    features: featuresReducer,
    devtools: devtoolsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { setDevtoolsPanelReady, setContentScriptReady };

// When running as a Chrome extension, load persisted settings and scripts from
// chrome.storage.local so the store reflects the last saved state.
safeGetStorageLocal(['settings', 'scripts']).then(({ settings, scripts }) => {
  if (settings) {
    store.dispatch(setPatched(settings.patched));
  }
  if (scripts) {
    store.dispatch(setScripts(scripts));
  }
});

let previousSettings = store.getState().settings;
let previousScripts = store.getState().scripts;

// Persist updates to chrome.storage.local whenever settings or scripts change.
// `previousSettings` and `previousRuleset` track the last values written so
// we always write the latest state after each dispatch.
store.subscribe(() => {
  const state = store.getState();
  const { settings, scripts, devtools } = state;

  if (previousSettings !== settings || previousScripts !== scripts) {
    previousSettings = settings;
    previousScripts = scripts;

    safeSetStorageLocal({ settings, scripts });

    const inspectedWindow = safeDevtoolsInspectedWindow();
    const devtoolsPanelIsReady = devtools.isReady;
    const contentScriptIsReady = devtools.contentScriptReady;
    if (devtoolsPanelIsReady && contentScriptIsReady && chrome.tabs && inspectedWindow) {
      safeSendMessage(inspectedWindow.tabId, {
        action: ExtensionMessageType.STATE_UPDATE,
        from: ExtensionMessageOrigin.DEVTOOLS,
        state,
      });
    }
  }
});

export const emitExtensionState = async () => {
  console.log('Emitting initial state to devtools panel');
  const { scripts, settings } = await safeGetStorageLocal([
    'scripts',
    'settings',
  ]);
  const inspectedWindow = safeDevtoolsInspectedWindow();
  const { devtools } = store.getState();
  const devtoolsPanelIsReady = devtools.isReady;
  const contentScriptIsReady = devtools.contentScriptReady;
  if (devtoolsPanelIsReady && contentScriptIsReady && chrome.tabs && inspectedWindow) {
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
  }
};

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.payload?.action === ExtensionMessageType.RULE_MATCHED) {
      store.dispatch(incrementMatch(message.payload.ruleId));
    }
    if (message.payload?.action === ExtensionMessageType.RECEIVER_READY) {
      store.dispatch(setContentScriptReady(true));
      emitExtensionState();
    }
  });
}
