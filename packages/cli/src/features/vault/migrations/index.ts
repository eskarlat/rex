import type { SchemaMigration } from '../../../shared/schema-migration.js';

import { vaultV0toV1 } from './v0-to-v1.js';

export const vaultMigrations: SchemaMigration[] = [vaultV0toV1];
