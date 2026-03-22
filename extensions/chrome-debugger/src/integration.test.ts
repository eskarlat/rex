/**
 * Integration tests for Chrome Debugger extension.
 *
 * Launches a real headless browser, starts a tiny HTTP server to serve test pages,
 * and exercises every command handler against live browser state.
 *
 * Excluded commands:
 * - chrome-install: downloads Chromium binary (slow, side-effect-heavy)
 */
import { createServer, type Server } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const SKIP_INTEGRATION = !process.env['RUN_INTEGRATION_TESTS'];
const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;

/**
 * Locate a usable Chromium binary.
 * Priority: PUPPETEER_EXECUTABLE_PATH env > Playwright's bundled Chromium > system Chrome.
 */
function findChromium(): string | undefined {
  if (process.env['PUPPETEER_EXECUTABLE_PATH']) {
    return process.env['PUPPETEER_EXECUTABLE_PATH'];
  }
  // Playwright's bundled Chromium
  try {
    const out = execFileSync('find', [
      `${process.env['HOME'] ?? '/root'}/.cache/ms-playwright`,
      '-name', 'chrome', '-type', 'f',
    ], { encoding: 'utf-8', timeout: 5000 }).trim();
    const first = out.split('\n')[0];
    if (first) return first;
  } catch {
    // not found
  }
  return undefined;
}

import type { ExecutionContext, CommandResult } from './shared/types.js';

import launch from './commands/launch.js';
import close from './commands/close.js';
import navigate from './commands/navigate.js';
import tabs from './commands/tabs.js';
import tab from './commands/tab.js';
import dom from './commands/dom.js';
import select from './commands/select.js';
import click from './commands/click.js';
import type_ from './commands/type.js';
import eval_ from './commands/eval.js';
import network from './commands/network.js';
import console_ from './commands/console.js';
import screenshot from './commands/screenshot.js';
import screenshotList from './commands/screenshot-list.js';
import screenshotRead from './commands/screenshot-read.js';
import screenshotDelete from './commands/screenshot-delete.js';
import cookies from './commands/cookies.js';
import storage from './commands/storage.js';
import styles from './commands/styles.js';
import a11y from './commands/a11y.js';
import performance_ from './commands/performance.js';
import highlight from './commands/highlight.js';
import status from './commands/status.js';
import heartbeat from './commands/heartbeat.js';
import chromeCheck from './commands/chrome-check.js';
import clearLogs from './commands/clear-logs.js';
import inspect from './commands/inspect.js';
import selected from './commands/selected.js';
import { connectBrowser, getActivePage } from './shared/connection.js';
import { readState, writeState } from './shared/state.js';

// ── Test HTML page ────────────────────────────────────────────────

const TEST_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Integration Test Page</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    #main { display: flex; flex-direction: column; gap: 10px; }
    .card { border: 1px solid #ccc; padding: 10px; border-radius: 4px; }
    #hidden-el { display: none; }
  </style>
</head>
<body>
  <h1 id="heading">Hello Integration</h1>
  <div id="main" role="main">
    <div class="card" data-testid="card-1">
      <p>Card one content</p>
    </div>
    <div class="card" data-testid="card-2">
      <p>Card two content</p>
    </div>
    <input id="text-input" type="text" placeholder="Type here" />
    <button id="click-btn" onclick="document.title='Clicked!'">Click Me</button>
    <span id="hidden-el">Hidden</span>
  </div>
  <script>
    localStorage.setItem('testKey', 'testValue');
    sessionStorage.setItem('sessionKey', 'sessionValue');
    console.log('page loaded');
  </script>
</body>
</html>`;

// ── Helpers ───────────────────────────────────────────────────────

let httpServer: Server;
let serverPort: number;
let projectPath: string;
let renreKitHome: string;

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'integration-test',
    projectPath,
    args,
    config: { headless: true, port: 9333 },
  };
}

function assertSuccess(result: CommandResult): void {
  expect(result.exitCode, `Command failed: ${result.output}`).toBe(0);
}

async function run(
  cmd: { handler: (ctx: ExecutionContext) => unknown },
  args: Record<string, unknown> = {},
): Promise<CommandResult> {
  return (await cmd.handler(makeContext(args))) as CommandResult;
}

// ── Setup / Teardown ──────────────────────────────────────────────

beforeAll(async () => {
  // Point Puppeteer at an available Chromium binary
  const chromePath = findChromium();
  if (chromePath) {
    process.env['PUPPETEER_EXECUTABLE_PATH'] = chromePath;
  }

  // Create isolated project directory
  projectPath = join(tmpdir(), `chrome-dbg-integ-${String(Date.now())}`);
  mkdirSync(join(projectPath, '.renre-kit', 'storage', 'chrome-debugger'), { recursive: true });
  writeFileSync(
    join(projectPath, '.renre-kit', 'manifest.json'),
    JSON.stringify({ name: 'integration-test', version: '1.0.0' }),
  );

  // Override RENRE_KIT_HOME to isolate global state
  renreKitHome = join(tmpdir(), `chrome-dbg-home-${String(Date.now())}`);
  mkdirSync(renreKitHome, { recursive: true });
  process.env['RENRE_KIT_HOME'] = renreKitHome;

  // Start a tiny HTTP server serving the test page
  httpServer = createServer((_req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Set-Cookie': 'testCookie=hello; Path=/',
    });
    res.end(TEST_HTML);
  });
  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = httpServer.address();
  serverPort = typeof addr === 'object' && addr !== null ? addr.port : 0;
}, 30_000);

afterAll(async () => {
  // Close browser if still running
  try {
    await run(close);
  } catch {
    // Already closed
  }

  // Stop HTTP server
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });

  // Cleanup temp dirs
  rmSync(projectPath, { recursive: true, force: true });
  rmSync(renreKitHome, { recursive: true, force: true });
  delete process.env['RENRE_KIT_HOME'];
}, 30_000);

// ── Tests ─────────────────────────────────────────────────────────

describeIntegration('Chrome Debugger — Integration', () => {
  // ────────────────────────────────────────────
  // 1. Browser Lifecycle
  // ────────────────────────────────────────────

  describe('browser lifecycle', () => {
    it('chrome-check: detects Chrome/Chromium', async () => {
      const result = await run(chromeCheck);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.found).toBe(true);
      expect(data.path).toBeTruthy();
    });

    it('status: reports not running before launch', async () => {
      const result = await run(status);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.running).toBe(false);
    });

    it('launch: starts headless browser', async () => {
      const result = await run(launch);
      assertSuccess(result);
      expect(result.output).toContain('Browser Launched');
      expect(result.output).toContain('headless');
    });

    it('launch: returns error when already running', async () => {
      const result = await run(launch);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Already Running');
    });

    it('status: reports running after launch', async () => {
      const result = await run(status);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.running).toBe(true);
      expect(data.pid).toBeGreaterThan(0);
      expect(data.port).toBe(9333);
    });

    it('heartbeat: updates session timestamp', async () => {
      const result = await run(heartbeat);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.updated).toBe(true);
      expect(data.lastSeenAt).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────
  // 2. Navigation & Tabs
  // ────────────────────────────────────────────

  describe('navigation and tabs', () => {
    it('navigate: loads the test page', async () => {
      const url = `http://127.0.0.1:${String(serverPort)}/`;
      const result = await run(navigate, { url });
      assertSuccess(result);
      expect(result.output).toContain('Navigated');
      expect(result.output).toContain('Integration Test Page');
      expect(result.output).toContain('200');
    });

    it('navigate: throws without --url (validation is done by CLI runtime)', async () => {
      await expect(run(navigate)).rejects.toThrow();
    });

    it('tabs: lists open tabs', async () => {
      const result = await run(tabs);
      assertSuccess(result);
      expect(result.output).toContain('Open Tabs');
      expect(result.output).toContain('Integration Test Page');
    });

    it('tab: switches to tab 0', async () => {
      const result = await run(tab, { index: 0 });
      assertSuccess(result);
      expect(result.output).toContain('Integration Test Page');
    });
  });

  // ────────────────────────────────────────────
  // 3. DOM Inspection
  // ────────────────────────────────────────────

  describe('DOM inspection', () => {
    it('dom: returns full page DOM tree', async () => {
      const result = await run(dom);
      assertSuccess(result);
      expect(result.output).toContain('DOM Tree');
      expect(result.output).toContain('<html');
      expect(result.output).toContain('<h1');
      expect(result.output).toContain('Hello Integration');
    });

    it('dom: returns subtree for selector', async () => {
      const result = await run(dom, { selector: '#main', depth: 3 });
      assertSuccess(result);
      expect(result.output).toContain('DOM: `#main`');
      expect(result.output).toContain('card');
      expect(result.output).toContain('data-testid');
    });

    it('dom: subtree does not contain elements outside selector', async () => {
      const result = await run(dom, { selector: '.card[data-testid="card-1"]' });
      assertSuccess(result);
      expect(result.output).toContain('Card one content');
      expect(result.output).not.toContain('Card two content');
    });

    it('dom: respects depth limit', async () => {
      const shallow = await run(dom, { selector: '#main', depth: 1 });
      assertSuccess(shallow);
      // At depth 1, children should be truncated with "..."
      expect(shallow.output).toContain('...');
    });

    it('dom: returns message for non-existent selector', async () => {
      const result = await run(dom, { selector: '#nonexistent' });
      assertSuccess(result);
      expect(result.output).toContain('No element found');
    });

    it('select: finds elements by CSS selector', async () => {
      const result = await run(select, { selector: '.card' });
      assertSuccess(result);
      expect(result.output).toContain('2 found');
      expect(result.output).toContain('div');
      expect(result.output).toContain('card');
    });

    it('select: finds input with attributes', async () => {
      const result = await run(select, { selector: '#text-input' });
      assertSuccess(result);
      expect(result.output).toContain('input');
      expect(result.output).toContain('text');
    });

    it('select: returns no results without --selector (validation is done by CLI runtime)', async () => {
      const result = await run(select);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('No elements found');
    });

    it('select: returns no results for non-existent selector', async () => {
      const result = await run(select, { selector: '.nonexistent' });
      assertSuccess(result);
      expect(result.output).toContain('No elements found');
    });

    it('styles: returns computed styles for an element', async () => {
      const result = await run(styles, { selector: '#main' });
      assertSuccess(result);
      expect(result.output).toContain('Computed Styles');
      expect(result.output).toContain('display');
      expect(result.output).toContain('flex');
    });

    it('styles: fails without --selector', async () => {
      const result = await run(styles);
      expect(result.exitCode).toBe(1);
    });

    it('a11y: returns accessibility tree', async () => {
      const result = await run(a11y);
      assertSuccess(result);
      expect(result.output).toContain('Accessibility Tree');
    });

    it('a11y: returns subtree for selector', async () => {
      const result = await run(a11y, { selector: '#heading' });
      assertSuccess(result);
      expect(result.output).toContain('Accessibility Tree');
    });
  });

  // ────────────────────────────────────────────
  // 4. User Interactions
  // ────────────────────────────────────────────

  describe('user interactions', () => {
    it('click: clicks a button', async () => {
      const result = await run(click, { selector: '#click-btn' });
      assertSuccess(result);
      expect(result.output).toContain('Clicked');
    });

    it('click: verifies page title changed after click', async () => {
      const result = await run(eval_, { code: 'document.title' });
      assertSuccess(result);
      expect(result.output).toContain('Clicked!');
    });

    it('click: fails for non-existent selector', async () => {
      const result = await run(click, { selector: '#nonexistent' });
      expect(result.exitCode).toBe(1);
    });

    it('type: types text into input', async () => {
      const result = await run(type_, { selector: '#text-input', text: 'hello world' });
      assertSuccess(result);
      expect(result.output).toContain('Typed');
    });

    it('type: verifies typed text via eval', async () => {
      const result = await run(eval_, { code: 'document.getElementById("text-input").value' });
      assertSuccess(result);
      expect(result.output).toContain('hello world');
    });

    it('type: clears and retypes with --clear', async () => {
      const result = await run(type_, { selector: '#text-input', text: 'replaced', clear: true });
      assertSuccess(result);

      const verify = await run(eval_, { code: 'document.getElementById("text-input").value' });
      assertSuccess(verify);
      expect(verify.output).toContain('replaced');
    });

    it('type: throws without --text (validation is done by CLI runtime)', async () => {
      await expect(run(type_, { selector: '#text-input' })).rejects.toThrow();
    });

    it('eval: executes JavaScript and returns result', async () => {
      const result = await run(eval_, { code: '1 + 2' });
      assertSuccess(result);
      expect(result.output).toContain('3');
    });

    it('eval: handles object return values', async () => {
      const result = await run(eval_, { code: '({ foo: "bar" })' });
      assertSuccess(result);
      expect(result.output).toContain('foo');
      expect(result.output).toContain('bar');
    });

    it('eval: reads DOM elements', async () => {
      const result = await run(eval_, { code: 'document.querySelectorAll(".card").length' });
      assertSuccess(result);
      expect(result.output).toContain('2');
    });

    it('eval: manipulates DOM and reads back', async () => {
      // Add a new element via JS
      await run(eval_, {
        code: `(() => {
          const el = document.createElement('div');
          el.id = 'eval-added';
          el.textContent = 'Added by eval';
          document.getElementById('main').appendChild(el);
          return 'created';
        })()`,
      });

      // Read it back via dom command
      const domResult = await run(dom, { selector: '#eval-added' });
      assertSuccess(domResult);
      expect(domResult.output).toContain('Added by eval');

      // Verify via select
      const selectResult = await run(select, { selector: '#eval-added' });
      assertSuccess(selectResult);
      expect(selectResult.output).toContain('eval-added');
    });

    it('eval: modifies element text and verifies via dom', async () => {
      await run(eval_, {
        code: 'document.getElementById("heading").textContent = "Modified Heading"',
      });

      const domResult = await run(dom, { selector: '#heading' });
      assertSuccess(domResult);
      expect(domResult.output).toContain('Modified Heading');
    });

    it('eval: handles array return values', async () => {
      const result = await run(eval_, { code: '[1, 2, 3].map(x => x * 2)' });
      assertSuccess(result);
      expect(result.output).toContain('2');
      expect(result.output).toContain('4');
      expect(result.output).toContain('6');
    });

    it('eval: fails without --code or --file', async () => {
      const result = await run(eval_);
      expect(result.exitCode).toBe(1);
    });
  });

  // ────────────────────────────────────────────
  // 5. Network, Console, Performance, Storage
  // ────────────────────────────────────────────

  describe('network, console, and storage', () => {
    it('network: captures requests from page navigation (markdown)', async () => {
      const result = await run(network, { format: 'markdown' });
      assertSuccess(result);
      expect(result.output).toContain('Network Requests');
      expect(result.output).toContain('GET');
    });

    it('network: shows captured requests (json)', async () => {
      const result = await run(network, { format: 'json' });
      assertSuccess(result);
      const data = JSON.parse(result.output) as { entries: unknown[]; total: number };
      expect(data.entries.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
    });

    it('network: filters by method', async () => {
      const result = await run(network, { method: 'GET', format: 'json' });
      assertSuccess(result);
      const data = JSON.parse(result.output) as { entries: { method: string }[] };
      for (const entry of data.entries) {
        expect(entry.method).toBe('GET');
      }
    });

    it('console: captures page console.log messages (markdown)', async () => {
      const result = await run(console_, { format: 'markdown' });
      assertSuccess(result);
      expect(result.output).toContain('Console');
      expect(result.output).toContain('page loaded');
    });

    it('console: shows captured messages (json)', async () => {
      const result = await run(console_, { format: 'json' });
      assertSuccess(result);
      const data = JSON.parse(result.output) as { entries: unknown[]; total: number };
      expect(data.entries.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
    });

    it('performance: returns metrics', async () => {
      const result = await run(performance_);
      assertSuccess(result);
      expect(result.output).toContain('Performance');
    });

    it('cookies: lists browser cookies', async () => {
      const result = await run(cookies);
      assertSuccess(result);
      expect(result.output).toContain('Cookies');
      expect(result.output).toContain('testCookie');
    });

    it('storage: shows localStorage', async () => {
      const result = await run(storage, { type: 'local' });
      assertSuccess(result);
      expect(result.output).toContain('localStorage');
      expect(result.output).toContain('testKey');
      expect(result.output).toContain('testValue');
    });

    it('storage: shows sessionStorage', async () => {
      const result = await run(storage, { type: 'session' });
      assertSuccess(result);
      expect(result.output).toContain('sessionStorage');
      expect(result.output).toContain('sessionKey');
      expect(result.output).toContain('sessionValue');
    });

    it('clear-logs: runs without error', async () => {
      const result = await run(clearLogs);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data).toHaveProperty('cleared');
      expect(data).toHaveProperty('files');
    });
  });

  // ────────────────────────────────────────────
  // 6. Screenshots
  // ────────────────────────────────────────────

  describe('screenshots', () => {
    let savedScreenshotPath: string;

    it('screenshot: takes a page screenshot', async () => {
      const result = await run(screenshot);
      assertSuccess(result);
      expect(result.output).toContain('Screenshot Saved');
      // Extract path from output
      const pathMatch = result.output.match(/\*\*Path\*\*: `(.+?)`/);
      expect(pathMatch).toBeTruthy();
      savedScreenshotPath = pathMatch![1]!;
      expect(existsSync(savedScreenshotPath)).toBe(true);
    });

    it('screenshot: takes element screenshot', async () => {
      const result = await run(screenshot, { selector: '#heading' });
      assertSuccess(result);
      expect(result.output).toContain('Screenshot Saved');
      expect(result.output).toContain('#heading');
    });

    it('screenshot: returns encoded base64', async () => {
      const result = await run(screenshot, { encoded: true });
      assertSuccess(result);
      expect(result.output).toContain('data:image/png;base64,');
    });

    it('screenshot: fails for non-existent selector', async () => {
      const result = await run(screenshot, { selector: '#nope' });
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('No element found');
    });

    it('screenshot-list: lists saved screenshots', async () => {
      const result = await run(screenshotList);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.screenshots.length).toBeGreaterThanOrEqual(1);
    });

    it('screenshot-read: reads screenshot as base64', async () => {
      const result = await run(screenshotRead, { path: savedScreenshotPath });
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.dataUrl).toContain('data:image/png;base64,');
    });

    it('screenshot-read: fails for invalid path', async () => {
      const result = await run(screenshotRead, { path: '/etc/passwd' });
      expect(result.exitCode).toBe(1);
    });

    it('screenshot-delete: deletes a screenshot', async () => {
      const result = await run(screenshotDelete, { path: savedScreenshotPath });
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.deleted).toBe(true);
      expect(existsSync(savedScreenshotPath)).toBe(false);
    });
  });

  // ────────────────────────────────────────────
  // 7. Highlight & Selected
  // ────────────────────────────────────────────

  describe('highlight and selected', () => {
    it('highlight: highlights an element', async () => {
      const result = await run(highlight, { selector: '#heading', duration: 100 });
      assertSuccess(result);
      expect(result.output).toContain('Highlighted');
    });

    it('highlight: fails without --selector', async () => {
      const result = await run(highlight);
      expect(result.exitCode).toBe(1);
    });

    it('selected: reports no element selected initially', async () => {
      const result = await run(selected);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('No Element Selected');
    });
  });

  // ────────────────────────────────────────────
  // 8. Inspect + Selected (simulated user pick)
  // ────────────────────────────────────────────

  describe('inspect and selected workflow', () => {
    it('inspect: simulates element pick via CDP and saves selection', async () => {
      const browser = await connectBrowser(projectPath);
      const page = await getActivePage(browser);
      const client = await page.createCDPSession();

      await client.send('DOM.enable');

      // Get the document root
      const { root } = (await client.send('DOM.getDocument', { depth: 0 })) as {
        root: { nodeId: number };
      };

      // Find #heading element via CDP
      const { nodeId } = (await client.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: '#heading',
      })) as { nodeId: number };
      expect(nodeId).toBeGreaterThan(0);

      // Describe the node to get backendNodeId
      const { node } = (await client.send('DOM.describeNode', { nodeId })) as {
        node: { backendNodeId: number; localName: string };
      };
      expect(node.localName).toBe('h1');

      // Resolve to JS object for selector generation
      const { object } = (await client.send('DOM.resolveNode', {
        backendNodeId: node.backendNodeId,
      })) as { object: { objectId: string } };

      // Generate CSS selector
      const selectorResult = await client.send('Runtime.callFunctionOn', {
        objectId: object.objectId,
        functionDeclaration: `function() {
          if (this.id) return '#' + this.id;
          return this.tagName.toLowerCase();
        }`,
        returnByValue: true,
      });
      const cssSelector = (selectorResult as { result: { value: string } }).result.value;
      expect(cssSelector).toBe('#heading');

      // Save to state (same as inspect does)
      const state = readState(projectPath);
      expect(state).toBeTruthy();
      writeState(projectPath, {
        ...state!,
        selectedElement: {
          backendNodeId: node.backendNodeId,
          selector: cssSelector,
          tag: node.localName,
          timestamp: new Date().toISOString(),
        },
      } as typeof state);
    });

    it('selected: returns full details for the picked element', async () => {
      const result = await run(selected);
      assertSuccess(result);
      expect(result.output).toContain('Selected Element');
      expect(result.output).toContain('#heading');
      expect(result.output).toContain('<h1>');
      expect(result.output).toContain('Modified Heading');
    });

    it('selected: includes computed styles', async () => {
      const result = await run(selected);
      assertSuccess(result);
      expect(result.output).toContain('Computed Styles');
      expect(result.output).toContain('fontSize');
    });

    it('selected: includes HTML preview', async () => {
      const result = await run(selected);
      assertSuccess(result);
      expect(result.output).toContain('HTML');
      expect(result.output).toContain('h1');
    });

    it('selected: includes action suggestions', async () => {
      const result = await run(selected);
      assertSuccess(result);
      expect(result.output).toContain('Actions');
      expect(result.output).toContain('chrome-debugger:click');
      expect(result.output).toContain('chrome-debugger:styles');
    });

    it('inspect: simulates picking a different element (.card)', async () => {
      const browser = await connectBrowser(projectPath);
      const page = await getActivePage(browser);
      const client = await page.createCDPSession();

      await client.send('DOM.enable');
      const { root } = (await client.send('DOM.getDocument', { depth: 0 })) as {
        root: { nodeId: number };
      };
      const { nodeId } = (await client.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: '.card[data-testid="card-1"]',
      })) as { nodeId: number };
      expect(nodeId).toBeGreaterThan(0);

      const { node } = (await client.send('DOM.describeNode', { nodeId })) as {
        node: { backendNodeId: number; localName: string };
      };

      const state = readState(projectPath);
      writeState(projectPath, {
        ...state!,
        selectedElement: {
          backendNodeId: node.backendNodeId,
          selector: '.card[data-testid="card-1"]',
          tag: node.localName,
          timestamp: new Date().toISOString(),
        },
      } as typeof state);
    });

    it('selected: returns details for the newly picked .card element', async () => {
      const result = await run(selected);
      assertSuccess(result);
      expect(result.output).toContain('Selected Element');
      expect(result.output).toContain('card-1');
      expect(result.output).toContain('<div>');
      expect(result.output).toContain('Card one content');
    });

    it('selected: reports element not found when page changes', async () => {
      // Remove the element from the page
      await run(eval_, {
        code: 'document.querySelector(".card[data-testid=\\"card-1\\"]")?.remove()',
      });

      // Write state with selector pointing to removed element
      const state = readState(projectPath);
      writeState(projectPath, {
        ...state!,
        selectedElement: {
          backendNodeId: 99999,
          selector: '.card[data-testid="card-1"]',
          tag: 'div',
          timestamp: new Date().toISOString(),
        },
      } as typeof state);

      const result = await run(selected);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('No Longer Found');
    });

    it('inspect: times out when no element is picked', async () => {
      await expect(inspect.handler(makeContext({ timeout: 200 }))).rejects.toThrow('Timed out');
    });
  });

  // ────────────────────────────────────────────
  // 8. Browser Close
  // ────────────────────────────────────────────

  describe('browser close', () => {
    it('close: shuts down the browser', async () => {
      const result = await run(close);
      assertSuccess(result);
      expect(result.output).toContain('Browser Closed');
      expect(result.output).toContain('terminated');
    });

    it('close: returns error when no browser running', async () => {
      const result = await run(close);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('No browser is running');
    });

    it('status: reports not running after close', async () => {
      const result = await run(status);
      assertSuccess(result);
      const data = JSON.parse(result.output);
      expect(data.running).toBe(false);
    });
  });
}, 120_000);
