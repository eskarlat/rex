import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition, ToolResult } from './types.js';
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

export interface ToolRegistry {
  tools: ToolDefinition[];
  handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}

export function createToolRegistry(client: MiroClient): ToolRegistry {
  const toolsets: Toolset[] = [
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

  const allTools: ToolDefinition[] = [];
  const allHandlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>> = {};

  for (const toolset of toolsets) {
    allTools.push(...toolset.tools);
    Object.assign(allHandlers, toolset.handlers);
  }

  return { tools: allTools, handlers: allHandlers };
}
