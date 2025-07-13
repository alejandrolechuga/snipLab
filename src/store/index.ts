import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import settingsReducer, { setPatched } from './settingsSlice';
import rulesetReducer, { setRules } from '../Panel/ruleset/rulesetSlice';
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
    ruleset: rulesetReducer,
    matches: matchesReducer,
    features: featuresReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// When running as a Chrome extension, load persisted settings and rules from
// chrome.storage.local so the store reflects the last saved state.
safeGetStorageLocal(['settings', 'ruleset']).then(({ settings, ruleset }) => {
  if (settings) {
    store.dispatch(setPatched(settings.patched));
  }
  if (ruleset) {
    store.dispatch(setRules(ruleset));
  }
});

let previousSettings = store.getState().settings;
let previousRuleset = store.getState().ruleset;

// Persist updates to chrome.storage.local whenever settings or rules change.
// `previousSettings` and `previousRuleset` track the last values written so
// we always write the latest state after each dispatch.
store.subscribe(() => {
  const state = store.getState();
  const { settings, ruleset } = state;

  if (previousSettings !== settings || previousRuleset !== ruleset) {
    previousSettings = settings;
    previousRuleset = ruleset;

    safeSetStorageLocal({ settings, ruleset });

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
  const { ruleset, settings } = await safeGetStorageLocal([
    'ruleset',
    'settings',
  ]);
  const inspectedWindow = safeDevtoolsInspectedWindow();
  if (chrome.tabs && inspectedWindow) {
    safeSendMessage(inspectedWindow.tabId, {
      action: ExtensionMessageType.STATE_UPDATE,
      from: ExtensionMessageOrigin.DEVTOOLS,
      state: {
        ruleset: ruleset ?? [],
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
