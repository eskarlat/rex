import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from './event-bus.js';
import type { EventType, EventPayload } from '../types/index.js';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
    EventBus.setBridge(null);
  });

  afterEach(() => {
    EventBus.setBridge(null);
  });

  it('should call handler when event is emitted', async () => {
    const handler = vi.fn();
    bus.on('project:init', handler);
    await bus.emit('project:init', {
      type: 'project:init',
      projectName: 'test',
      projectPath: '/tmp/test',
    });
    expect(handler).toHaveBeenCalledWith({
      type: 'project:init',
      projectName: 'test',
      projectPath: '/tmp/test',
    });
  });

  it('should support multiple handlers for same event', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('project:init', handler1);
    bus.on('project:init', handler2);
    await bus.emit('project:init', {
      type: 'project:init',
      projectName: 'test',
      projectPath: '/tmp/test',
    });
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('should not call handler after off()', async () => {
    const handler = vi.fn();
    bus.on('project:init', handler);
    bus.off('project:init', handler);
    await bus.emit('project:init', {
      type: 'project:init',
      projectName: 'test',
      projectPath: '/tmp/test',
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should not throw when emitting event with no handlers', async () => {
    await expect(
      bus.emit('project:destroy', {
        type: 'project:destroy',
        projectPath: '/tmp/test',
      }),
    ).resolves.toBeUndefined();
  });

  it('should not propagate handler errors but log them', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorHandler = vi.fn().mockRejectedValue(new Error('handler fail'));
    const goodHandler = vi.fn();
    bus.on('project:init', errorHandler);
    bus.on('project:init', goodHandler);
    await expect(
      bus.emit('project:init', {
        type: 'project:init',
        projectName: 'test',
        projectPath: '/tmp/test',
      }),
    ).resolves.toBeUndefined();
    expect(goodHandler).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('project:init'),
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('should handle async handlers', async () => {
    const order: number[] = [];
    bus.on('ext:activate', async () => {
      await new Promise((r) => setTimeout(r, 10));
      order.push(1);
    });
    bus.on('ext:activate', async () => {
      order.push(2);
    });
    await bus.emit('ext:activate', {
      type: 'ext:activate',
      extensionName: 'ext-a',
      version: '1.0.0',
      projectPath: '/tmp/test',
    });
    expect(order).toContain(1);
    expect(order).toContain(2);
  });

  it('off should be safe to call with unregistered handler', () => {
    const handler = vi.fn();
    expect(() => bus.off('project:init', handler)).not.toThrow();
  });

  it('should isolate events by type', async () => {
    const initHandler = vi.fn();
    const destroyHandler = vi.fn();
    bus.on('project:init', initHandler);
    bus.on('project:destroy', destroyHandler);
    await bus.emit('project:init', {
      type: 'project:init',
      projectName: 'test',
      projectPath: '/tmp/test',
    });
    expect(initHandler).toHaveBeenCalled();
    expect(destroyHandler).not.toHaveBeenCalled();
  });

  describe('setBridge', () => {
    it('should call bridge function on emit', async () => {
      const bridge = vi.fn();
      EventBus.setBridge(bridge);

      await bus.emit('project:init', {
        type: 'project:init',
        projectName: 'test',
        projectPath: '/tmp/test',
      });

      expect(bridge).toHaveBeenCalledWith('project:init', {
        type: 'project:init',
        projectName: 'test',
        projectPath: '/tmp/test',
      });
    });

    it('should not call bridge after setBridge(null)', async () => {
      const bridge = vi.fn();
      EventBus.setBridge(bridge);
      EventBus.setBridge(null);

      await bus.emit('project:init', {
        type: 'project:init',
        projectName: 'test',
        projectPath: '/tmp/test',
      });

      expect(bridge).not.toHaveBeenCalled();
    });

    it('should not affect local handlers when bridge throws', async () => {
      const bridge = vi.fn().mockImplementation(() => {
        throw new Error('bridge error');
      });
      const handler = vi.fn();
      EventBus.setBridge(bridge);
      bus.on('project:init', handler);

      await bus.emit('project:init', {
        type: 'project:init',
        projectName: 'test',
        projectPath: '/tmp/test',
      });

      expect(handler).toHaveBeenCalled();
    });
  });
});
