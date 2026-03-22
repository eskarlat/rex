import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  withBrowser
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
import "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

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
