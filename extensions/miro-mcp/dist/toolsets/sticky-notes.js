import { createCrudToolset } from './crud-factory.js';
export function createStickyNotesToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_sticky_notes',
        resourceName: 'sticky note',
        toolPrefix: 'miro',
        resourceSlug: 'sticky_note',
        methodPrefix: 'StickyNote',
        apiPath: 'sticky_notes',
    }, client);
}
