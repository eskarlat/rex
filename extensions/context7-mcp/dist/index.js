export function onInit(context) {
    context.sdk.deployAgentAssets();
}
export function onDestroy(context) {
    context.sdk.cleanupAgentAssets();
}
