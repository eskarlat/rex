import path from 'node:path';
import { deployAgentAssets, cleanupAgentAssets } from '@renre-kit/extension-sdk/node';
function getExtensionDir() {
    return path.resolve(import.meta.dirname, '..');
}
export function onInit(context) {
    deployAgentAssets(getExtensionDir(), context.projectDir, context.agentDir);
}
export function onDestroy(context) {
    cleanupAgentAssets(getExtensionDir(), context.projectDir, context.agentDir);
}
