import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.logger.info('Initializing file-editor extension');
}

export function onDestroy(context: HookContext): void {
  context.sdk.logger.info('Destroying file-editor extension');
}
