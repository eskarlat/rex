import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.logger.info('Initializing renre-devtools extension');
  context.sdk.deployAgentAssets();
}

export function onDestroy(context: HookContext): void {
  context.sdk.logger.info('Destroying renre-devtools extension');
  context.sdk.cleanupAgentAssets();
}
