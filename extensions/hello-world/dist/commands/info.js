import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/info.ts
function info() {
  return {
    output: "hello-world v1.0.0 \u2014 A simple hello world extension for RenreKit",
    exitCode: 0
  };
}
export {
  info as default
};
