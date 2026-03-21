import type { SchemaMigration } from '../../../shared/schema-migration.js';

import { configV0toV1 } from './v0-to-v1.js';

export const configMigrations: SchemaMigration[] = [configV0toV1];
