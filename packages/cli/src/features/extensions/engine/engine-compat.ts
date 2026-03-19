import semver from 'semver';
import type { ExtensionManifest } from '../types/extension.types.js';

export interface CompatResult {
  compatible: boolean;
  issues: string[];
}

export function checkEngineCompat(
  manifest: ExtensionManifest,
  coreVersion: string,
  sdkVersion: string,
): CompatResult {
  const engines = manifest.engines;
  if (!engines) {
    return { compatible: true, issues: [] };
  }

  const issues: string[] = [];

  if (engines['renre-kit'] && !semver.satisfies(coreVersion, engines['renre-kit'])) {
    issues.push(
      `Extension "${manifest.name}" requires renre-kit ${engines['renre-kit']}, but current version is ${coreVersion}`,
    );
  }

  if (engines['extension-sdk'] && !semver.satisfies(sdkVersion, engines['extension-sdk'])) {
    issues.push(
      `Extension "${manifest.name}" requires extension-sdk ${engines['extension-sdk']}, but current version is ${sdkVersion}`,
    );
  }

  return { compatible: issues.length === 0, issues };
}
