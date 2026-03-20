import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.deployAgentAssets(context.extensionDir, context.projectDir, context.agentDir);
}

export function onDestroy(context: HookContext): void {
  context.sdk.cleanupAgentAssets(context.extensionDir, context.projectDir, context.agentDir);
}
