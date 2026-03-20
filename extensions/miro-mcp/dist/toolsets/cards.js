import { createCrudToolset } from './crud-factory.js';
export function createCardsToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_cards',
        resourceName: 'card',
        toolPrefix: 'miro',
        resourceSlug: 'card',
        methodPrefix: 'Card',
        apiPath: 'cards',
    }, client);
}
