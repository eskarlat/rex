import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from './command-registry.js';
import type { CommandHandler, CommandMetadata } from './command-registry.js';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  const noopHandler: CommandHandler = () => {};
  const metadata: CommandMetadata = {
    description: 'A test command',
    usage: 'test:hello',
  };

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('register', () => {
    it('should register a command with namespace', () => {
      registry.register('ext', 'hello', noopHandler, metadata);
      const cmds = registry.list();
      expect(cmds.length).toBe(1);
      expect(cmds[0]?.namespace).toBe('ext');
      expect(cmds[0]?.command).toBe('hello');
    });

    it('should register a core command with empty namespace', () => {
      registry.register('', 'init', noopHandler, metadata);
      const cmds = registry.list();
      expect(cmds[0]?.namespace).toBe('');
    });

    it('should throw on duplicate registration', () => {
      registry.register('ext', 'hello', noopHandler, metadata);
      expect(() =>
        registry.register('ext', 'hello', noopHandler, metadata),
      ).toThrow();
    });
  });

  describe('resolve', () => {
    it('should resolve namespaced command', () => {
      registry.register('ext', 'hello', noopHandler, metadata);
      const result = registry.resolve('ext:hello');
      expect(result).toBeDefined();
      expect(result?.handler).toBe(noopHandler);
      expect(result?.metadata).toEqual(metadata);
    });

    it('should resolve core command (no namespace)', () => {
      registry.register('', 'init', noopHandler, metadata);
      const result = registry.resolve('init');
      expect(result).toBeDefined();
      expect(result?.handler).toBe(noopHandler);
    });

    it('should return undefined for unregistered command', () => {
      expect(registry.resolve('nope:nope')).toBeUndefined();
    });

    it('should handle input with no colon as core command', () => {
      registry.register('', 'status', noopHandler, metadata);
      expect(registry.resolve('status')).toBeDefined();
    });
  });

  describe('list', () => {
    it('should return empty array when nothing registered', () => {
      expect(registry.list()).toEqual([]);
    });

    it('should return all registered commands with metadata', () => {
      registry.register('ext', 'a', noopHandler, { description: 'A', usage: 'ext:a' });
      registry.register('ext', 'b', noopHandler, { description: 'B', usage: 'ext:b' });
      registry.register('', 'init', noopHandler, { description: 'Init', usage: 'init' });
      const cmds = registry.list();
      expect(cmds.length).toBe(3);
    });
  });

  describe('suggest', () => {
    it('should suggest similar commands', () => {
      registry.register('ext', 'hello', noopHandler, metadata);
      registry.register('ext', 'help', noopHandler, metadata);
      registry.register('core', 'world', noopHandler, metadata);
      const suggestions = registry.suggest('ext:helo');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('ext:hello');
    });

    it('should return empty array when no close matches', () => {
      registry.register('ext', 'hello', noopHandler, metadata);
      const suggestions = registry.suggest('zzzzzzzzz');
      expect(suggestions.length).toBe(0);
    });

    it('should suggest core commands', () => {
      registry.register('', 'init', noopHandler, metadata);
      const suggestions = registry.suggest('int');
      expect(suggestions).toContain('init');
    });
  });
});
