import { createCrudToolset } from './crud-factory.js';
export function createAppCardsToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_app_cards',
        resourceName: 'app card',
        toolPrefix: 'miro',
        resourceSlug: 'app_card',
        methodPrefix: 'AppCard',
        apiPath: 'app_cards',
    }, client);
}
