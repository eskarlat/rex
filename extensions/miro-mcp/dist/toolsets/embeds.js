import { createCrudToolset } from './crud-factory.js';
export function createEmbedsToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_embeds',
        resourceName: 'embed',
        toolPrefix: 'miro',
        resourceSlug: 'embed',
        methodPrefix: 'Embed',
        apiPath: 'embeds',
    }, client);
}
