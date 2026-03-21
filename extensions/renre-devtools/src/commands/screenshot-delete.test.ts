import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext, ScreenshotMeta } from '../shared/types.js';

import screenshotDelete from './screenshot-delete.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-ssdel-test-' + Date.now().toString());
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
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('screenshot-delete', () => {
  it('returns error when --path argument is missing', () => {
    const result = screenshotDelete(makeContext());
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toBe('Missing --path argument');
  });

  it('returns error when path is not a string', () => {
    const result = screenshotDelete(makeContext({ path: 42 }));
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.error).toBe('Missing --path argument');
  });

  it('deletes file and updates metadata', () => {
    const imgPath = join(SCREENSHOT_DIR, 'delete-me.png');
    writeFileSync(imgPath, 'image data');

    const meta1: ScreenshotMeta = {
      filename: 'delete-me.png',
      path: imgPath,
      timestamp: '2024-01-15T10:00:00.000Z',
      url: 'https://example.com',
      selector: null,
      fullPage: false,
    };
    const meta2: ScreenshotMeta = {
      filename: 'keep-me.png',
      path: join(SCREENSHOT_DIR, 'keep-me.png'),
      timestamp: '2024-01-15T10:00:01.000Z',
      url: 'https://example.com/other',
      selector: '#main',
      fullPage: true,
    };
    const metaPath = join(SCREENSHOT_DIR, 'screenshots.jsonl');
    writeFileSync(metaPath, [JSON.stringify(meta1), JSON.stringify(meta2)].join('\n'));

    const result = screenshotDelete(makeContext({ path: imgPath }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.deleted).toBe(true);
    expect(output.path).toBe(imgPath);

    // File should be deleted
    expect(existsSync(imgPath)).toBe(false);

    // Metadata should only contain the kept entry
    const updatedMeta = readFileSync(metaPath, 'utf-8').trim();
    const remaining = updatedMeta.split('\n').map((l) => JSON.parse(l) as ScreenshotMeta);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].filename).toBe('keep-me.png');
  });

  it('handles already-deleted file gracefully', () => {
    const imgPath = join(SCREENSHOT_DIR, 'already-gone.png');
    // File does not exist, but metadata references it
    const meta: ScreenshotMeta = {
      filename: 'already-gone.png',
      path: imgPath,
      timestamp: '2024-01-15T10:00:00.000Z',
      url: 'https://example.com',
      selector: null,
      fullPage: false,
    };
    const metaPath = join(SCREENSHOT_DIR, 'screenshots.jsonl');
    writeFileSync(metaPath, JSON.stringify(meta));

    const result = screenshotDelete(makeContext({ path: imgPath }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.deleted).toBe(true);

    // Metadata should be empty
    const updatedMeta = readFileSync(metaPath, 'utf-8');
    expect(updatedMeta).toBe('');
  });

  it('succeeds even when no metadata file exists', () => {
    const imgPath = join(SCREENSHOT_DIR, 'orphan.png');
    writeFileSync(imgPath, 'data');

    const result = screenshotDelete(makeContext({ path: imgPath }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.deleted).toBe(true);
    expect(existsSync(imgPath)).toBe(false);
  });

  it('handles metadata file with empty content', () => {
    const imgPath = join(SCREENSHOT_DIR, 'test.png');
    const metaPath = join(SCREENSHOT_DIR, 'screenshots.jsonl');
    writeFileSync(metaPath, '');

    const result = screenshotDelete(makeContext({ path: imgPath }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.deleted).toBe(true);
  });
});
