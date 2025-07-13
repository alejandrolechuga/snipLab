import { EventBus } from '../EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;
  type AppEvents = {
    update: { url: string }[];
    running: undefined;
    customEvent: string;
  };

  beforeEach(() => {
    eventBus = new EventBus<AppEvents>();
  });

  describe('constructor', () => {
    it('should initialize with an empty map of listeners', () => {
      expect((eventBus as any).listeners.size).toBe(0);
    });
  });

  describe('on', () => {
    it('should register an event listener for a specific event', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      expect((eventBus as any).listeners.get('update')?.size).toBe(1);
    });
    it('should register multiple event listeners for the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventBus.on('update', callback1);
      eventBus.on('update', callback2);
      expect((eventBus as any).listeners.get('update')?.size).toBe(2);
    });
    it('should not add the same callback twice for the same event', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      eventBus.on('update', callback);
      expect((eventBus as any).listeners.get('update')?.size).toBe(1);
    });
  });
  describe('off', () => {
    it('should unregister an event listener for a specific event', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      eventBus.off('update', callback);
      expect((eventBus as any).listeners.has('update')).toBe(false);
    });
    it('should remove the event from listteners if  the last listener is removed', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      eventBus.off('update', callback);
      expect((eventBus as any).listeners.has('update')).toBe(false);
    });
    it('should not throw an error if the event does not exist', () => {
      const callback1 = jest.fn();
      const nonExistentCallback = jest.fn();
      eventBus.on('customEvent', callback1);

      expect(() =>
        eventBus.off('customEvent', nonExistentCallback)
      ).not.toThrow();
    });
  });
  describe('emit', () => {
    it('should call the registered callbacks with the provided data', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      const data = { url: 'http://example.com' };
      eventBus.emit('update', data);
      expect(callback).toHaveBeenCalledWith(data);
    });
    it('should not call callbacks for events that are not emitted', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      eventBus.emit('running', undefined);
      expect(callback).not.toHaveBeenCalled();
    });
    it('should handle multiple listeners for the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventBus.on('update', callback1);
      eventBus.on('update', callback2);
      const data = { url: 'http://example.com' };
      eventBus.emit('update', data);
      expect(callback1).toHaveBeenCalledWith(data);
      expect(callback2).toHaveBeenCalledWith(data);
    });
    it('should not throw an error if no listeners are registered for the event', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      expect(() => eventBus.emit('customEvent', 'test')).not.toThrow();
    });
  });
  describe('removeAllListeners', () => {
    it('should remove all listeners for a specific event', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      eventBus.removeAllListeners('update');
      expect((eventBus as any).listeners.has('update')).toBe(false);
    });
    it('should remove all listeners if no event name is provided', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventBus.on('update', callback1);
      eventBus.on('running', callback2);
      eventBus.removeAllListeners();
      expect((eventBus as any).listeners.size).toBe(0);
    });
    it('should not throw an error if the event does not exist', () => {
      const callback = jest.fn();
      eventBus.on('update', callback);
      expect(() =>
        eventBus.removeAllListeners('nonExistentEvent')
      ).not.toThrow();
    });
  });
});
