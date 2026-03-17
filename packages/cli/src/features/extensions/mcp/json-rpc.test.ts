import { describe, it, expect } from 'vitest';
import {
  buildRequest,
  parseResponse,
  buildToolCallRequest,
  isNotification,
} from './json-rpc.js';
import { ErrorCode } from '../../../core/errors/extension-error.js';

describe('json-rpc', () => {
  describe('buildRequest', () => {
    it('should build a valid JSON-RPC request', () => {
      const req = buildRequest('test/method', { key: 'value' }, 1);
      expect(req).toEqual({
        jsonrpc: '2.0',
        method: 'test/method',
        params: { key: 'value' },
        id: 1,
      });
    });

    it('should build a request with empty params', () => {
      const req = buildRequest('test/method', {}, 42);
      expect(req.params).toEqual({});
      expect(req.id).toBe(42);
    });

    it('should always set jsonrpc to 2.0', () => {
      const req = buildRequest('any', {}, 1);
      expect(req.jsonrpc).toBe('2.0');
    });
  });

  describe('parseResponse', () => {
    it('should parse a valid success response', () => {
      const data = JSON.stringify({
        jsonrpc: '2.0',
        result: { data: 'hello' },
        id: 1,
      });
      const res = parseResponse(data);
      expect(res.result).toEqual({ data: 'hello' });
      expect(res.id).toBe(1);
      expect(res.error).toBeUndefined();
    });

    it('should parse a valid error response', () => {
      const data = JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid request' },
        id: 2,
      });
      const res = parseResponse(data);
      expect(res.error?.code).toBe(-32600);
      expect(res.error?.message).toBe('Invalid request');
      expect(res.result).toBeUndefined();
    });

    it('should parse an error response with data field', () => {
      const data = JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Server error', data: { detail: 'trace' } },
        id: 3,
      });
      const res = parseResponse(data);
      expect(res.error?.data).toEqual({ detail: 'trace' });
    });

    it('should throw on invalid JSON', () => {
      expect(() => parseResponse('not json')).toThrow();
      try {
        parseResponse('not json');
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.JSON_RPC_PARSE_ERROR);
      }
    });

    it('should throw when jsonrpc field is missing', () => {
      const data = JSON.stringify({ result: 'ok', id: 1 });
      expect(() => parseResponse(data)).toThrow();
      try {
        parseResponse(data);
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.JSON_RPC_INVALID_RESPONSE);
      }
    });

    it('should throw when jsonrpc field is not 2.0', () => {
      const data = JSON.stringify({ jsonrpc: '1.0', result: 'ok', id: 1 });
      expect(() => parseResponse(data)).toThrow();
    });

    it('should throw when id field is missing', () => {
      const data = JSON.stringify({ jsonrpc: '2.0', result: 'ok' });
      expect(() => parseResponse(data)).toThrow();
    });

    it('should throw when neither result nor error is present', () => {
      const data = JSON.stringify({ jsonrpc: '2.0', id: 1 });
      expect(() => parseResponse(data)).toThrow();
    });

    it('should accept result with null value', () => {
      const data = JSON.stringify({ jsonrpc: '2.0', result: null, id: 1 });
      const res = parseResponse(data);
      expect(res.result).toBeNull();
    });
  });

  describe('buildToolCallRequest', () => {
    it('should build a tools/call request', () => {
      const req = buildToolCallRequest('search', { query: 'test' }, 5);
      expect(req.method).toBe('tools/call');
      expect(req.params).toEqual({
        name: 'search',
        arguments: { query: 'test' },
      });
      expect(req.id).toBe(5);
    });

    it('should build a tools/call request with empty args', () => {
      const req = buildToolCallRequest('ping', {}, 10);
      expect(req.params).toEqual({ name: 'ping', arguments: {} });
    });
  });

  describe('isNotification', () => {
    it('should return true for a message without id', () => {
      expect(isNotification({ jsonrpc: '2.0', method: 'notify' })).toBe(true);
    });

    it('should return false for a message with id', () => {
      expect(
        isNotification({ jsonrpc: '2.0', method: 'request', id: 1 }),
      ).toBe(false);
    });

    it('should return false for null', () => {
      expect(isNotification(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isNotification(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isNotification('string')).toBe(false);
    });

    it('should return false for array', () => {
      expect(isNotification([1, 2, 3])).toBe(false);
    });

    it('should return false when jsonrpc is not 2.0', () => {
      expect(isNotification({ jsonrpc: '1.0', method: 'test' })).toBe(false);
    });

    it('should return false when method is missing', () => {
      expect(isNotification({ jsonrpc: '2.0' })).toBe(false);
    });
  });
});
