import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext, ScreenshotMeta } from '../shared/types.js';

import screenshotList from './screenshot-list.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-sslist-test-' + Date.now().toString());
const SCREENSHOT_DIR = join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools', 'screenshots');

function makeContext(): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: TEST_DIR,
    args: { _positional: [] },
    config: {},
  };
}

beforeEach(() => {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('screenshot-list', () => {
  it('returns empty array when no metadata file exists', () => {
    const result = screenshotList(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.screenshots).toEqual([]);
  });

  it('returns empty array when metadata file is empty', () => {
    writeFileSync(join(SCREENSHOT_DIR, 'screenshots.jsonl'), '');

    const result = screenshotList(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.screenshots).toEqual([]);
  });

  it('lists existing screenshots', () => {
    const imgPath = join(SCREENSHOT_DIR, 'shot1.png');
    writeFileSync(imgPath, 'fake-png-data');

    const meta: ScreenshotMeta = {
      filename: 'shot1.png',
      path: imgPath,
      timestamp: '2024-01-15T10:00:00.000Z',
      url: 'https://example.com',
      selector: null,
      fullPage: false,
    };
    writeFileSync(join(SCREENSHOT_DIR, 'screenshots.jsonl'), JSON.stringify(meta));

    const result = screenshotList(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.screenshots).toHaveLength(1);
    expect(output.screenshots[0].filename).toBe('shot1.png');
    expect(output.screenshots[0].url).toBe('https://example.com');
  });

  it('filters out screenshots whose files no longer exist', () => {
    const existingPath = join(SCREENSHOT_DIR, 'exists.png');
    const missingPath = join(SCREENSHOT_DIR, 'missing.png');
    writeFileSync(existingPath, 'data');

    const meta1: ScreenshotMeta = {
      filename: 'exists.png',
      path: existingPath,
      timestamp: '2024-01-15T10:00:00.000Z',
      url: 'https://example.com/1',
      selector: null,
      fullPage: false,
    };
    const meta2: ScreenshotMeta = {
      filename: 'missing.png',
      path: missingPath,
      timestamp: '2024-01-15T10:00:01.000Z',
      url: 'https://example.com/2',
      selector: '#main',
      fullPage: true,
    };
    const lines = [JSON.stringify(meta1), JSON.stringify(meta2)].join('\n');
    writeFileSync(join(SCREENSHOT_DIR, 'screenshots.jsonl'), lines);

    const result = screenshotList(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.screenshots).toHaveLength(1);
    expect(output.screenshots[0].filename).toBe('exists.png');
  });
});
