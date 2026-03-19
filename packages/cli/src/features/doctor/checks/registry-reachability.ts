import { loadGlobalConfig } from '../../config/config-manager.js';
import type { DiagnosticCheck } from '../types.js';

export const registryReachabilityCheck: DiagnosticCheck = {
  name: 'Registry reachability',
  run: async () => {
    const config = loadGlobalConfig();
    const registries = config.registries;

    if (registries.length === 0) {
      return {
        name: 'Registry reachability',
        status: 'warn',
        message: 'no registries configured',
      };
    }

    const results: Array<{ name: string; ok: boolean; ms: number }> = [];

    for (const registry of registries) {
      const start = Date.now();
      try {
        await fetch(registry.url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });
        results.push({ name: registry.name, ok: true, ms: Date.now() - start });
      } catch {
        results.push({ name: registry.name, ok: false, ms: Date.now() - start });
      }
    }

    const allFailed = results.every((r) => !r.ok);
    if (allFailed) {
      return {
        name: 'Registry reachability',
        status: 'fail',
        message: 'all registries unreachable',
        detail: results.map((r) => `${r.name}: unreachable`).join(', '),
      };
    }

    const slow = results.filter((r) => r.ok && r.ms > 2000);
    if (slow.length > 0) {
      const details = slow
        .map((r) => r.name + ' responded in ' + (r.ms / 1000).toFixed(1) + 's')
        .join(', ');
      return {
        name: 'Registry reachability',
        status: 'warn',
        message: details + ' (slow)',
      };
    }

    return {
      name: 'Registry reachability',
      status: 'pass',
      message: `${results.filter((r) => r.ok).length} registry(ies) reachable`,
    };
  },
};
