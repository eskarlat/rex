export function onInit(context) {
    context.sdk.logger.info('Initializing hello-world extension');
    context.sdk.deployAgentAssets();
}
export function onDestroy(context) {
    context.sdk.logger.info('Destroying hello-world extension');
    context.sdk.cleanupAgentAssets();
}
