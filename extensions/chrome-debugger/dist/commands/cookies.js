import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  markdownTable,
  truncate
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
