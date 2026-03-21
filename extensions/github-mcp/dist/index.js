import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/index.ts
function onInit(context) {
  context.sdk.deployAgentAssets();
}
function onDestroy(context) {
  context.sdk.cleanupAgentAssets();
}
export {
  onDestroy,
  onInit
};
