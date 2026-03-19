import path from 'node:path';
import { deployAgentAssets, cleanupAgentAssets } from '@renre-kit/extension-sdk/node';

interface HookContext {
  projectDir: string;
}

function getExtensionDir(): string {
  return path.resolve(import.meta.dirname, '..');
}

export function onInit(context: HookContext): void {
  deployAgentAssets(getExtensionDir(), context.projectDir);
}

export function onDestroy(context: HookContext): void {
  cleanupAgentAssets(getExtensionDir(), context.projectDir);
}
