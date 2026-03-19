import { existsSync } from 'node:fs';
import { getExtensionDir } from '../../../core/paths/paths.js';
import { checkEngineCompat } from '../../extensions/engine/engine-compat.js';
import { loadManifest } from '../../extensions/manifest/manifest-loader.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';
import type { DiagnosticCheck } from '../types.js';

export function createEngineConstraintsCheck(
  projectPath: string | null,
  getActivated: () => Record<string, string>,
): DiagnosticCheck {
  return {
    name: 'Engine constraints',
    run: () => {
      if (!projectPath) {
        return {
          name: 'Engine constraints',
          status: 'pass',
          message: 'skipped (not in a project directory)',
        };
      }

      const plugins = getActivated();
      const entries = Object.entries(plugins);
      if (entries.length === 0) {
        return {
          name: 'Engine constraints',
          status: 'pass',
          message: 'no activated extensions',
        };
      }

      const issues: string[] = [];
      for (const [name, version] of entries) {
        if (!version) continue;
        const extDir = getExtensionDir(name, version);
        if (!existsSync(extDir)) continue;

        try {
          const manifest = loadManifest(extDir);
          const compat = checkEngineCompat(manifest, CLI_VERSION, SDK_VERSION);
          if (!compat.compatible) {
            issues.push(...compat.issues);
          }
        } catch {
          // Skip extensions with broken manifests (handled by check #8)
        }
      }

      if (issues.length === 0) {
        return {
          name: 'Engine constraints',
          status: 'pass',
          message: 'all satisfied',
        };
      }
      return {
        name: 'Engine constraints',
        status: 'fail',
        message: `${issues.length} constraint(s) not met`,
        detail: issues.join('\n'),
      };
    },
  };
}
