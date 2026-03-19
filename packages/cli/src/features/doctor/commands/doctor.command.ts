import * as clack from '@clack/prompts';
import { getAllChecks } from '../checks/index.js';
import type { DiagnosticResult } from '../types.js';

const STATUS_ICONS: Record<string, string> = {
  pass: '\u2713',
  warn: '!',
  fail: '\u2717',
};

export async function handleDoctor(
  projectPath: string | null,
  getActivated: () => Record<string, string>,
): Promise<void> {
  clack.intro('renre-kit doctor');

  const checks = getAllChecks(projectPath, getActivated);
  const results: DiagnosticResult[] = [];

  for (const check of checks) {
    const result = await check.run();
    results.push(result);

    const icon = STATUS_ICONS[result.status] ?? '?';
    const line = `${icon} ${result.name}: ${result.message}`;

    if (result.status === 'pass') {
      clack.log.success(line);
    } else if (result.status === 'warn') {
      clack.log.warn(line);
      if (result.detail) {
        clack.log.info(`  \u2192 ${result.detail}`);
      }
    } else {
      clack.log.error(line);
      if (result.detail) {
        clack.log.info(`  \u2192 ${result.detail}`);
      }
    }
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const warnings = results.filter((r) => r.status === 'warn').length;
  const failures = results.filter((r) => r.status === 'fail').length;

  clack.outro(`${passed} passed, ${warnings} warning(s), ${failures} failure(s)`);

  if (failures > 0) {
    process.exitCode = 1;
  }
}
