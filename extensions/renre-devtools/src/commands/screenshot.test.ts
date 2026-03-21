import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';

const mockScreenshot = vi.fn();
const mockElementScreenshot = vi.fn();
const mock$ = vi.fn();
const mockUrl = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('../shared/connection.js', () => ({
  withBrowser: vi.fn().mockImplementation(
    (_projectPath: string, fn: (browser: unknown, page: unknown) => Promise<unknown>) =>
      fn(
        { disconnect: mockDisconnect },
        {
          $: mock$,
          screenshot: mockScreenshot,
          url: mockUrl,
        }
      )
  ),
}));

const mockGetScreenshotDir = vi.fn();

vi.mock('../shared/state.js', () => ({
  getScreenshotDir: (...args: unknown[]) => mockGetScreenshotDir(...args),
}));

import screenshot from './screenshot.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-screenshot-test-' + Date.now().toString());
const SCREENSHOT_DIR = join(TEST_DIR, 'screenshots');

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
  mockUrl.mockReturnValue('https://example.com');
  mockScreenshot.mockResolvedValue(Buffer.from('fake-png-data'));
  mock$.mockResolvedValue(null);
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('screenshot', () => {
  it('takes a full page screenshot and saves to default path', async () => {
    mockScreenshot.mockResolvedValue(undefined);

    const result = await screenshot(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Screenshot Saved');
    expect(result.output).toContain('full page');
    expect(result.output).toContain('**Full page**: no');
    expect(mockScreenshot).toHaveBeenCalledWith(
      expect.objectContaining({ fullPage: false })
    );
  });

  it('takes a full page screenshot when --full-page is set', async () => {
    mockScreenshot.mockResolvedValue(undefined);

    const result = await screenshot(makeContext({ 'full-page': true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('**Full page**: yes');
    expect(mockScreenshot).toHaveBeenCalledWith(
      expect.objectContaining({ fullPage: true })
    );
  });

  it('takes a full page screenshot when --fullPage is set', async () => {
    mockScreenshot.mockResolvedValue(undefined);

    const result = await screenshot(makeContext({ fullPage: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('**Full page**: yes');
  });

  it('returns error when selector element not found', async () => {
    mock$.mockResolvedValue(null);

    const result = await screenshot(makeContext({ selector: '#missing' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
    expect(result.output).toContain('#missing');
  });

  it('screenshots specific element when selector matches', async () => {
    const mockElement = {
      screenshot: mockElementScreenshot,
    };
    mock$.mockResolvedValue(mockElement);
    mockElementScreenshot.mockResolvedValue(undefined);

    const result = await screenshot(makeContext({ selector: '#hero' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Screenshot Saved');
    expect(result.output).toContain('#hero');
    expect(mockElementScreenshot).toHaveBeenCalled();
  });

  it('saves to custom output path', async () => {
    const outputPath = join(TEST_DIR, 'custom', 'my-screenshot.png');
    mockScreenshot.mockResolvedValue(undefined);

    const result = await screenshot(makeContext({ output: outputPath }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain(outputPath);
  });

  it('returns base64 encoded screenshot when --encoded is set', async () => {
    mockScreenshot.mockResolvedValue('base64data');

    const result = await screenshot(makeContext({ encoded: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('data:image/png;base64,base64data');
    expect(mockScreenshot).toHaveBeenCalledWith(
      expect.objectContaining({ encoding: 'base64' })
    );
  });

  it('returns base64 encoded element screenshot when --encoded with --selector', async () => {
    const mockElement = {
      screenshot: mockElementScreenshot,
    };
    mock$.mockResolvedValue(mockElement);
    mockElementScreenshot.mockResolvedValue('element-base64');

    const result = await screenshot(makeContext({ encoded: true, selector: '.hero' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('data:image/png;base64,element-base64');
    expect(result.output).toContain('Screenshot: `.hero`');
    expect(mockElementScreenshot).toHaveBeenCalledWith(
      expect.objectContaining({ encoding: 'base64' })
    );
  });

  it('uses custom dir for screenshots', async () => {
    const customDir = join(TEST_DIR, 'custom-screens');
    mkdirSync(customDir, { recursive: true });
    mockScreenshot.mockResolvedValue(undefined);

    const result = await screenshot(makeContext({ dir: customDir }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Screenshot Saved');
  });

  it('registers screenshot metadata', async () => {
    mockScreenshot.mockResolvedValue(undefined);

    await screenshot(makeContext());

    const metaPath = join(SCREENSHOT_DIR, 'screenshots.jsonl');
    expect(existsSync(metaPath)).toBe(true);

    const content = readFileSync(metaPath, 'utf-8').trim();
    const meta = JSON.parse(content);
    expect(meta.url).toBe('https://example.com');
    expect(meta.selector).toBeNull();
    expect(meta.fullPage).toBe(false);
  });

  it('shows full page label in encoded output without selector', async () => {
    mockScreenshot.mockResolvedValue('b64');

    const result = await screenshot(makeContext({ encoded: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Screenshot (full page)');
  });
});
