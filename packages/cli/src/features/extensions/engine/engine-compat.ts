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
  const issues: string[] = [];

  if (!semver.satisfies(coreVersion, manifest.engines['renre-kit'])) {
    issues.push(
      `Extension "${manifest.name}" requires renre-kit ${manifest.engines['renre-kit']}, but current version is ${coreVersion}`,
    );
  }

  if (!semver.satisfies(sdkVersion, manifest.engines['extension-sdk'])) {
    issues.push(
      `Extension "${manifest.name}" requires extension-sdk ${manifest.engines['extension-sdk']}, but current version is ${sdkVersion}`,
    );
  }

  return { compatible: issues.length === 0, issues };
}
