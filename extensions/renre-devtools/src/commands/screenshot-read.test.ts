import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';

const mockGetScreenshotDir = vi.fn();

vi.mock('../shared/state.js', () => ({
  getScreenshotDir: (...args: unknown[]) => mockGetScreenshotDir(...args),
}));

import screenshotRead from './screenshot-read.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-ssread-test-' + Date.now().toString());
const SCREENSHOT_DIR = join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools', 'screenshots');

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: TEST_DIR,
    args: { _positional: [], ...args },
    config: {},
  };
}

beforeEach(() => {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  vi.clearAllMocks();
  mockGetScreenshotDir.mockReturnValue(SCREENSHOT_DIR);
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('screenshot-read', () => {
  it('returns error when --path argument is missing', () => {
    const result = screenshotRead(makeContext());
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toBe('Missing --path argument');
  });

  it('returns error when path is not a string', () => {
    const result = screenshotRead(makeContext({ path: 123 }));
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toBe('Missing --path argument');
  });

  it('rejects paths outside the screenshot directory', () => {
    const result = screenshotRead(makeContext({ path: '/etc/passwd' }));
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toBe('Path must be inside the screenshot directory');
  });

  it('rejects relative path traversal', () => {
    const traversalPath = join(SCREENSHOT_DIR, '..', '..', 'secret.json');
    const result = screenshotRead(makeContext({ path: traversalPath }));
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toBe('Path must be inside the screenshot directory');
  });

  it('returns error when file does not exist', () => {
    const missingPath = join(SCREENSHOT_DIR, 'nonexistent.png');
    const result = screenshotRead(makeContext({ path: missingPath }));
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toContain('File not found');
    expect(output.error).toContain(missingPath);
  });

  it('returns base64 dataUrl for existing file', () => {
    const imgPath = join(SCREENSHOT_DIR, 'test.png');
    const imgData = Buffer.from('fake-png-content');
    writeFileSync(imgPath, imgData);

    const result = screenshotRead(makeContext({ path: imgPath }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.dataUrl).toBe(`data:image/png;base64,${imgData.toString('base64')}`);
  });

  it('correctly encodes binary data', () => {
    const imgPath = join(SCREENSHOT_DIR, 'binary.png');
    const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    writeFileSync(imgPath, binaryData);

    const result = screenshotRead(makeContext({ path: imgPath }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.dataUrl).toContain('data:image/png;base64,');
    // Decode and verify round-trip
    const base64Part = output.dataUrl.replace('data:image/png;base64,', '');
    const decoded = Buffer.from(base64Part, 'base64');
    expect(decoded).toEqual(binaryData);
  });
});
