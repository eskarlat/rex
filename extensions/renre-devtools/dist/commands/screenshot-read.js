import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/screenshot-read.ts
import { existsSync, readFileSync } from "node:fs";
function screenshotRead(context) {
  const filePath = typeof context.args.path === "string" ? context.args.path : null;
  if (!filePath) {
    return {
      output: JSON.stringify({ error: "Missing --path argument" }),
      exitCode: 1
    };
  }
  if (!existsSync(filePath)) {
    return {
      output: JSON.stringify({ error: `File not found: ${filePath}` }),
      exitCode: 1
    };
  }
  const buffer = readFileSync(filePath);
  const base64 = buffer.toString("base64");
  return {
    output: JSON.stringify({
      dataUrl: `data:image/png;base64,${base64}`
    }),
    exitCode: 0
  };
}
export {
  screenshotRead as default
};
