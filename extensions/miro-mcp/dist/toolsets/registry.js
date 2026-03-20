import { createBoardsToolset } from './boards.js';
import { createItemsToolset } from './items.js';
import { createBulkToolset } from './bulk.js';
import { createAppCardsToolset } from './app-cards.js';
import { createCardsToolset } from './cards.js';
import { createStickyNotesToolset } from './sticky-notes.js';
import { createFramesToolset } from './frames.js';
import { createDocumentsToolset } from './documents.js';
import { createTextToolset } from './text.js';
import { createImagesToolset } from './images.js';
import { createShapesToolset } from './shapes.js';
import { createEmbedsToolset } from './embeds.js';
import { createConnectorsToolset } from './connectors.js';
import { createTagsToolset } from './tags.js';
import { createMembersToolset } from './members.js';
import { createGroupsToolset } from './groups.js';
import { createMindmapsToolset } from './mindmaps.js';
import { createProjectsToolset } from './projects.js';
import { createExportsToolset } from './exports.js';
import { createComplianceToolset } from './compliance.js';
import { createOrganizationToolset } from './organization.js';
export function createToolRegistry(client) {
    const toolsets = [
        createBoardsToolset(client),
        createItemsToolset(client),
        createBulkToolset(client),
        createAppCardsToolset(client),
        createCardsToolset(client),
        createStickyNotesToolset(client),
        createFramesToolset(client),
        createDocumentsToolset(client),
        createTextToolset(client),
        createImagesToolset(client),
        createShapesToolset(client),
        createEmbedsToolset(client),
        createConnectorsToolset(client),
        createTagsToolset(client),
        createMembersToolset(client),
        createGroupsToolset(client),
        createMindmapsToolset(client),
        createProjectsToolset(client),
        createExportsToolset(client),
        createComplianceToolset(client),
        createOrganizationToolset(client),
    ];
    const allTools = [];
    const allHandlers = {};
    for (const toolset of toolsets) {
        allTools.push(...toolset.tools);
        Object.assign(allHandlers, toolset.handlers);
    }
    return { tools: allTools, handlers: allHandlers };
}
