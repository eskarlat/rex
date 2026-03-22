import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getSelectedElementInfo
} from "../chunks/chunk-V26XA6TS.js";
import {
  markdownCodeBlock,
  markdownTable,
  truncate
} from "../chunks/chunk-RMALWN2J.js";
import {
  connectBrowser,
  getActivePage
} from "../chunks/chunk-EEGYRSU4.js";
import "../chunks/chunk-AT5YMNYW.js";
import "../chunks/chunk-YGOXEHOS.js";
import "../chunks/chunk-A7XEC37O.js";
import "../chunks/chunk-ICGADTKU.js";
import "../chunks/chunk-WWTA3VPD.js";
import "../chunks/chunk-FOU2EXQ2.js";
import "../chunks/chunk-LOYEZFXG.js";
import "../chunks/chunk-AWU4Q6CL.js";
import "../chunks/chunk-BF5SUUWU.js";
import {
  ensureBrowserRunning,
  readState
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/selected.ts
async function selected(context) {
  ensureBrowserRunning(context.projectPath);
  const state = readState(context.projectPath);
  if (!state?.selectedElement) {
    return {
      output: [
        "## No Element Selected",
        "",
        "Use `chrome-debugger:inspect` to pick an element from the browser,",
        'or use `chrome-debugger:select --selector "..."` to query elements.'
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
          "Use `chrome-debugger:inspect` to pick a new element."
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
    const MAX_HTML_LENGTH = 500;
    const trimmedHTML = info.html.length >= MAX_HTML_LENGTH ? info.html.slice(0, MAX_HTML_LENGTH) + "\n<!-- truncated -->" : info.html;
    lines.push("", "### HTML", "", markdownCodeBlock(trimmedHTML, "html"));
    lines.push(
      "",
      "### Actions",
      "",
      `- \`chrome-debugger:click --selector "${selectedElement.selector}"\``,
      `- \`chrome-debugger:type --selector "${selectedElement.selector}" --text "..."\``,
      `- \`chrome-debugger:styles --selector "${selectedElement.selector}"\``,
      `- \`chrome-debugger:highlight --selector "${selectedElement.selector}"\``,
      `- \`chrome-debugger:dom --selector "${selectedElement.selector}" --depth 3\``
    );
    return { output: lines.join("\n"), exitCode: 0 };
  } finally {
    void browser.disconnect();
  }
}
export {
  selected as default
};
