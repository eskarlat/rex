import { createCrudToolset } from './crud-factory.js';
export function createTextToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_text',
        resourceName: 'text item',
        toolPrefix: 'miro',
        resourceSlug: 'text',
        methodPrefix: 'Text',
        apiPath: 'texts',
    }, client);
}
