import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.deployAgentAssets();
}

export function onDestroy(context: HookContext): void {
  context.sdk.cleanupAgentAssets();
}
