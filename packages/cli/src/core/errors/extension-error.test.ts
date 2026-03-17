import { describe, it, expect } from 'vitest';
import { ExtensionError, wrapError } from './extension-error.js';
import { ErrorCode } from '../types/index.js';

describe('ExtensionError', () => {
  it('should create an error with extensionName and code', () => {
    const err = new ExtensionError('my-ext', ErrorCode.EXTENSION_NOT_FOUND, 'not found');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ExtensionError);
    expect(err.extensionName).toBe('my-ext');
    expect(err.code).toBe(ErrorCode.EXTENSION_NOT_FOUND);
    expect(err.message).toBe('not found');
  });

  it('should store original error', () => {
    const original = new Error('original cause');
    const err = new ExtensionError(
      'my-ext',
      ErrorCode.MCP_SPAWN_FAILED,
      'spawn failed',
      original,
    );
    expect(err.originalError).toBe(original);
  });

  it('should have correct name property', () => {
    const err = new ExtensionError('ext', ErrorCode.HOOK_FAILED, 'hook fail');
    expect(err.name).toBe('ExtensionError');
  });

  it('should default originalError to undefined', () => {
    const err = new ExtensionError('ext', ErrorCode.CONFIG_INVALID, 'bad config');
    expect(err.originalError).toBeUndefined();
  });
});

describe('wrapError', () => {
  it('should wrap a plain Error into ExtensionError', () => {
    const original = new Error('something broke');
    const wrapped = wrapError(original, 'my-ext', ErrorCode.MCP_TIMEOUT);
    expect(wrapped).toBeInstanceOf(ExtensionError);
    expect(wrapped.extensionName).toBe('my-ext');
    expect(wrapped.code).toBe(ErrorCode.MCP_TIMEOUT);
    expect(wrapped.message).toBe('something broke');
    expect(wrapped.originalError).toBe(original);
  });

  it('should return the same ExtensionError if already correct type', () => {
    const existing = new ExtensionError(
      'my-ext',
      ErrorCode.VAULT_DECRYPT_FAILED,
      'decrypt fail',
    );
    const wrapped = wrapError(existing, 'my-ext', ErrorCode.VAULT_DECRYPT_FAILED);
    expect(wrapped).toBe(existing);
  });

  it('should re-wrap ExtensionError if code differs', () => {
    const existing = new ExtensionError(
      'my-ext',
      ErrorCode.MCP_TIMEOUT,
      'timeout',
    );
    const wrapped = wrapError(existing, 'my-ext', ErrorCode.MCP_DISCONNECTED);
    expect(wrapped).not.toBe(existing);
    expect(wrapped.code).toBe(ErrorCode.MCP_DISCONNECTED);
    expect(wrapped.originalError).toBe(existing);
  });

  it('should handle non-Error objects', () => {
    const wrapped = wrapError('string error' as unknown as Error, 'ext', ErrorCode.HOOK_FAILED);
    expect(wrapped).toBeInstanceOf(ExtensionError);
    expect(wrapped.message).toBe('string error');
  });
});
