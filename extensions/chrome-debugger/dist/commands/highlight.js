import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/connection.ts
import puppeteer from "puppeteer";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
}
function getStatePath(projectPath) {
  return join(getStorageDir(projectPath), "state.json");
}
function readState(projectPath) {
  const statePath = getStatePath(projectPath);
  if (!existsSync(statePath)) return null;
  const raw = readFileSync(statePath, "utf-8");
  return JSON.parse(raw);
}
function ensureBrowserRunning(projectPath) {
  const state = readState(projectPath);
  if (!state) {
    throw new Error(
      "No browser is running. Start one with: renre-kit chrome-debugger:launch"
    );
  }
  return state;
}

// src/shared/connection.ts
async function connectBrowser(projectPath) {
  const state = ensureBrowserRunning(projectPath);
  return puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
}
async function getActivePage(browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No open tabs found in browser");
  }
  return page;
}
async function withBrowser(projectPath, fn) {
  const browser = await connectBrowser(projectPath);
  try {
    const page = await getActivePage(browser);
    return await fn(browser, page);
  } finally {
    void browser.disconnect();
  }
}

// src/commands/highlight.ts
async function highlight(context) {
  const selector = context.args.selector;
  if (typeof selector !== "string" || selector.length === 0) {
    return { output: "Error: --selector is required", exitCode: 1 };
  }
  const duration = typeof context.args.duration === "number" ? context.args.duration : 3e3;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    await client.send("DOM.enable");
    await client.send("Overlay.enable");
    const { root } = await client.send("DOM.getDocument");
    const { nodeId } = await client.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector
    });
    if (nodeId === 0) {
      return {
        output: `No element found for selector: \`${selector}\``,
        exitCode: 1
      };
    }
    await client.send("Overlay.highlightNode", {
      nodeId,
      highlightConfig: {
        showInfo: true,
        showStyles: true,
        showAccessibilityInfo: true,
        contentColor: { r: 111, g: 168, b: 220, a: 0.66 },
        paddingColor: { r: 147, g: 196, b: 125, a: 0.55 },
        borderColor: { r: 255, g: 229, b: 153, a: 0.66 },
        marginColor: { r: 246, g: 178, b: 107, a: 0.66 }
      }
    });
    await new Promise((resolve) => setTimeout(resolve, duration));
    await client.send("Overlay.hideHighlight");
    return {
      output: [
        `## Highlighted: \`${selector}\``,
        "",
        `Element was highlighted for ${String(duration / 1e3)}s in the browser.`
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  highlight as default
};
