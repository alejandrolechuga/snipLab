import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import settingsReducer, { setPatched } from './settingsSlice';
import scriptsReducer, { setScripts } from './scriptSlice';
import matchesReducer, { incrementMatch } from './matchSlice';
import featuresReducer from './featureSlice';
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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

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
  const { settings, scripts } = state;

  if (previousSettings !== settings || previousScripts !== scripts) {
    previousSettings = settings;
    previousScripts = scripts;

    safeSetStorageLocal({ settings, scripts });

    const inspectedWindow = safeDevtoolsInspectedWindow();
    if (chrome.tabs && inspectedWindow) {
      safeSendMessage(inspectedWindow.tabId, {
        action: ExtensionMessageType.STATE_UPDATE,
        from: ExtensionMessageOrigin.DEVTOOLS,
        state,
      });
    } else {
      console.log('chrome devtools not available, skipping state broadcast');
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

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.payload?.action === ExtensionMessageType.RULE_MATCHED) {
      store.dispatch(incrementMatch(message.payload.ruleId));
    }
  });
}
