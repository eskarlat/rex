import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.logger.info('Initializing hello-world extension');
  context.sdk.deployAgentAssets();
}

export function onDestroy(context: HookContext): void {
  context.sdk.logger.info('Destroying hello-world extension');
  context.sdk.cleanupAgentAssets();
}
