import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import type { Page, ElementHandle } from 'puppeteer';
import { z } from 'zod';

import { withBrowser } from '../shared/connection.js';
import { getScreenshotDir } from '../shared/state.js';
import type { ExecutionContext, CommandResult, ScreenshotMeta } from '../shared/types.js';

export const argsSchema = z.object({
  selector: z.string().nullable().default(null),
  'full-page': z.boolean().default(false),
  fullPage: z.boolean().default(false),
  output: z.string().nullable().default(null),
  encoded: z.boolean().default(false),
  dir: z.string().nullable().default(null),
});

type Args = z.infer<typeof argsSchema>;

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function captureEncoded(
  page: Page,
  element: ElementHandle | null,
  selector: string | null,
  fullPage: boolean
): Promise<CommandResult> {
  const label = selector ? `Screenshot: \`${selector}\`` : 'Screenshot (full page)';
  const base64 = element
    ? await element.screenshot({ encoding: 'base64' })
    : await page.screenshot({ encoding: 'base64', fullPage });
  return {
    output: [`## ${label}`, '', `\`data:image/png;base64,${base64}\``].join('\n'),
    exitCode: 0,
  };
}

function registerMeta(screenshotDir: string, filePath: string, page: Page, selector: string | null, fullPage: boolean): void {
  const metaPath = join(screenshotDir, 'screenshots.jsonl');
  const meta: ScreenshotMeta = {
    filename: basename(filePath),
    path: filePath,
    timestamp: new Date().toISOString(),
    url: page.url(),
    selector,
    fullPage,
  };
  if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
  }
  appendFileSync(metaPath, JSON.stringify(meta) + '\n');
}

export default async function screenshot(context: ExecutionContext): Promise<CommandResult> {
  const args = context.args as Args;
  const selector = args.selector;
  const fullPage = args['full-page'] || args.fullPage;
  const output = args.output;
  const encoded = args.encoded;
  const dir = args.dir;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const element = selector ? await page.$(selector) : null;
    if (selector && !element) {
      return { output: `No element found for selector: \`${selector}\``, exitCode: 1 };
    }

    if (encoded) {
      return captureEncoded(page, element, selector, fullPage);
    }

    const screenshotDir = dir ?? getScreenshotDir(context.projectPath);
    const filePath = output ?? join(screenshotDir, `screenshot-${String(Date.now())}.png`);
    ensureDir(filePath);

    await (element
      ? element.screenshot({ path: filePath })
      : page.screenshot({ path: filePath, fullPage }));

    registerMeta(screenshotDir, filePath, page, selector, fullPage);

    return {
      output: [
        '## Screenshot Saved',
        '',
        `- **Path**: \`${filePath}\``,
        `- **Selector**: ${selector ?? 'full page'}`,
        `- **Full page**: ${fullPage ? 'yes' : 'no'}`,
      ].join('\n'),
      exitCode: 0,
    };
  });
}
