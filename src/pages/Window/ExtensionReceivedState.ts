import type { Rule } from '../../types/rule';
import { EventBus } from '../../utils/EventBus';

export interface ExtensionSettings {
  patched: boolean;
}

export interface ExtensionStateData {
  settings: ExtensionSettings;
  ruleset: Rule[];
}

export enum ExtensionStateEvents {
  STATE_UPDATED = 'STATE_UPDATED',
}

interface ExtensionStateEventMap {
  [ExtensionStateEvents.STATE_UPDATED]: ExtensionStateData;
}

export class ExtensionReceivedState extends EventBus<ExtensionStateEventMap> {
  private state: ExtensionStateData;

  constructor(initial?: Partial<ExtensionStateData>) {
    super();
    this.state = {
      settings: { patched: false },
      ruleset: [],
      ...initial,
    } as ExtensionStateData;
  }

  public getState(): ExtensionStateData {
    return this.state;
  }

  public updateState(update: Partial<ExtensionStateData>): void {
    this.state = { ...this.state, ...update };
    sessionStorage.setItem('settings', JSON.stringify(this.state.settings));
    sessionStorage.setItem('ruleset', JSON.stringify(this.state.ruleset));
    this.emit(ExtensionStateEvents.STATE_UPDATED, this.state);
  }
}
