import type { DiagnosticCheck } from '../types.js';
import { nodeVersionCheck } from './node-version.js';
import { globalDirectoryCheck } from './global-directory.js';
import { databaseCheck } from './database.js';
import { schemaStatusCheck } from './schema-status.js';
import { configValidCheck } from './config-valid.js';
import { vaultValidCheck } from './vault-valid.js';
import { vaultKeyCheck } from './vault-key.js';
import { extensionManifestsCheck } from './extension-manifests.js';
import { createEngineConstraintsCheck } from './engine-constraints.js';
import { registryReachabilityCheck } from './registry-reachability.js';

export function getAllChecks(
  projectPath: string | null,
  getActivated: () => Record<string, string>,
): DiagnosticCheck[] {
  return [
    nodeVersionCheck,
    globalDirectoryCheck,
    databaseCheck,
    schemaStatusCheck,
    configValidCheck,
    vaultValidCheck,
    vaultKeyCheck,
    extensionManifestsCheck,
    createEngineConstraintsCheck(projectPath, getActivated),
    registryReachabilityCheck,
  ];
}
