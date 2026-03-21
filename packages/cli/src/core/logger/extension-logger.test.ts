import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExtensionLogger } from './extension-logger.js';
import { getLogger } from './index.js';

vi.mock('./index.js', () => ({
  getLogger: vi.fn().mockReturnValue({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('createExtensionLogger', () => {
  const mockLogger = getLogger();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an object with debug, info, warn, error methods', () => {
    const logger = createExtensionLogger('my-ext');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('prefixes source with ext: for debug', () => {
    const logger = createExtensionLogger('my-ext');
    logger.debug('test message');
    expect(mockLogger.debug).toHaveBeenCalledWith('ext:my-ext', 'test message', undefined);
  });

  it('prefixes source with ext: for info', () => {
    const logger = createExtensionLogger('my-ext');
    logger.info('hello world');
    expect(mockLogger.info).toHaveBeenCalledWith('ext:my-ext', 'hello world', undefined);
  });

  it('prefixes source with ext: for warn', () => {
    const logger = createExtensionLogger('my-ext');
    logger.warn('caution');
    expect(mockLogger.warn).toHaveBeenCalledWith('ext:my-ext', 'caution', undefined);
  });

  it('prefixes source with ext: for error', () => {
    const logger = createExtensionLogger('my-ext');
    logger.error('something broke');
    expect(mockLogger.error).toHaveBeenCalledWith('ext:my-ext', 'something broke', undefined);
  });

  it('passes data argument through', () => {
    const logger = createExtensionLogger('my-ext');
    const data = { key: 'value' };
    logger.info('with data', data);
    expect(mockLogger.info).toHaveBeenCalledWith('ext:my-ext', 'with data', data);
  });

  it('uses different extension names for different loggers', () => {
    const loggerA = createExtensionLogger('ext-a');
    const loggerB = createExtensionLogger('ext-b');

    loggerA.info('from a');
    loggerB.info('from b');

    expect(mockLogger.info).toHaveBeenCalledWith('ext:ext-a', 'from a', undefined);
    expect(mockLogger.info).toHaveBeenCalledWith('ext:ext-b', 'from b', undefined);
  });
});
