import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/index.ts
function onInit(context) {
  context.sdk.logger.info("Initializing hello-world extension");
  context.sdk.deployAgentAssets();
}
function onDestroy(context) {
  context.sdk.logger.info("Destroying hello-world extension");
  context.sdk.cleanupAgentAssets();
}
export {
  onDestroy,
  onInit
};
