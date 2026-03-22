import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  markdownCodeBlock
} from "../chunks/chunk-RMALWN2J.js";
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

// src/commands/a11y.ts
async function a11y(context) {
  const selector = typeof context.args.selector === "string" ? context.args.selector : null;
  const depth = typeof context.args.depth === "number" ? context.args.depth : 5;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    const params = {};
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1
        };
      }
      const { node } = await client.send("DOM.describeNode", {
        objectId: element.remoteObject().objectId
      });
      params.backendNodeId = node.backendNodeId;
      params.depth = depth;
    } else {
      params.depth = depth;
    }
    const { nodes } = await client.send("Accessibility.getFullAXTree", params);
    const lines = [];
    function renderNode(node, indent) {
      if (node.ignored) return;
      const role = node.role?.value ?? "unknown";
      const name = node.name?.value ?? "";
      const prefix = "  ".repeat(indent);
      const label = name ? `${role} "${name}"` : role;
      lines.push(`${prefix}- ${label}`);
      if (node.children) {
        for (const child of node.children) {
          renderNode(child, indent + 1);
        }
      }
    }
    for (const node of nodes.slice(0, 1)) {
      renderNode(node, 0);
    }
    const tree = lines.length > 0 ? lines.join("\n") : "Empty accessibility tree";
    const title = selector ? `Accessibility Tree: \`${selector}\`` : "Accessibility Tree";
    return {
      output: [`## ${title}`, "", markdownCodeBlock(tree)].join("\n"),
      exitCode: 0
    };
  });
}
export {
  a11y as default
};
