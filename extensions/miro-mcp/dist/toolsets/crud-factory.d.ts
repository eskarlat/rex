import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
interface CrudConfig {
    /** Toolset name, e.g. 'miro_sticky_notes' */
    toolsetName: string;
    /** Human-readable resource name, e.g. 'sticky note' */
    resourceName: string;
    /** Tool name prefix, e.g. 'miro' */
    toolPrefix: string;
    /** Resource slug for tool names, e.g. 'sticky_note' */
    resourceSlug: string;
    /** Client method prefix, e.g. 'StickyNote' → createStickyNote, getStickyNote, etc. */
    methodPrefix: string;
    /** API resource path segment, e.g. 'sticky_notes' */
    apiPath: string;
    /** Additional input properties for create/update */
    dataDescription?: string;
}
export declare function createCrudToolset(config: CrudConfig, client: MiroClient): Toolset;
export {};
