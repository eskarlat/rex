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

// src/shared/browser-scripts.ts
function getSelectedElementInfo(sel) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList).join(" "),
    text: (el.textContent ?? "").trim().slice(0, 200),
    html: el.outerHTML.slice(0, 500),
    attrs: Array.from(el.attributes).map((a) => ({
      name: a.name,
      value: a.value
    })),
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    styles: {
      display: cs.display,
      position: cs.position,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight
    },
    childCount: el.children.length,
    visible: rect.width > 0 && rect.height > 0
  };
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
function markdownCodeBlock(content, lang = "") {
  return `\`\`\`${lang}
${content}
\`\`\``;
}
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// src/commands/selected.ts
async function selected(context) {
  ensureBrowserRunning(context.projectPath);
  const state = readState(context.projectPath);
  if (!state?.selectedElement) {
    return {
      output: [
        "## No Element Selected",
        "",
        "Use `renre-devtools:inspect` to pick an element from the browser,",
        'or use `renre-devtools:select --selector "..."` to query elements.'
      ].join("\n"),
      exitCode: 1
    };
  }
  const { selectedElement } = state;
  const browser = await connectBrowser(context.projectPath);
  try {
    const page = await getActivePage(browser);
    const info = await page.evaluate(getSelectedElementInfo, selectedElement.selector);
    if (!info) {
      return {
        output: [
          "## Selected Element No Longer Found",
          "",
          `The element \`${selectedElement.selector}\` was selected at ${selectedElement.timestamp}`,
          "but can no longer be found on the page. The page may have changed.",
          "",
          "Use `renre-devtools:inspect` to pick a new element."
        ].join("\n"),
        exitCode: 1
      };
    }
    const lines = [
      "## Selected Element",
      "",
      `- **Selector**: \`${selectedElement.selector}\``,
      `- **Tag**: \`<${info.tag}>\``,
      `- **Size**: ${String(info.rect.width)} x ${String(info.rect.height)}px`,
      `- **Position**: (${String(info.rect.x)}, ${String(info.rect.y)})`,
      `- **Visible**: ${info.visible ? "yes" : "no"}`,
      `- **Children**: ${String(info.childCount)}`
    ];
    if (info.id) lines.push(`- **ID**: ${info.id}`);
    if (info.classes) lines.push(`- **Classes**: ${info.classes}`);
    if (info.text) lines.push(`- **Text**: ${truncate(info.text, 100)}`);
    if (info.attrs.length > 0) {
      lines.push("", "### Attributes", "");
      const attrRows = info.attrs.map((a) => [a.name, truncate(a.value, 60)]);
      lines.push(markdownTable(["Attribute", "Value"], attrRows));
    }
    lines.push("", "### Computed Styles", "");
    const styleRows = Object.entries(info.styles).filter(([, v]) => v !== "" && v !== "none").map(([k, v]) => [k, v]);
    lines.push(markdownTable(["Property", "Value"], styleRows));
    const trimmedHTML = info.html.length >= 500 ? info.html + "\n<!-- truncated -->" : info.html;
    lines.push("", "### HTML", "", markdownCodeBlock(trimmedHTML, "html"));
    lines.push(
      "",
      "### Actions",
      "",
      `- \`renre-devtools:click --selector "${selectedElement.selector}"\``,
      `- \`renre-devtools:type --selector "${selectedElement.selector}" --text "..."\``,
      `- \`renre-devtools:styles --selector "${selectedElement.selector}"\``,
      `- \`renre-devtools:highlight --selector "${selectedElement.selector}"\``,
      `- \`renre-devtools:dom --selector "${selectedElement.selector}" --depth 3\``
    );
    return { output: lines.join("\n"), exitCode: 0 };
  } finally {
    void browser.disconnect();
  }
}
export {
  selected as default
};
