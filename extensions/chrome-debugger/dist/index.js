import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import "./chunks/chunk-C3C6F2UY.js";

// src/index.ts
function onInit(context) {
  context.sdk.logger.info("Initializing chrome-debugger extension");
  context.sdk.deployAgentAssets();
}
function onDestroy(context) {
  context.sdk.logger.info("Destroying chrome-debugger extension");
  context.sdk.cleanupAgentAssets();
}
export {
  onDestroy,
  onInit
};
