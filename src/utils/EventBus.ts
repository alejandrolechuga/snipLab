type EventCallback<T = any> = (data?: T) => void;
type EventListeners<T = any> = Map<string, Set<EventCallback<T>>>;

export class EventBus<
  EventDataMap extends Record<string, any> = Record<string, any>,
> {
  private listeners: EventListeners<any>;
  constructor() {
    this.listeners = new Map();
  }
  on<K extends keyof EventDataMap>(
    eventName: K,
    callback: EventCallback<EventDataMap[K]>
  ) {
    if (!this.listeners.has(eventName as string)) {
      this.listeners.set(eventName as string, new Set());
    }
    this.listeners.get(eventName as string)?.add(callback);
  }
  off<K extends keyof EventDataMap>(
    eventName: K,
    callback: EventCallback<EventDataMap[K]>
  ) {
    const eventListeners = this.listeners.get(eventName as string);
    if (eventListeners) {
      eventListeners.delete(callback as EventCallback);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName as string);
      }
    }
  }
  emit<K extends keyof EventDataMap>(eventName: K, data: EventDataMap[K]) {
    const callbacks = this.listeners.get(eventName as string);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  removeAllListeners<K extends keyof EventDataMap>(eventName?: K): void {
    if (eventName === undefined) {
      this.listeners.clear();
      return;
    }
    this.listeners.delete(eventName as string);
  }
}
