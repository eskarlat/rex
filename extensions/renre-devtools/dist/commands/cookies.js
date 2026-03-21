import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/connection.ts
import puppeteer from "puppeteer";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "renre-devtools");
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
      "No browser is running. Start one with: renre-kit renre-devtools:launch"
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
    browser.disconnect();
  }
}

// src/shared/formatters.ts
function markdownTable(headers, rows) {
  const separator = headers.map(() => "---");
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ];
  return lines.join("\n");
}
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// src/commands/cookies.ts
async function cookies(context) {
  const domain = typeof context.args.domain === "string" ? context.args.domain : null;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    const { cookies: allCookies } = await client.send("Network.getAllCookies");
    let filtered = allCookies;
    if (domain) {
      filtered = allCookies.filter((c) => c.domain.includes(domain));
    }
    if (filtered.length === 0) {
      return {
        output: domain ? `No cookies found for domain: ${domain}` : "No cookies found.",
        exitCode: 0
      };
    }
    const rows = filtered.map((c) => [
      truncate(c.name, 30),
      truncate(c.value, 40),
      c.domain,
      c.path,
      c.secure ? "yes" : "no",
      c.httpOnly ? "yes" : "no"
    ]);
    const table = markdownTable(
      ["Name", "Value", "Domain", "Path", "Secure", "HttpOnly"],
      rows
    );
    return {
      output: [`## Cookies (${String(filtered.length)})`, "", table].join("\n"),
      exitCode: 0
    };
  });
}
export {
  cookies as default
};
