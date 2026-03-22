import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.logger.info('Initializing agent-browser extension');
  context.sdk.deployAgentAssets();
}

export function onDestroy(context: HookContext): void {
  context.sdk.logger.info('Destroying agent-browser extension');
  context.sdk.cleanupAgentAssets();
}
