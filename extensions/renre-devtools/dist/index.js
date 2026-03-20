export function onInit(context) {
    context.sdk.deployAgentAssets(context.extensionDir, context.projectDir, context.agentDir);
}
export function onDestroy(context) {
    context.sdk.cleanupAgentAssets(context.extensionDir, context.projectDir, context.agentDir);
}
