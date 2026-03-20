import { createCrudToolset } from './crud-factory.js';
export function createDocumentsToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_documents',
        resourceName: 'document',
        toolPrefix: 'miro',
        resourceSlug: 'document',
        methodPrefix: 'Document',
        apiPath: 'documents',
    }, client);
}
