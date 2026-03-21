import semver from 'semver';

import type { ExtensionManifest, PartialEngineConstraints } from '../types/extension.types.js';

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

  const coreRange = manifest.engines['renre-kit'];
  const sdkRange = manifest.engines['extension-sdk'];

  if (!semver.validRange(coreRange)) {
    issues.push(
      `Extension "${manifest.name}" has invalid renre-kit engine constraint: "${coreRange}"`,
    );
  } else if (!semver.satisfies(coreVersion, coreRange)) {
    issues.push(
      `Extension "${manifest.name}" requires renre-kit ${coreRange}, but current version is ${coreVersion}`,
    );
  }

  if (!semver.validRange(sdkRange)) {
    issues.push(
      `Extension "${manifest.name}" has invalid extension-sdk engine constraint: "${sdkRange}"`,
    );
  } else if (!semver.satisfies(sdkVersion, sdkRange)) {
    issues.push(
      `Extension "${manifest.name}" requires extension-sdk ${sdkRange}, but current version is ${sdkVersion}`,
    );
  }

  return { compatible: issues.length === 0, issues };
}

export function checkEngineConstraints(
  engines: PartialEngineConstraints | undefined,
  coreVersion: string,
  sdkVersion: string,
): CompatResult {
  if (!engines) return { compatible: true, issues: [] };

  const issues: string[] = [];

  const coreRange = engines['renre-kit'];
  if (coreRange) {
    if (!semver.validRange(coreRange)) {
      issues.push(`Invalid renre-kit engine constraint: "${coreRange}"`);
    } else if (!semver.satisfies(coreVersion, coreRange)) {
      issues.push(`Requires renre-kit ${coreRange}, current is ${coreVersion}`);
    }
  }

  const sdkRange = engines['extension-sdk'];
  if (sdkRange) {
    if (!semver.validRange(sdkRange)) {
      issues.push(`Invalid extension-sdk engine constraint: "${sdkRange}"`);
    } else if (!semver.satisfies(sdkVersion, sdkRange)) {
      issues.push(`Requires extension-sdk ${sdkRange}, current is ${sdkVersion}`);
    }
  }

  return { compatible: issues.length === 0, issues };
}
